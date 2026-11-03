import {
  PRONUNCIATION_DICTIONARY,
  applySpokenPronunciationOverrides,
} from '../data/pronunciationDictionary.ts';
import { VOICE_PERSONAS, type VoicePersonaId } from '../data/voiceConfig.ts';

export type ProsodyRole =
  | 'intro'
  | 'definition'
  | 'rule'
  | 'example'
  | 'question_reveal'
  | 'pitfall_wrong'
  | 'pitfall_right'
  | 'cultural_story'
  | 'vocab_card'
  | 'praise';

export interface WordTimestamp {
  index: number;
  word: string;
  charStart: number;
  charEnd: number;
  startMs: number;
  endMs: number;
  isKeyTerm?: boolean;
}

/**
 * Expands symbols, analogy colons, arrows, and DepEd MELC codes into natural
 * spoken English so TTS never reads "colon colon" or robotic alphanumeric strings.
 */
export function normalizeTextForSpeech(rawText: string): string {
  let text = rawText;

  // 1. Expand DepEd MELC competency codes like "EN7V-IV-c-23.1" or "(EN8RC-III-a-12)"
  text = text.replace(
    /\(?EN(\d+)[A-Z]*-([IVX]+)-[a-z0-9.-]+\)?/g,
    (_match, grade, quarterRoman) => {
      const quarterMap: Record<string, string> = {
        I: 'Quarter 1',
        II: 'Quarter 2',
        III: 'Quarter 3',
        IV: 'Quarter 4',
      };
      const qSpoken = quarterMap[quarterRoman] || `Quarter ${quarterRoman}`;
      return `English Grade ${grade}, ${qSpoken} competency`;
    }
  );

  // 2. Strip decorative emojis or check/cross symbols that sound awkward in TTS
  text = text.replace(/[🌙☀️😊😄🥶🔥💧🐟🌊🦅⛰️✉️📖🎉✓✕★⚡↻]/g, '');

  // 3. Expand classic analogy formula "A : B :: C : D"
  text = text.replace(
    /\bA\s*:\s*B\s*::\s*C\s*:\s*D\b/g,
    'A is to B, as C is to D'
  );

  // 4. Expand double colon "::" to ", as "
  text = text.replace(/\s*::\s*/g, ', as ');

  // 5. Expand single colon between words in analogy pairs (e.g., "night : day" -> "night is to day")
  // Avoid replacing "Step 1:" or "Rule 01:" or "Example:"
  text = text.replace(
    /\b(?!(?:Step|Rule|Example|Pitfall|Correction|Insight|Hint|Part|Whole|Scene|Note)\b)([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+:\s+([A-Za-z_]+)/g,
    '$1 is to $2'
  );

  // 6. Replace underscores (blank lines like "________") with "blank"
  text = text.replace(/_{2,}/g, 'blank');

  // 7. Replace arrows
  text = text.replace(/\s*↔\s*/g, ' is the opposite of ');
  text = text.replace(/\s*→\s*/g, ' leads to ');

  // 8. Clean up multiple spaces
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/**
 * Escapes XML special characters before wrapping in SSML tags
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates W3C / Azure Neural TTS SSML from spokenText, prosodyRole, and keyTerms.
 * Includes:
 * - <break time="300ms"/> after commas
 * - <break time="550ms"/> between sentences/ideas
 * - <break time="800ms"/> on ellipsis ("...") before a reveal
 * - <emphasis level="moderate"> on key terms
 * - <prosody rate="..." pitch="..."> tuned per instructional role
 * - <phoneme alphabet="ipa" ph="..."> for Davao Oriental & tricky terms
 */
export function buildSegmentSSML(options: {
  spokenText: string;
  role?: ProsodyRole;
  keyTerms?: string[];
  personaId?: VoicePersonaId;
}): string {
  const {
    spokenText,
    role = 'definition',
    keyTerms = [],
    personaId = 'ate_rosa_ph',
  } = options;

  const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.ate_rosa_ph;
  const normalized = normalizeTextForSpeech(spokenText);

  // Prosody tuning by instructional segment role
  const roleProsody: Record<
    ProsodyRole,
    { rate: string; pitch: string; expressStyle: string }
  > = {
    intro: { rate: '96%', pitch: '+2%', expressStyle: 'friendly' },
    definition: { rate: '92%', pitch: '+1%', expressStyle: 'calm' },
    rule: { rate: '93%', pitch: '+1%', expressStyle: 'friendly' },
    example: { rate: '98%', pitch: '+2%', expressStyle: 'friendly' },
    question_reveal: { rate: '95%', pitch: '+3%', expressStyle: 'cheerful' },
    pitfall_wrong: { rate: '94%', pitch: '-1%', expressStyle: 'calm' },
    pitfall_right: { rate: '97%', pitch: '+2%', expressStyle: 'cheerful' },
    cultural_story: { rate: '95%', pitch: '+2%', expressStyle: 'friendly' },
    vocab_card: { rate: '90%', pitch: '+1%', expressStyle: 'calm' },
    praise: { rate: '102%', pitch: '+4%', expressStyle: 'cheerful' },
  };

  const prosody = roleProsody[role] || roleProsody.definition;

  // Escape XML first
  let body = escapeXml(normalized);

  // Apply IPA <phoneme> tags for Davao Oriental & tricky vocabulary
  for (const entry of PRONUNCIATION_DICTIONARY) {
    const regex = new RegExp(`\\b(${entry.term})\\b`, 'gi');
    body = body.replace(
      regex,
      `<phoneme alphabet="ipa" ph="${entry.ipa}">$1</phoneme>`
    );
  }

  // Apply <emphasis> on key terms (avoiding nested tags)
  const uniqueKeyTerms = Array.from(
    new Set(keyTerms.map((k) => k.trim()).filter((k) => k.length >= 3))
  );
  for (const term of uniqueKeyTerms) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
    body = body.replace(regex, `<emphasis level="moderate">$1</emphasis>`);
  }

  // Insert natural pauses:
  // 1) Ellipsis "..." before a key reveal -> 800ms break
  body = body.replace(/\.\.\./g, '<break time="800ms"/>');

  // 2) Question mark followed by space -> 650ms rhetorical pause
  body = body.replace(/\?\s+/g, '? <break time="650ms"/> ');

  // 3) Period or exclamation mark followed by space -> 550ms sentence break
  body = body.replace(/([.!])\s+/g, '$1 <break time="550ms"/> ');

  // 4) Comma or semicolon followed by space -> 300ms clause breath
  body = body.replace(/([,;])\s+/g, '$1 <break time="300ms"/> ');

  return [
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-PH">`,
    `  <voice name="${persona.azureVoiceName}">`,
    `    <mstts:express-as style="${prosody.expressStyle}">`,
    `      <prosody rate="${prosody.rate}" pitch="${prosody.pitch}">`,
    `        ${body}`,
    `      </prosody>`,
    `    </mstts:express-as>`,
    `  </voice>`,
    `</speak>`,
  ].join('\n');
}

/**
 * Prepares clean, natural spoken text with phonetic respellings for Gemini 3.8 TTS
 * and Web Speech API fallbacks so Davao Oriental names and symbols are pronounced naturally.
 */
export function prepareSpokenTextForTTS(spokenText: string): string {
  const normalized = normalizeTextForSpeech(spokenText);
  return applySpokenPronunciationOverrides(normalized);
}

/**
 * Computes word-by-word timestamps (startMs, endMs, charStart, charEnd) for
 * karaoke-style synchronized highlighting and animated step triggers.
 * If actualDurationMs is known (e.g., from a loaded HTMLAudioElement), scales
 * all timestamps proportionally to match the exact audio duration.
 */
export function computeWordTimestamps(
  displayText: string,
  keyTerms: string[] = [],
  actualDurationMs?: number
): WordTimestamp[] {
  const cleanText = displayText || '';
  const tokens: { word: string; charStart: number; charEnd: number }[] = [];
  const wordRegex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(cleanText)) !== null) {
    tokens.push({
      word: match[0],
      charStart: match.index,
      charEnd: match.index + match[0].length,
    });
  }

  if (tokens.length === 0) return [];

  const lowerKeyTerms = keyTerms.map((k) => k.toLowerCase());
  const rawTimestamps: WordTimestamp[] = [];
  let cursorMs = 80; // gentle 80ms lead-in

  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    const stripped = tk.word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Estimate word spoken duration based on character/syllable weight (~230ms base + 38ms per char)
    const wordDuration = Math.max(190, Math.min(620, 180 + stripped.length * 40));

    // Add natural punctuation pause after the word
    let pauseAfter = 45;
    if (tk.word.endsWith('...')) {
      pauseAfter = 750;
    } else if (tk.word.endsWith('?')) {
      pauseAfter = 600;
    } else if (tk.word.endsWith('.') || tk.word.endsWith('!')) {
      pauseAfter = 480;
    } else if (tk.word.endsWith(',') || tk.word.endsWith(';') || tk.word.endsWith(':')) {
      pauseAfter = 280;
    } else if (tk.word === ':' || tk.word === '::') {
      pauseAfter = 220;
    }

    const isKey = lowerKeyTerms.some(
      (kt) => stripped.length >= 3 && (kt === stripped || kt.includes(stripped))
    );

    rawTimestamps.push({
      index: i,
      word: tk.word,
      charStart: tk.charStart,
      charEnd: tk.charEnd,
      startMs: cursorMs,
      endMs: cursorMs + wordDuration,
      isKeyTerm: isKey,
    });

    cursorMs += wordDuration + pauseAfter;
  }

  // Scale to actual audio duration if provided
  if (actualDurationMs && actualDurationMs > 300 && cursorMs > 0) {
    const scale = (actualDurationMs - 100) / cursorMs;
    return rawTimestamps.map((ts) => ({
      ...ts,
      startMs: Math.round(ts.startMs * scale),
      endMs: Math.round(ts.endMs * scale),
    }));
  }

  return rawTimestamps;
}
