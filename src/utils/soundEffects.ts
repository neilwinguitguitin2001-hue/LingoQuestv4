import { createPaddleBuffer } from './paddleSound';
// Synthesized Web Audio API sound effects for LingoQuest game interactions
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume = 0.65;
  private output: GainNode | null = null;
  private sailing: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('lingoquest_sound_muted');
      if (saved === 'true') {
        this.muted = true;
      }
    } catch {
      // ignore storage errors
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted || this.volume === 0 || typeof window === 'undefined' || document.hidden) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.output = this.ctx.createGain();
        this.output.gain.value = this.volume;
        this.output.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.updateOutput();
    try {
      localStorage.setItem('lingoquest_sound_muted', String(this.muted));
    } catch {
      // ignore
    }
  }

  private updateOutput() {
    if (!this.ctx || !this.output) return;
    this.output.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.025);
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateOutput();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public playTimeExpired() {
    this.playSoftNotes([440, 392, 329.63], 0.055, 0.12);
  }

  public playTryAgain() {
    this.playSoftNotes([293.66, 349.23, 392], 0.065, 0.16);
  }

  public playPowerUp() {
    this.playSoftNotes([440, 659.25, 880], 0.07, 0.06);
  }

  public stopSailing() {
    const previous = this.sailing;
    this.sailing = null;
    if (!previous || !this.ctx) return;
    previous.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.015);
    previous.source.stop(this.ctx.currentTime + 0.07);
  }

  public playSailing(duration = 1.8) {
    this.stopSailing();
    const context = this.getContext();
    if (!context) return;
    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = createPaddleBuffer(context, Math.max(0.3, Math.min(2.6, duration)));
      gain.gain.value = 0.75;
      source.connect(gain).connect(this.output!);
      const active = { source, gain };
      this.sailing = active;
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (this.sailing === active) this.sailing = null;
      };
      source.start();
    } catch {
      // Audio availability must not interrupt island navigation.
    }
  }

  public playPass() {
    this.playCorrect();
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.output!);
      osc.start();
      osc.stop(ctx.currentTime + 0.065);
    } catch {
      // ignore audio context errors
    }
  }

  public playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const startTime = ctx.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
        osc.connect(gain);
        gain.connect(this.output!);
        osc.start(startTime);
        osc.stop(startTime + 0.19);
      });
    } catch {
      // ignore
    }
  }

  private playSoftNotes(notes: number[], volume: number, spacing = 0.09) {
    const context = this.getContext();
    if (!context) return;
    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * spacing;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      oscillator.connect(gain).connect(this.output!);
      oscillator.start(start);
      oscillator.stop(start + 0.26);
    });
  }

  public playIncorrect() {
    this.playSoftNotes([392, 329.63], 0.055);
  }

  public playQuestStart() {
    this.playSoftNotes([392, 523.25, 587.33], 0.075);
  }

  public playCoinExchange() {
    this.playSoftNotes([659.25, 987.77, 1318.51], 0.065, 0.055);
  }

  public playBridgeRestored() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const startTime = ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(this.output!);
        osc.start(startTime);
        osc.stop(startTime + 0.46);
      });
    } catch {
      // ignore
    }
  }

  public playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Triumphant ascending arpeggio fanfare (C4, E4, G4, C5, E5, G5, C6)
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx >= 4 ? 'triangle' : 'sine';
        const startTime = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(idx === notes.length - 1 ? 0.22 : 0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === notes.length - 1 ? 0.8 : 0.28));
        osc.connect(gain);
        gain.connect(this.output!);
        osc.start(startTime);
        osc.stop(startTime + (idx === notes.length - 1 ? 0.85 : 0.3));
      });
    } catch {
      // ignore
    }
  }

  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Sparkly victory chime
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major sparkle
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const startTime = ctx.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        osc.connect(gain);
        gain.connect(this.output!);
        osc.start(startTime);
        osc.stop(startTime + 0.52);
      });
    } catch {
      // ignore
    }
  }
}

export const soundFX = new SoundManager();
