import { pipeline, env } from '@huggingface/transformers';
import { BROWSER_GRAMMAR_MODEL, BROWSER_GRAMMAR_REVISION, BROWSER_GRAMMAR_MAX_CHARS } from '../services/browserGrammarConfig';

env.allowLocalModels = false;
env.useBrowserCache = true;
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;
let checker: Promise<any> | null = null;
let busy = false;
const loaded = new Map<string, number>();
const report = (message: string) => self.postMessage({ status: 'progress', message });

self.onmessage = async ({ data }) => {
  if (busy) return;
  busy = true;
  try {
    if (!['load', 'check'].includes(data.action)) throw new Error('Unknown AI action.');
    if (data.action === 'check' && (typeof data.text !== 'string' || !data.text.trim() || data.text.length > BROWSER_GRAMMAR_MAX_CHARS)) throw new Error('Use a short paragraph of up to 500 characters.');
    report('Loading the grammar model on this device…');
    checker ??= (pipeline as any)('text2text-generation', BROWSER_GRAMMAR_MODEL, {
      revision: BROWSER_GRAMMAR_REVISION, dtype: 'q8', device: 'wasm',
      progress_callback: (event: { status: string; file?: string; loaded?: number }) => {
        if (event.status === 'progress' && event.file) {
          loaded.set(event.file, event.loaded || 0);
          const bytes = [...loaded.values()].reduce((sum, value) => sum + value, 0);
          report(`Downloading model: ${(bytes / 1000000).toFixed(1)} MB received. First download is about 250 MB.`);
        }
      },
    });
    const model = await checker;
    if (data.action === 'load') self.postMessage({ status: 'ready' });
    else {
      report('Checking on your device…');
      const output = await model(`grammar: ${data.text.trim()}`, { max_new_tokens: 192, do_sample: false, num_beams: 1 });
      const text = output?.[0]?.generated_text;
      if (typeof text !== 'string' || !text.trim()) throw new Error('No usable revision was returned.');
      self.postMessage({ status: 'result', text: text.trim() });
    }
  } catch {
    checker = null;
    self.postMessage({ status: 'error', message: 'Browser AI could not complete the check. The download may be blocked or the device may lack memory. Try the basic local checker.' });
  } finally { busy = false; }
};
