/**
 * LingoQuest Pre-Generation Voice Pipeline (scripts/generate-voice.ts)
 *
 * Usage:
 *   npx tsx scripts/generate-voice.ts                  # Pre-generates Reference Analogy Module (all 7 tabs) + 3-Voice A/B/C samples
 *   npx tsx scripts/generate-voice.ts --module=g7-q1-m2 # Pre-generates a specific module ID
 *   npx tsx scripts/generate-voice.ts --all            # Pre-generates all curriculum modules
 *
 * Behavior:
 *   - Reads spoken narration segments from src/data/spokenScripts.ts & src/data/seedData.ts
 *   - Computes a deterministic SHA-256 hash per segment (personaId + prosodyRole + spokenText)
 *   - Skips any segment already cached in /public/audio/cache/<hash>.(mp3|wav)
 *   - Calls Azure Neural TTS (en-PH-RosaNeural / en-PH-JamesNeural) if AZURE_SPEECH_KEY is set,
 *     or Gemini 3.8 Neural TTS (gemini-3.8-flash-lite-tts) via GEMINI_API_KEY
 *   - Outputs word/sentence timestamps JSON (<hash>.json) and /public/audio/manifest.json
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { ALL_MODULES } from '../src/data/seedData.ts';
import {
  ANALOGY_ABC_VOICE_SAMPLES,
  ANALOGY_SPOKEN_SEGMENTS,
  getModuleSpokenSegments,
  type SpokenSegment,
} from '../src/data/spokenScripts.ts';
import { VOICE_PERSONAS, type VoicePersonaId } from '../src/data/voiceConfig.ts';
import {
  buildSegmentSSML,
  computeWordTimestamps,
  prepareSpokenTextForTTS,
} from '../src/utils/ssmlBuilder.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.resolve(__dirname, '..', 'public', 'audio', 'cache');
const MANIFEST_PATH = path.resolve(__dirname, '..', 'public', 'audio', 'manifest.json');

interface ManifestEntry {
  segmentId: string;
  moduleId: string;
  tabId: string;
  personaId: VoicePersonaId;
  hash: string;
  audioUrl: string;
  durationMs: number;
  provider: string;
  updatedAt: string;
}

async function synthesizeSegmentToCache(
  segment: SpokenSegment,
  personaId: VoicePersonaId
): Promise<ManifestEntry | null> {
  const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.ate_rosa_ph;
  const preparedSpoken = prepareSpokenTextForTTS(segment.spokenText);
  const ssml = buildSegmentSSML({
    spokenText: segment.spokenText,
    role: segment.prosodyRole,
    keyTerms: segment.keyTerms,
    personaId: persona.id,
  });

  const contentHash = crypto
    .createHash('sha256')
    .update(`${persona.id}::${segment.prosodyRole}::${preparedSpoken}`)
    .digest('hex')
    .slice(0, 20);

  const wavPath = path.join(CACHE_DIR, `${contentHash}.wav`);
  const mp3Path = path.join(CACHE_DIR, `${contentHash}.mp3`);
  const metaPath = path.join(CACHE_DIR, `${contentHash}.json`);

  // Skip if already cached by content hash
  if (fs.existsSync(metaPath) && (fs.existsSync(wavPath) || fs.existsSync(mp3Path))) {
    const existingMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const ext = fs.existsSync(mp3Path) ? 'mp3' : 'wav';
    console.log(`  [CACHE HIT] ${segment.id} (${persona.id}) -> ${contentHash}.${ext}`);
    return {
      segmentId: segment.id,
      moduleId: segment.moduleId,
      tabId: segment.tabId,
      personaId: persona.id,
      hash: contentHash,
      audioUrl: `/audio/cache/${contentHash}.${ext}`,
      durationMs: existingMeta.durationMs || 4000,
      provider: existingMeta.provider || 'cache',
      updatedAt: existingMeta.createdAt || new Date().toISOString(),
    };
  }

  // Provider 1: Azure Neural TTS (en-PH-RosaNeural / en-PH-JamesNeural)
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
    const resp = await fetch(
      `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
          'User-Agent': 'LingoQuest-Voice-Generator',
        },
        body: ssml,
      }
    );

    if (resp.ok) {
      const mp3Buffer = Buffer.from(await resp.arrayBuffer());
      const durationMs = Math.max(800, Math.round((mp3Buffer.length / 12000) * 1000));
      const timestamps = computeWordTimestamps(segment.displayText, segment.keyTerms, durationMs);
      const now = new Date().toISOString();

      fs.writeFileSync(mp3Path, mp3Buffer);
      fs.writeFileSync(
        metaPath,
        JSON.stringify(
          {
            segmentId: segment.id,
            hash: contentHash,
            provider: 'azure_neural_en_ph',
            voice: persona.azureVoiceName,
            durationMs,
            timestamps,
            ssml,
            createdAt: now,
          },
          null,
          2
        )
      );

      console.log(`  [GENERATED AZURE en-PH] ${segment.id} -> ${contentHash}.mp3 (${durationMs}ms)`);
      return {
        segmentId: segment.id,
        moduleId: segment.moduleId,
        tabId: segment.tabId,
        personaId: persona.id,
        hash: contentHash,
        audioUrl: `/audio/cache/${contentHash}.mp3`,
        durationMs,
        provider: 'azure_neural_en_ph',
        updatedAt: now,
      };
    }
  }

  // Provider 2: Gemini 3.8 Neural TTS (gemini-3.8-flash-lite-tts)
  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: preparedSpoken,
              speechMetadata: { style: persona.geminiStylePrompt },
            } as any,
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: persona.geminiVoiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const wavBuffer = Buffer.from(base64Audio, 'base64');
      const pcmBytes = Math.max(0, wavBuffer.length - 44);
      const durationMs = Math.max(600, Math.round((pcmBytes / 48000) * 1000));
      const timestamps = computeWordTimestamps(segment.displayText, segment.keyTerms, durationMs);
      const now = new Date().toISOString();

      fs.writeFileSync(wavPath, wavBuffer);
      fs.writeFileSync(
        metaPath,
        JSON.stringify(
          {
            segmentId: segment.id,
            hash: contentHash,
            provider: 'gemini_3_8_neural_tts',
            voice: persona.geminiVoiceName,
            durationMs,
            timestamps,
            ssml,
            createdAt: now,
          },
          null,
          2
        )
      );

      console.log(`  [GENERATED GEMINI 3.8 TTS] ${segment.id} -> ${contentHash}.wav (${durationMs}ms)`);
      return {
        segmentId: segment.id,
        moduleId: segment.moduleId,
        tabId: segment.tabId,
        personaId: persona.id,
        hash: contentHash,
        audioUrl: `/audio/cache/${contentHash}.wav`,
        durationMs,
        provider: 'gemini_3_8_neural_tts',
        updatedAt: now,
      };
    }
  }

  // Always write timestamp & SSML JSON metadata even when running offline without API keys
  const timestamps = computeWordTimestamps(segment.displayText, segment.keyTerms);
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        segmentId: segment.id,
        hash: contentHash,
        provider: 'ssml_timestamps_precomputed',
        voice: persona.azureVoiceName,
        durationMs: timestamps[timestamps.length - 1]?.endMs || 4500,
        timestamps,
        ssml,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`  [TIMESTAMPS + SSML SAVED] ${segment.id} -> ${contentHash}.json`);
  return null;
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const runAll = args.includes('--all');
  const moduleArg = args.find((a) => a.startsWith('--module='))?.split('=')[1];

  let targetSegments: SpokenSegment[] = [];

  if (runAll) {
    for (const mod of ALL_MODULES) {
      targetSegments.push(...getModuleSpokenSegments(mod));
    }
  } else if (moduleArg) {
    const found = ALL_MODULES.find((m) => m.id === moduleArg);
    if (!found) {
      console.error(`Module "${moduleArg}" not found.`);
      process.exit(1);
    }
    targetSegments = getModuleSpokenSegments(found);
  } else {
    // Default: Reference Analogy module (all 7 tabs) + 3-voice A/B/C comparison
    targetSegments = [...ANALOGY_SPOKEN_SEGMENTS];
  }

  console.log(`=== LingoQuest Voice Pre-Generator ===`);
  console.log(`Target segments: ${targetSegments.length}`);
  console.log(`Cache directory: ${CACHE_DIR}`);

  const manifest: ManifestEntry[] = [];

  // 1. Generate 3-Voice A/B/C Comparison Samples for Analogy Concepts tab
  for (const sample of ANALOGY_ABC_VOICE_SAMPLES) {
    const pseudoSegment: SpokenSegment = {
      id: `abc-sample-${sample.personaId}`,
      moduleId: 'g7-q1-m1',
      tabId: 'concepts',
      sectionTitle: sample.title,
      speaker: sample.personaId === 'kuya_james_ph' ? 'kuya_lingo' : 'ate_lingo',
      prosodyRole: 'intro',
      displayText: sample.displayText,
      spokenText: sample.spokenText,
      keyTerms: sample.keyTerms,
    };
    const entry = await synthesizeSegmentToCache(pseudoSegment, sample.personaId);
    if (entry) manifest.push(entry);
  }

  // 2. Generate all target module segments
  for (const seg of targetSegments) {
    const personaId: VoicePersonaId =
      seg.speaker === 'kuya_lingo' ? 'kuya_james_ph' : 'ate_rosa_ph';
    const entry = await synthesizeSegmentToCache(seg, personaId);
    if (entry) manifest.push(entry);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), entries: manifest }, null, 2));
  console.log(`Done! Manifest written to ${MANIFEST_PATH} (${manifest.length} cached audio entries).`);
}

main().catch((err) => {
  console.error('Voice generation script failed:', err);
  process.exit(1);
});
