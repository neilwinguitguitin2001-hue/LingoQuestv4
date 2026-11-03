import {
  VOICE_PERSONAS,
  type PlaybackSpeed,
  type VoicePersonaId,
} from '../data/voiceConfig.ts';
import {
  buildSegmentSSML,
  computeWordTimestamps,
  prepareSpokenTextForTTS,
  type ProsodyRole,
  type WordTimestamp,
} from './ssmlBuilder.ts';

export interface SynthesizedSegmentResult {
  audioUrl: string | null;
  provider: string;
  cached: boolean;
  durationMs: number;
  timestamps: WordTimestamp[];
  ssml: string;
  preparedSpokenText: string;
}

// Client-side memory cache keyed by `${personaId}::${prosodyRole}::${spokenText}`
const clientSegmentCache = new Map<string, SynthesizedSegmentResult>();

/**
 * Selects the best local SpeechSynthesisVoice matching the persona's language and name preferences.
 */
export function selectBestBrowserVoice(personaId: VoicePersonaId): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.ate_rosa_ph;
  const { preferredLangs, preferredNameKeywords } = persona.fallbackSpeechConfig;

  // 1. Look for a Philippine English (en-PH / fil-PH) voice first
  for (const lang of preferredLangs.slice(0, 2)) {
    const phVoice = voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (phVoice) return phVoice;
  }

  // 2. Look for high-quality Neural/Natural voice matching preferred name keywords
  for (const kw of preferredNameKeywords) {
    const matched = voices.find(
      (v) =>
        v.name.toLowerCase().includes(kw.toLowerCase()) &&
        v.lang.toLowerCase().startsWith('en')
    );
    if (matched) return matched;
  }

  // 3. Fallback to any English voice
  return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
}

/**
 * Fetches or retrieves from cache the synthesized neural audio + word timestamps for a segment.
 */
export async function fetchOrSynthesizeSegment(params: {
  segmentId: string;
  spokenText: string;
  displayText: string;
  personaId: VoicePersonaId;
  prosodyRole?: ProsodyRole;
  keyTerms?: string[];
  dataSaver?: boolean;
}): Promise<SynthesizedSegmentResult> {
  const {
    segmentId,
    spokenText,
    displayText,
    personaId,
    prosodyRole = 'definition',
    keyTerms = [],
    dataSaver = false,
  } = params;

  const preparedSpokenText = prepareSpokenTextForTTS(spokenText);
  const cacheKey = `${personaId}::${prosodyRole}::${preparedSpokenText}`;

  if (clientSegmentCache.has(cacheKey)) {
    return clientSegmentCache.get(cacheKey)!;
  }

  const fallbackTimestamps = computeWordTimestamps(displayText || spokenText, keyTerms);
  const fallbackSsml = buildSegmentSSML({
    spokenText,
    role: prosodyRole,
    keyTerms,
    personaId,
  });

  // In Data Saver mode, skip network audio download unless already cached locally
  if (dataSaver) {
    return {
      audioUrl: null,
      provider: 'data_saver_local_voice',
      cached: false,
      durationMs: fallbackTimestamps[fallbackTimestamps.length - 1]?.endMs || 4500,
      timestamps: fallbackTimestamps,
      ssml: fallbackSsml,
      preparedSpokenText,
    };
  }

  try {
    const resp = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segmentId,
        spokenText,
        displayText,
        personaId,
        prosodyRole,
        keyTerms,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const result: SynthesizedSegmentResult = {
        audioUrl: data.audioUrl || null,
        provider: data.provider || 'gemini_3_8_neural_tts',
        cached: Boolean(data.cached),
        durationMs:
          data.durationMs ||
          fallbackTimestamps[fallbackTimestamps.length - 1]?.endMs ||
          4500,
        timestamps: data.timestamps || fallbackTimestamps,
        ssml: data.ssml || fallbackSsml,
        preparedSpokenText: data.preparedSpokenText || preparedSpokenText,
      };
      clientSegmentCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Offline or server busy -> graceful fallback below
  }

  const fallbackResult: SynthesizedSegmentResult = {
    audioUrl: null,
    provider: 'browser_speech_fallback',
    cached: false,
    durationMs: fallbackTimestamps[fallbackTimestamps.length - 1]?.endMs || 4500,
    timestamps: fallbackTimestamps,
    ssml: fallbackSsml,
    preparedSpokenText,
  };
  return fallbackResult;
}

/**
 * Preloads the next segment in the background (without preloading the entire lesson)
 * so transitions between segments are instantaneous.
 */
export function preloadNextSegment(params: {
  segmentId: string;
  spokenText: string;
  displayText: string;
  personaId: VoicePersonaId;
  prosodyRole?: ProsodyRole;
  keyTerms?: string[];
  dataSaver?: boolean;
}): void {
  if (params.dataSaver) return;
  void fetchOrSynthesizeSegment(params).then((res) => {
    if (res.audioUrl && typeof Audio !== 'undefined') {
      const preloadAudio = new Audio();
      preloadAudio.preload = 'auto';
      preloadAudio.src = res.audioUrl;
    }
  });
}

// Singleton active audio reference so two voice players never overlap
let activeHtmlAudio: HTMLAudioElement | null = null;
let activeFadeInterval: number | null = null;

export function stopAllVoicePlayback(): void {
  if (activeFadeInterval && typeof window !== 'undefined') {
    window.clearInterval(activeFadeInterval);
    activeFadeInterval = null;
  }
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {}
    activeHtmlAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Gently fades an HTMLAudioElement volume from startVol to endVol over durationMs
 */
export function fadeHtmlAudio(
  audio: HTMLAudioElement,
  startVol: number,
  endVol: number,
  durationMs = 130,
  onDone?: () => void
): void {
  if (typeof window === 'undefined') {
    audio.volume = Math.max(0, Math.min(1, endVol));
    onDone?.();
    return;
  }
  if (activeFadeInterval) {
    window.clearInterval(activeFadeInterval);
    activeFadeInterval = null;
  }
  const steps = 6;
  const stepMs = Math.max(15, Math.floor(durationMs / steps));
  let currentStep = 0;
  audio.volume = Math.max(0, Math.min(1, startVol));

  activeFadeInterval = window.setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;
    const nextVol = startVol + (endVol - startVol) * progress;
    try {
      audio.volume = Math.max(0, Math.min(1, nextVol));
    } catch {}
    if (currentStep >= steps) {
      if (activeFadeInterval) {
        window.clearInterval(activeFadeInterval);
        activeFadeInterval = null;
      }
      onDone?.();
    }
  }, stepMs);
}

/**
 * Quick one-shot pronunciation & sentence reader used by Vocabulary Flip Cards
 * and Explainer slides. Uses neural TTS cache first, then falls back to tuned
 * en-PH / natural browser voice with Davao Oriental phonetic overrides.
 */
export async function speakQuickPassage(options: {
  segmentId: string;
  spokenText: string;
  displayText?: string;
  personaId?: VoicePersonaId;
  prosodyRole?: ProsodyRole;
  speed?: PlaybackSpeed;
  dataSaver?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}): Promise<void> {
  const {
    segmentId,
    spokenText,
    displayText,
    personaId = 'ate_rosa_ph',
    prosodyRole = 'vocab_card',
    speed = 1,
    dataSaver = false,
    onStart,
    onEnd,
  } = options;

  stopAllVoicePlayback();
  onStart?.();

  const synthResult = await fetchOrSynthesizeSegment({
    segmentId,
    spokenText,
    displayText: displayText || spokenText,
    personaId,
    prosodyRole,
    dataSaver,
  });

  if (synthResult.audioUrl && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio(synthResult.audioUrl);
      activeHtmlAudio = audio;
      audio.playbackRate = speed;
      audio.volume = 0.05;
      audio.onended = () => {
        activeHtmlAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        activeHtmlAudio = null;
        speakWithBrowserFallback(synthResult.preparedSpokenText, personaId, speed, onEnd);
      };
      await audio.play();
      fadeHtmlAudio(audio, 0.05, 1.0, 120);
      return;
    } catch {
      // Fall through to tuned browser speechSynthesis
    }
  }

  speakWithBrowserFallback(synthResult.preparedSpokenText, personaId, speed, onEnd);
}

function speakWithBrowserFallback(
  preparedText: string,
  personaId: VoicePersonaId,
  speed: PlaybackSpeed,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  try {
    const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.ate_rosa_ph;
    const utter = new SpeechSynthesisUtterance(preparedText);
    const voice = selectBestBrowserVoice(personaId);
    if (voice) utter.voice = voice;
    utter.rate = Number((persona.fallbackSpeechConfig.rate * speed).toFixed(2));
    utter.pitch = persona.fallbackSpeechConfig.pitch;
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
  } catch {
    onEnd?.();
  }
}
