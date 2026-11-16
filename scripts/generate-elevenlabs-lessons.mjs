import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env.local'), quiet: true });
const manifestPath = path.join(root, 'src/data/curriculum/lessonNarrations.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const requested = process.argv.find(arg => arg.startsWith('--module='))?.slice(9);
const entries = Object.entries(manifest).filter(([id]) => !requested || id === requested);
if (!entries.length) throw new Error('Unknown module selection.');
const characterCount = entries.reduce((total, [, item]) => total + item.transcript.length, 0);
console.log(`${entries.length} scripts selected, ${characterCount} characters.`);
if (!process.argv.includes('--generate')) {
  console.log('Run with --generate to create saved recordings using your existing ElevenLabs credits.');
  process.exit(0);
}
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error('Configure ELEVENLABS_API_KEY privately in .env.local or the shell environment.');
const headers = { 'xi-api-key': key };
async function get(resource) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://api.elevenlabs.io${resource}`, {
      headers, signal: AbortSignal.timeout(30000),
    });
    if (response.status === 429 && attempt < 3) {
      const retrySeconds = Number(response.headers.get('retry-after')) || 20;
      console.log(`ElevenLabs read rate limit. Retrying in ${Math.min(60, retrySeconds)} seconds.`);
      await new Promise(resolve => setTimeout(resolve, Math.min(60, retrySeconds) * 1000));
      continue;
    }
    if (!response.ok) throw new Error(`ElevenLabs access check failed (${response.status}). Check key permissions and account credits.`);
    return response.json();
  }
}
const voices = await get('/v2/voices?search=Roger&page_size=100');
const voice = voices.voices?.find(item => item.name === 'Roger' || item.name?.startsWith('Roger -'));
if (!voice) throw new Error('Roger is unavailable in this account. Select a voice before generating.');
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const models = await get('/v1/models');
const model = models.find(item => item.model_id === modelId && item.can_do_text_to_speech);
if (!model) throw new Error('The selected model is unavailable for text-to-speech.');
const outputDirectory = path.join(root, 'public/audio/lessons');
await fs.mkdir(outputDirectory, { recursive: true });
async function saveManifest() {
  const temporary = manifestPath + '.tmp';
  await fs.writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n');
  await fs.rename(temporary, manifestPath);
}
let generated = 0;
let subscription = await get('/v1/user/subscription');
let remaining = Math.max(0, subscription.character_limit - subscription.character_count);
for (const [id, item] of entries) {
  const scriptHash = crypto.createHash('sha256').update(item.transcript).digest('hex');
  const recordingHash = crypto.createHash('sha256')
    .update(JSON.stringify([voice.voice_id, modelId, scriptHash, item.sourceSha256])).digest('hex');
  const filename = `${id}-${recordingHash.slice(0, 16)}.mp3`;
  const audioPath = `/audio/lessons/${filename}`;
  const file = path.join(outputDirectory, filename);
  let audio = await fs.readFile(file).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (!audio) {
    if (generated > 0 && generated % 10 === 0) {
      subscription = await get('/v1/user/subscription');
      remaining = Math.max(0, subscription.character_limit - subscription.character_count);
    }
    // This default model charges one credit per character. Quota checks precede each request.
    if (modelId === 'eleven_multilingual_v2' && remaining < item.transcript.length) {
      console.log(`Paused before ${id}: ${remaining} credits remain. Resume after adding credits.`);
      break;
    }
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.voice_id)}?output_format=mp3_44100_128`, {
      method: 'POST', headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ text: item.transcript, model_id: modelId,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true } }),
      signal: AbortSignal.timeout(120000),
    });
    // Do not automatically retry a billed request whose outcome is uncertain.
    if (!response.ok) throw new Error(`Generation stopped at ${id} (${response.status}). Completed recordings are saved.`);
    if (!response.headers.get('content-type')?.startsWith('audio/')) throw new Error(`Unexpected response for ${id}.`);
    audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 1000) throw new Error(`Incomplete audio returned for ${id}.`);
    await fs.writeFile(file + '.tmp', audio);
    await fs.rename(file + '.tmp', file);
    generated++;
    remaining -= item.transcript.length;
  }
  manifest[id] = { ...item, scriptSha256: scriptHash, audioPath, voiceId: voice.voice_id,
    voiceName: voice.name, modelId, audioSha256: crypto.createHash('sha256').update(audio).digest('hex') };
  await saveManifest();
  console.log(`Saved ${id}`);
}
console.log(`${generated} new recordings. ${Object.values(manifest).filter(item => item.audioPath).length}/${Object.keys(manifest).length} modules have recordings.`);
