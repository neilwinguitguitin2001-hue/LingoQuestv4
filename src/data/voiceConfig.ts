// ============================================================================
// Central Voice Persona & Neural TTS Engine Configuration for LingoQuest
// ============================================================================

export type VoicePersonaId = 'ate_rosa_ph' | 'ate_lingo_expressive' | 'kuya_james_ph';
export type PlaybackSpeed = 0.75 | 1 | 1.25;

export interface VoicePersonaProfile {
  id: VoicePersonaId;
  candidateLabel: 'Candidate A (Recommended)' | 'Candidate B' | 'Candidate C';
  displayName: string;
  roleTitle: string;
  gender: 'female' | 'male';
  accentDescription: string;
  personalitySummary: string;
  /** Azure Neural TTS voice name (Philippine English locale) */
  azureVoiceName: string;
  azureStyle: string;
  /** Gemini 3.8 Neural TTS prebuilt voice name ('Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir') */
  geminiVoiceName: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';
  geminiStylePrompt: string;
  /** ElevenLabs voice ID fallback */
  elevenLabsVoiceId: string;
  /** Web Speech API fallback tuning */
  fallbackSpeechConfig: {
    preferredLangs: string[];
    preferredNameKeywords: string[];
    rate: number;
    pitch: number;
  };
}

export const VOICE_PERSONAS: Record<VoicePersonaId, VoicePersonaProfile> = {
  ate_rosa_ph: {
    id: 'ate_rosa_ph',
    candidateLabel: 'Candidate A (Recommended)',
    displayName: 'Ate Rosa (Ate Lingo)',
    roleTitle: 'Warm Filipina English Tutor · en-PH Neural',
    gender: 'female',
    accentDescription: 'Natural Philippine English (en-PH) with clear vowel articulation and warm coastal Mindanao friendliness',
    personalitySummary:
      'Patient, encouraging older sister ("Ate") who pauses before key reveals, stresses relationship words clearly, and celebrates student progress without sounding robotic.',
    azureVoiceName: 'en-PH-RosaNeural',
    azureStyle: 'friendly',
    geminiVoiceName: 'Kore',
    geminiStylePrompt:
      'Warm, friendly, patient Filipina English teacher ("Ate" tutor) speaking clearly to a Grade 7 student in Davao Oriental. Use a natural conversational rhythm, gentle pauses after commas, warm encouragement, and clear emphasis on key vocabulary.',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    fallbackSpeechConfig: {
      preferredLangs: ['en-PH', 'fil-PH', 'en-SG', 'en-IN', 'en-US', 'en-GB'],
      preferredNameKeywords: ['Rosa', 'Filipino', 'Philippines', 'Natural', 'Aria', 'Samantha', 'Victoria', 'Google'],
      rate: 0.92,
      pitch: 1.04,
    },
  },
  ate_lingo_expressive: {
    id: 'ate_lingo_expressive',
    candidateLabel: 'Candidate B',
    displayName: 'Ate Lingo (Storyteller)',
    roleTitle: 'Upbeat Interactive Quest Guide · Expressive Neural',
    gender: 'female',
    accentDescription: 'Bright, expressive instructional narrator with lively pacing and storytelling warmth',
    personalitySummary:
      'Energetic island guide who brings Davao Oriental scenes (Mount Hamiguitan, Dahican surf, Pujada Bay) to life with vivid inflection and upbeat quiz coaching.',
    azureVoiceName: 'en-PH-RosaNeural',
    azureStyle: 'cheerful',
    geminiVoiceName: 'Zephyr',
    geminiStylePrompt:
      'Cheerful, upbeat, expressive young Filipina story-guide coaching a junior high student on an island quest. Lively intonation on questions, warm smile in the voice, and crisp pauses before answers.',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
    fallbackSpeechConfig: {
      preferredLangs: ['en-PH', 'en-US', 'en-AU'],
      preferredNameKeywords: ['Zephyr', 'Jenny', 'Natural', 'Google', 'Samantha'],
      rate: 0.95,
      pitch: 1.08,
    },
  },
  kuya_james_ph: {
    id: 'kuya_james_ph',
    candidateLabel: 'Candidate C',
    displayName: 'Kuya James (Kuya Lingo)',
    roleTitle: 'Calm, Encouraging Kuya Coach · en-PH Neural',
    gender: 'male',
    accentDescription: 'Clear, grounded Philippine English (en-PH) male tutor voice; also used as the second voice in Pitfall vs. Correction dialogues',
    personalitySummary:
      'Calm, steady older brother ("Kuya") who breaks down tricky grammar formulas step by step and reads contrasting examples in two-speaker walkthroughs.',
    azureVoiceName: 'en-PH-JamesNeural',
    azureStyle: 'calm',
    geminiVoiceName: 'Puck',
    geminiStylePrompt:
      'Warm, calm, encouraging Filipino older brother ("Kuya" tutor) explaining English concepts step by step to a Grade 7 student. Steady, reassuring pace with clear pauses between steps.',
    elevenLabsVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
    fallbackSpeechConfig: {
      preferredLangs: ['en-PH', 'en-SG', 'en-US', 'en-GB'],
      preferredNameKeywords: ['James', 'Guy', 'Natural', 'Daniel', 'Alex', 'Google'],
      rate: 0.91,
      pitch: 0.97,
    },
  },
};

export const DEFAULT_VOICE_PERSONA_ID: VoicePersonaId = 'ate_rosa_ph';

// ============================================================================
// Neural TTS Provider Evaluation & Cost Comparison (Official Docs Benchmark)
// ============================================================================
export interface TTSProviderEvaluation {
  id: 'azure_neural' | 'gemini_tts' | 'elevenlabs' | 'google_cloud_tts' | 'openai_tts';
  name: string;
  recommendedRank: number;
  philippineEnglishVoices: string;
  ssmlSupport: string;
  wordTimestampsSupport: string;
  pricingModel: string;
  estimatedFullAppCostUSD: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export const TTS_PROVIDER_EVALUATIONS: TTSProviderEvaluation[] = [
  {
    id: 'azure_neural',
    name: 'Azure AI Speech Neural TTS (en-PH-RosaNeural & en-PH-JamesNeural)',
    recommendedRank: 1,
    philippineEnglishVoices: 'Native en-PH-RosaNeural (Female) & en-PH-JamesNeural (Male) + fil-PH-BlessicaNeural',
    ssmlSupport: 'Full W3C SSML (<break>, <emphasis>, <prosody>, <phoneme alphabet="ipa">, <mstts:express-as>)',
    wordTimestampsSupport: 'Exact millisecond WordBoundary events via SDK/REST',
    pricingModel: 'Free tier: 500,000 chars/month free; Pay-as-you-go: $15 per 1M characters',
    estimatedFullAppCostUSD: '$0.00 on Free Tier (or ~$4.20 one-time for ~280,000 chars across all modules)',
    pros: [
      'Authentic native Philippine English (en-PH) pronunciation that Grade 7–10 Filipino students immediately relate to',
      'Full SSML prosody, pause, emphasis, and IPA phoneme overrides for Davao Oriental terms (Hamiguitan, Aliwagwag, Pujada)',
      'Generous 500K chars/month free tier covers pre-generating the entire LingoQuest curriculum at $0 cost',
    ],
    cons: [
      'Requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env for batch pre-generation',
    ],
    verdict: 'BEST FOR PRODUCTION PRE-GENERATION: Native en-PH accent + full SSML + $0 within 500K free tier.',
  },
  {
    id: 'gemini_tts',
    name: 'Gemini 3.8 Neural TTS (gemini-3.8-flash-lite-tts & gemini-3.8-flash-tts)',
    recommendedRank: 2,
    philippineEnglishVoices: 'Natural-language style-steered voices (Kore, Zephyr, Puck) with Filipino tutor persona prompting & dual-speaker dialogue',
    ssmlSupport: 'Natural-language speechMetadata style direction + inline <breath>, <laugh>, and pause markers',
    wordTimestampsSupport: 'Syllable-weighted cadence alignment + cached WAV output (24kHz mono 16-bit)',
    pricingModel: 'Included with existing server-side GEMINI_API_KEY (@google/genai >= 2.25.0)',
    estimatedFullAppCostUSD: '~$1.50 – $3.00 total one-time pre-generation (cached by SHA-256 content hash)',
    pros: [
      'Works zero-config out of the box in AI Studio using the already configured server-side GEMINI_API_KEY',
      'Superior natural conversational cadence, warmth, and dual-speaker dialogue (Ate Rosa + Kuya James)',
      'Outputs complete 24kHz WAV directly from unary generateContent and caches to /public/audio/cache/',
    ],
    cons: [
      'Uses natural-language style prompts rather than XML <prosody> tags',
    ],
    verdict: 'ACTIVE SERVER-SIDE ENGINE (READY NOW): Zero extra API keys needed; delivers expressive human-like Ate/Kuya tutoring.',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Multilingual v2 / Flash v2.5',
    recommendedRank: 3,
    philippineEnglishVoices: 'Custom voice cloning or Voice Library Filipino accents + Pronunciation Dictionary (PLS/IPA)',
    ssmlSupport: 'Supports <break time="..."/> and phoneme tags; emotion controlled via stability/style sliders',
    wordTimestampsSupport: 'Character-level alignment via /with-timestamps endpoint',
    pricingModel: 'Starter $5/mo (30K chars) · Creator $22/mo (100K chars) · ~$180–$300 per 1M chars',
    estimatedFullAppCostUSD: '~$45 – $66 to pre-generate all ~280K curriculum characters',
    pros: [
      'Ultra-expressive emotional nuance and breathiness',
      'Supports custom pronunciation dictionaries',
    ],
    cons: [
      '10x–15x more expensive per character than Azure Neural TTS or Gemini Flash Lite TTS',
      'Fewer out-of-the-box standardized en-PH educational voices without custom cloning',
    ],
    verdict: 'Great quality, but significantly higher cost for a public school DepEd deployment.',
  },
  {
    id: 'google_cloud_tts',
    name: 'Google Cloud Text-to-Speech (Neural2 / Studio / Journey)',
    recommendedRank: 4,
    philippineEnglishVoices: 'fil-PH-Neural2-A / fil-PH-Neural2-D (Filipino) & en-US-Journey / Studio voices',
    ssmlSupport: 'Full SSML (<break>, <emphasis>, <prosody>, <phoneme>, <say-as>)',
    wordTimestampsSupport: 'Timepoint marks via enableTimePointing',
    pricingModel: 'Neural2: $16 per 1M chars (1M chars/month free) · Studio: $160 per 1M chars',
    estimatedFullAppCostUSD: '$0.00 on Neural2 Free Tier (~$4.48 without free tier)',
    pros: [
      'Reliable SSML support and 1M free Neural2 characters per month',
    ],
    cons: [
      'Dedicated English-Philippines (en-PH) Neural2 voices are more limited than Azure en-PH-RosaNeural',
    ],
    verdict: 'Strong runner-up if using GCP Cloud TTS credentials.',
  },
];

// ============================================================================
// Persistent User Voice Settings Helper
// ============================================================================
export interface UserVoicePreferences {
  personaId: VoicePersonaId;
  speed: PlaybackSpeed;
  muted: boolean;
  showCaptions: boolean;
  enableTaglishTouches: boolean;
}

const VOICE_PREFS_STORAGE_KEY = 'lingoquest_voice_prefs_v1';

export function loadUserVoicePreferences(): UserVoicePreferences {
  const defaults: UserVoicePreferences = {
    personaId: DEFAULT_VOICE_PERSONA_ID,
    speed: 1,
    muted: false,
    showCaptions: true,
    enableTaglishTouches: true,
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(VOICE_PREFS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      personaId:
        parsed.personaId && VOICE_PERSONAS[parsed.personaId as VoicePersonaId]
          ? (parsed.personaId as VoicePersonaId)
          : defaults.personaId,
      speed: parsed.speed === 0.75 || parsed.speed === 1 || parsed.speed === 1.25 ? parsed.speed : 1,
      muted: Boolean(parsed.muted),
      showCaptions: parsed.showCaptions !== undefined ? Boolean(parsed.showCaptions) : true,
      enableTaglishTouches:
        parsed.enableTaglishTouches !== undefined ? Boolean(parsed.enableTaglishTouches) : true,
    };
  } catch {
    return defaults;
  }
}

export function saveUserVoicePreferences(prefs: UserVoicePreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}
