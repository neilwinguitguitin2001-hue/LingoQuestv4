import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Headphones,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Subtitles,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import type { LessonTabId, SpokenSegment } from '../data/spokenScripts.ts';
import {
  VOICE_PERSONAS,
  loadUserVoicePreferences,
  saveUserVoicePreferences,
  type PlaybackSpeed,
  type UserVoicePreferences,
  type VoicePersonaId,
} from '../data/voiceConfig.ts';
import { soundFX } from '../utils/soundEffects.ts';
import {
  computeWordTimestamps,
  type WordTimestamp,
} from '../utils/ssmlBuilder.ts';
import {
  fadeHtmlAudio,
  fetchOrSynthesizeSegment,
  preloadNextSegment,
  selectBestBrowserVoice,
  stopAllVoicePlayback,
} from '../utils/voiceEngineClient.ts';
import { InabelStrip } from './InabelStrip.tsx';

interface VoicePlayerProps {
  moduleId: string;
  moduleTitle: string;
  activeTab: LessonTabId;
  segments: SpokenSegment[];
  dataSaver: boolean;
  onVisualStepSync?: (stepIndex: number) => void;
  onOpenVoiceQAStudio?: () => void;
  onSegmentFinished?: (segmentId: string) => void;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  moduleId,
  moduleTitle,
  activeTab,
  segments,
  dataSaver,
  onVisualStepSync,
  onOpenVoiceQAStudio,
  onSegmentFinished,
}) => {
  const [prefs, setPrefs] = useState<UserVoicePreferences>(() => loadUserVoicePreferences());
  const [currentSegIdx, setCurrentSegIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [activeProviderLabel, setActiveProviderLabel] = useState<string>('Neural TTS Ready');
  const [currentSsml, setCurrentSsml] = useState<string>('');
  const [showScriptInspector, setShowScriptInspector] = useState<boolean>(false);

  // Track paused progress per tab so students can resume where they left off
  const savedTabProgressRef = useRef<Record<string, { segIdx: number; wasMidway: boolean }>>({});
  const [resumeBannerSegIdx, setResumeBannerSegIdx] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const timestampsRef = useRef<WordTimestamp[]>([]);

  const currentSegment = segments[currentSegIdx] || segments[0];

  const updatePrefs = (patch: Partial<UserVoicePreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveUserVoicePreferences(next);
      return next;
    });
  };

  // Clear timers and stop audio cleanly
  const cleanupPlayback = (recordMidway = false) => {
    if (rafTimerRef.current) {
      window.clearInterval(rafTimerRef.current);
      rafTimerRef.current = null;
    }
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current = null;
    }
    stopAllVoicePlayback();
    setIsPlaying(false);
    setIsLoadingAudio(false);
    if (recordMidway) {
      savedTabProgressRef.current[`${moduleId}:${activeTab}`] = {
        segIdx: currentSegIdx,
        wasMidway: true,
      };
    }
  };

  // Auto-pause on tab change or module change (Audio Etiquette rule)
  useEffect(() => {
    if (isPlaying) {
      cleanupPlayback(true);
    } else {
      cleanupPlayback(false);
    }
    setActiveWordIdx(-1);

    const saved = savedTabProgressRef.current[`${moduleId}:${activeTab}`];
    if (saved && saved.wasMidway && saved.segIdx < segments.length) {
      setCurrentSegIdx(saved.segIdx);
      setResumeBannerSegIdx(saved.segIdx);
    } else {
      setCurrentSegIdx(0);
      setResumeBannerSegIdx(null);
    }
    return () => {
      cleanupPlayback(false);
    };
  }, [moduleId, activeTab]);

  // Recompute word timestamps whenever segment changes
  useEffect(() => {
    if (!currentSegment) return;
    timestampsRef.current = computeWordTimestamps(
      currentSegment.displayText,
      currentSegment.keyTerms
    );
    setActiveWordIdx(-1);
  }, [currentSegment]);

  // Adjust live playback speed if audio is currently playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = prefs.speed;
    }
    if (audioRef.current) {
      audioRef.current.muted = prefs.muted;
    }
  }, [prefs.speed, prefs.muted]);

  const startSegmentPlayback = async (targetIndex: number) => {
    const seg = segments[targetIndex];
    if (!seg) return;

    cleanupPlayback(false);
    setCurrentSegIdx(targetIndex);
    setResumeBannerSegIdx(null);
    setActiveWordIdx(0);

    // Sync with animated visuals if applicable
    if (seg.visualSyncStep !== undefined && onVisualStepSync) {
      onVisualStepSync(seg.visualSyncStep);
    }

    // Choose spoken text (with optional light Taglish/Bisaya warmth if enabled)
    const effectiveSpokenText =
      prefs.enableTaglishTouches && seg.spokenTextTaglish
        ? seg.spokenTextTaglish
        : seg.spokenText;

    // Determine effective voice persona: if segment is specifically 'kuya_lingo' dialogue,
    // use Kuya James unless user explicitly picked Candidate B
    const effectivePersonaId: VoicePersonaId =
      seg.speaker === 'kuya_lingo' && prefs.personaId === 'ate_rosa_ph'
        ? 'kuya_james_ph'
        : prefs.personaId;

    setIsLoadingAudio(true);

    const synthResult = await fetchOrSynthesizeSegment({
      segmentId: seg.id,
      spokenText: effectiveSpokenText,
      displayText: seg.displayText,
      personaId: effectivePersonaId,
      prosodyRole: seg.prosodyRole,
      keyTerms: seg.keyTerms,
      dataSaver,
    });

    timestampsRef.current = synthResult.timestamps;
    setCurrentSsml(synthResult.ssml);
    setIsLoadingAudio(false);
    setIsPlaying(true);

    // Preload ONLY the next segment in the background
    if (targetIndex + 1 < segments.length) {
      const nextSeg = segments[targetIndex + 1];
      const nextSpoken =
        prefs.enableTaglishTouches && nextSeg.spokenTextTaglish
          ? nextSeg.spokenTextTaglish
          : nextSeg.spokenText;
      preloadNextSegment({
        segmentId: nextSeg.id,
        spokenText: nextSpoken,
        displayText: nextSeg.displayText,
        personaId: prefs.personaId,
        prosodyRole: nextSeg.prosodyRole,
        keyTerms: nextSeg.keyTerms,
        dataSaver,
      });
    }

    // Mute mode: run silent karaoke caption timer without audio output
    if (prefs.muted) {
      setActiveProviderLabel('Muted · Karaoke Captions Only');
      runTimerDrivenKaraoke(synthResult.durationMs, targetIndex, seg.id);
      return;
    }

    // Path A: Play pre-generated / cached Neural TTS audio file with gentle fade-in
    if (synthResult.audioUrl && typeof Audio !== 'undefined' && !dataSaver) {
      try {
        const audio = new Audio(synthResult.audioUrl);
        audioRef.current = audio;
        audio.playbackRate = prefs.speed;
        audio.volume = 0.05;

        const providerPretty =
          synthResult.provider === 'azure_neural_en_ph'
            ? 'Azure Neural en-PH'
            : synthResult.provider === 'gemini_3_8_neural_tts'
            ? synthResult.cached
              ? 'Gemini 3.8 Neural (Cached)'
              : 'Gemini 3.8 Neural TTS'
            : 'Cached Neural Audio';
        setActiveProviderLabel(providerPretty);

        // Synchronize word highlighting with audio.currentTime
        rafTimerRef.current = window.setInterval(() => {
          if (!audioRef.current) return;
          const currentMs = audioRef.current.currentTime * 1000;
          const idx = timestampsRef.current.findIndex(
            (t) => currentMs >= t.startMs && currentMs <= t.endMs + 120
          );
          if (idx !== -1) {
            setActiveWordIdx(idx);
          }
        }, 55);

        audio.onended = () => {
          handleSegmentComplete(targetIndex, seg.id);
        };

        audio.onerror = () => {
          // Seamless fallback to tuned browser speechSynthesis
          setActiveProviderLabel('Tuned Local Voice Fallback');
          runBrowserSpeechFallback(
            synthResult.preparedSpokenText,
            effectivePersonaId,
            synthResult.durationMs,
            targetIndex,
            seg.id
          );
        };

        await audio.play();
        fadeHtmlAudio(audio, 0.05, 1.0, 130);
        return;
      } catch {
        // Fall through to browser speechSynthesis fallback
      }
    }

    // Path B: Tuned Browser speechSynthesis fallback (or Data Saver mode)
    setActiveProviderLabel(
      dataSaver ? 'Data Saver · Local Voice' : 'Tuned Local Voice (en-PH / Natural)'
    );
    runBrowserSpeechFallback(
      synthResult.preparedSpokenText,
      effectivePersonaId,
      synthResult.durationMs,
      targetIndex,
      seg.id
    );
  };

  const runTimerDrivenKaraoke = (
    durationMs: number,
    segIdx: number,
    segId: string
  ) => {
    const startTime = performance.now();
    const scaledDuration = durationMs / prefs.speed;

    fallbackTimerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTime) * prefs.speed;
      const idx = timestampsRef.current.findIndex(
        (t) => elapsed >= t.startMs && elapsed <= t.endMs + 140
      );
      if (idx !== -1) {
        setActiveWordIdx(idx);
      }
      if (performance.now() - startTime >= scaledDuration) {
        handleSegmentComplete(segIdx, segId);
      }
    }, 60);
  };

  const runBrowserSpeechFallback = (
    preparedText: string,
    personaId: VoicePersonaId,
    estimatedDurationMs: number,
    segIdx: number,
    segId: string
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      runTimerDrivenKaraoke(estimatedDurationMs, segIdx, segId);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.ate_rosa_ph;
      const utter = new SpeechSynthesisUtterance(preparedText);
      const bestVoice = selectBestBrowserVoice(personaId);
      if (bestVoice) utter.voice = bestVoice;

      utter.rate = Number((persona.fallbackSpeechConfig.rate * prefs.speed).toFixed(2));
      utter.pitch = persona.fallbackSpeechConfig.pitch;

      const startTime = performance.now();
      fallbackTimerRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - startTime) * prefs.speed;
        const idx = timestampsRef.current.findIndex(
          (t) => elapsed >= t.startMs && elapsed <= t.endMs + 160
        );
        if (idx !== -1) {
          setActiveWordIdx(idx);
        }
      }, 65);

      utter.onend = () => {
        handleSegmentComplete(segIdx, segId);
      };
      utter.onerror = () => {
        handleSegmentComplete(segIdx, segId);
      };

      window.speechSynthesis.speak(utter);
    } catch {
      runTimerDrivenKaraoke(estimatedDurationMs, segIdx, segId);
    }
  };

  const handleSegmentComplete = (completedIdx: number, segId: string) => {
    if (rafTimerRef.current) {
      window.clearInterval(rafTimerRef.current);
      rafTimerRef.current = null;
    }
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    onSegmentFinished?.(segId);

    // Auto-advance to the next segment in the current tab with a natural 450ms breath
    if (completedIdx + 1 < segments.length) {
      window.setTimeout(() => {
        void startSegmentPlayback(completedIdx + 1);
      }, 450);
    } else {
      setIsPlaying(false);
      setActiveWordIdx(-1);
      savedTabProgressRef.current[`${moduleId}:${activeTab}`] = {
        segIdx: 0,
        wasMidway: false,
      };
    }
  };

  const handlePlayPause = () => {
    soundFX.playClick();
    if (isPlaying) {
      if (audioRef.current) {
        fadeHtmlAudio(audioRef.current, audioRef.current.volume, 0.02, 120, () => {
          cleanupPlayback(true);
        });
      } else {
        cleanupPlayback(true);
      }
    } else {
      void startSegmentPlayback(currentSegIdx);
    }
  };

  const handleReplay = () => {
    soundFX.playClick();
    void startSegmentPlayback(currentSegIdx);
  };

  const handlePrev = () => {
    soundFX.playClick();
    const prevIdx = Math.max(0, currentSegIdx - 1);
    if (isPlaying) {
      void startSegmentPlayback(prevIdx);
    } else {
      setCurrentSegIdx(prevIdx);
      setActiveWordIdx(-1);
    }
  };

  const handleNext = () => {
    soundFX.playClick();
    const nextIdx = Math.min(segments.length - 1, currentSegIdx + 1);
    if (isPlaying) {
      void startSegmentPlayback(nextIdx);
    } else {
      setCurrentSegIdx(nextIdx);
      setActiveWordIdx(-1);
    }
  };

  if (!currentSegment) return null;

  const activePersona = VOICE_PERSONAS[prefs.personaId] || VOICE_PERSONAS.ate_rosa_ph;
  const displayTokens = timestampsRef.current.length
    ? timestampsRef.current
    : computeWordTimestamps(currentSegment.displayText, currentSegment.keyTerms);

  return (
    <div
      className="rounded-2xl border-2 border-[#231F20] bg-gradient-to-r from-[#0A192F] via-[#0F294A] to-[#13335C] text-white linocut-card overflow-hidden"
      role="region"
      aria-label={`Ate and Kuya Lingo Voice Lesson Player for ${moduleTitle}`}
    >
      <InabelStrip
        variant="amber"
        label="Ate & Kuya Lingo • Synchronized Voice Lesson Tutor"
        rightText={`Part ${currentSegIdx + 1}/${segments.length}`}
      />
      <div className="p-4 space-y-3">
      {/* Resume Where You Left Off Banner (when returning to a paused tab) */}
      {resumeBannerSegIdx !== null && !isPlaying && (
        <div className="px-3 py-2 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-between gap-2 text-xs text-amber-200">
          <span>
            Paused earlier on <strong>Part {resumeBannerSegIdx + 1}</strong> ({segments[resumeBannerSegIdx]?.sectionTitle}).
          </span>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              void startSegmentPlayback(resumeBannerSegIdx);
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shrink-0"
          >
            Resume Voice Lesson ▶
          </button>
        </div>
      )}

      {/* Top Row: Tutor Persona Badge, Segment Selector & Studio Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold tracking-wide text-amber-300 uppercase">
                {currentSegment.speaker === 'kuya_lingo' && prefs.personaId === 'ate_rosa_ph'
                  ? 'Kuya James · Co-Tutor'
                  : activePersona.displayName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-sky-200 border border-white/15">
                {activeProviderLabel}
              </span>
              {dataSaver && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  <span>Data Saver</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              Part {currentSegIdx + 1} of {segments.length} ·{' '}
              <span className="text-white font-semibold">{currentSegment.sectionTitle}</span>
            </div>
          </div>
        </div>

        {/* Right Quick Controls: Persona Switcher, Taglish Toggle & Voice QA Studio */}
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            aria-label="Select Tutor Voice Persona"
            value={prefs.personaId}
            onChange={(e) => {
              soundFX.playClick();
              const nextId = e.target.value as VoicePersonaId;
              updatePrefs({ personaId: nextId });
              if (isPlaying) {
                void startSegmentPlayback(currentSegIdx);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-semibold text-sky-200 cursor-pointer focus:outline-none focus:border-sky-400"
          >
            <option value="ate_rosa_ph">🎙️ Ate Rosa (en-PH Warm Tutor)</option>
            <option value="ate_lingo_expressive">✨ Ate Lingo (Expressive Guide)</option>
            <option value="kuya_james_ph">🎓 Kuya James (en-PH Calm Coach)</option>
          </select>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              updatePrefs({ enableTaglishTouches: !prefs.enableTaglishTouches });
            }}
            title="Toggle light conversational Taglish / Bisaya warmth ('Sige', 'Ayos!', 'Maayong adlaw!')"
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
              prefs.enableTaglishTouches
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {prefs.enableTaglishTouches ? '🇵🇭 Taglish/Bisaya: ON' : '🇵🇭 Pure English'}
          </button>

          {onOpenVoiceQAStudio && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                cleanupPlayback(false);
                onOpenVoiceQAStudio();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition"
              title="Open 3-Voice A/B/C Comparison & Voice QA Studio"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>3-Voice A/B/C & QA</span>
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Karaoke Caption Stage */}
      {prefs.showCaptions && (
        <div
          className="p-3.5 rounded-xl bg-slate-950/75 border border-sky-500/25 text-xs sm:text-sm leading-relaxed"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-sky-300/90 mb-1.5">
            <span>
              [Synchronized Lesson Caption · On-Screen Display Text]
            </span>
            <span>
              {isPlaying ? '● Speaking Live' : 'Tap Listen to Hear Ate/Kuya Tutor'}
            </span>
          </div>
          <p className="leading-relaxed">
            {displayTokens.map((tk) => {
              const isCurrentWord = isPlaying && tk.index === activeWordIdx;
              const isPastWord = isPlaying && activeWordIdx > tk.index;
              return (
                <React.Fragment key={tk.index}>
                  <span
                    className={`inline-block rounded px-0.5 transition-all duration-100 ${
                      isCurrentWord
                        ? 'bg-amber-400 text-slate-950 font-extrabold scale-105 shadow-2xs'
                        : tk.isKeyTerm
                        ? 'text-amber-300 font-semibold underline decoration-amber-400/50'
                        : isPastWord
                        ? 'text-sky-100'
                        : 'text-slate-200'
                    }`}
                  >
                    {tk.word}
                  </span>{' '}
                </React.Fragment>
              );
            })}
          </p>
        </div>
      )}

      {/* Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        {/* Left: Play/Pause, Replay, Prev/Next */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? 'Pause voice lesson' : 'Listen to voice lesson'}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading Voice...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Tutor</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen to {activePersona.displayName.split(' ')[0]}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay current segment"
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSegIdx === 0}
            aria-label="Previous narration segment"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSegIdx >= segments.length - 1}
            aria-label="Next narration segment"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Segment Step Dots */}
        <div className="flex items-center gap-1.5">
          {segments.map((seg, idx) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                if (isPlaying) {
                  void startSegmentPlayback(idx);
                } else {
                  setCurrentSegIdx(idx);
                }
              }}
              title={seg.sectionTitle}
              aria-label={`Jump to narration part ${idx + 1}: ${seg.sectionTitle}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentSegIdx
                  ? 'w-7 bg-amber-400'
                  : idx < currentSegIdx
                  ? 'w-2.5 bg-sky-400'
                  : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Right: Speed (0.75x / 1x / 1.25x), Mute, Captions & Script Inspector */}
        <div className="flex items-center gap-1.5">
          {([0.75, 1, 1.25] as PlaybackSpeed[]).map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => {
                soundFX.playClick();
                updatePrefs({ speed: spd });
              }}
              aria-label={`Set playback speed to ${spd}x`}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer border ${
                prefs.speed === spd
                  ? 'bg-sky-500/30 border-sky-400 text-white'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {spd}x
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              updatePrefs({ muted: !prefs.muted });
            }}
            aria-label={prefs.muted ? 'Unmute voice narration' : 'Mute voice narration'}
            className={`p-1.5 rounded-lg border cursor-pointer ${
              prefs.muted
                ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title={prefs.muted ? 'Unmute audio' : 'Mute audio (keep captions)'}
          >
            {prefs.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              updatePrefs({ showCaptions: !prefs.showCaptions });
            }}
            aria-label={prefs.showCaptions ? 'Hide captions' : 'Show captions'}
            className={`p-1.5 rounded-lg border cursor-pointer ${
              prefs.showCaptions
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-200'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Synchronized Karaoke Captions"
          >
            <Subtitles className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setShowScriptInspector((s) => !s);
            }}
            className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              showScriptInspector
                ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Inspect Spoken Script vs. Display Text & SSML Prosody"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SSML</span>
          </button>
        </div>
      </div>

      {/* Expandable Spoken Script + SSML Prosody Inspector */}
      {showScriptInspector && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                displayText (Clean On-Screen Text)
              </div>
              <p className="text-slate-200 leading-relaxed">{currentSegment.displayText}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-1">
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                spokenText (Written for the Ear · Conversational)
              </div>
              <p className="text-emerald-100 leading-relaxed">
                {prefs.enableTaglishTouches && currentSegment.spokenTextTaglish
                  ? currentSegment.spokenTextTaglish
                  : currentSegment.spokenText}
              </p>
            </div>
          </div>
          {currentSsml && (
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                Generated SSML Prosody & IPA Phonemes
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {currentSsml}
              </pre>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
