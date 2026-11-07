import { BROWSER_GRAMMAR_MAX_CHARS } from './browserGrammarConfig';

export class BrowserGrammarClient {
  private worker: Worker | null = null;
  private pending: { resolve: (value: string) => void; reject: (error: Error) => void } | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  constructor(private report: (message: string) => void) {}

  private request(action: 'load' | 'check', text = ''): Promise<string> {
    if (this.pending) return Promise.reject(new Error('An AI check is already running.'));
    if (action === 'check' && (!text.trim() || text.length > BROWSER_GRAMMAR_MAX_CHARS)) {
      return Promise.reject(new Error(`Use up to ${BROWSER_GRAMMAR_MAX_CHARS} characters for this AI prototype.`));
    }
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      try {
        this.worker ??= new Worker(new URL('../workers/grammar.worker.ts', import.meta.url), { type: 'module' });
        this.worker.onmessage = ({ data }) => {
          if (data.status === 'progress') { this.report(data.message); return; }
          if (data.status === 'error') { this.cancel(data.message); return; }
          if (this.timeout) clearTimeout(this.timeout);
          const pending = this.pending;
          this.pending = null;
          pending?.resolve(data.text || '');
        };
        this.worker.onerror = () => this.cancel('Browser AI could not run on this device. Use the basic local checker.');
        this.timeout = setTimeout(() => this.cancel('The AI check took too long. Try a shorter sentence or the basic local checker.'), 300000);
        this.worker.postMessage({ action, text });
      } catch {
        this.cancel('Browser AI is unavailable on this device. Use the basic local checker.');
      }
    });
  }
  load() { return this.request('load'); }
  check(text: string) { return this.request('check', text); }
  cancel(message = 'AI check cancelled.') {
    this.worker?.terminate();
    this.worker = null;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
    this.pending?.reject(new Error(message));
    this.pending = null;
  }
}
