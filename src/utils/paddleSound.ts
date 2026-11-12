// Original water Foley: paddle entry, underwater pull, and a few trailing drips.
// Noise and short damped bubbles replace pitched notification notes.
export function createPaddleBuffer(context: AudioContext, duration: number): AudioBuffer {
  const rate = context.sampleRate;
  const frames = Math.ceil(rate * duration);
  const buffer = context.createBuffer(2, frames, rate);
  for (let channel = 0; channel < 2; channel++) {
    const samples = buffer.getChannelData(channel);
    let water = 0;
    let spray = 0;
    for (let index = 0; index < frames; index++) {
      const time = index / rate;
      const stroke = Math.floor(time / 0.72);
      const phase = time - stroke * 0.72;
      const noise = Math.random() * 2 - 1;
      water += 0.045 * (noise - water);
      spray += 0.32 * (noise - spray);
      const entry = Math.min(phase / 0.018, 1) * Math.exp(-phase * 25);
      const pull = phase > 0.045 && phase < 0.49
        ? Math.sin(Math.PI * (phase - 0.045) / 0.445) ** 1.4 : 0;
      const pan = stroke % 2 === channel ? 1 : 0.72;
      let sample = (water * pull * 0.9 + spray * entry * 0.16) * pan;
      for (const drip of [0.43, 0.51, 0.59]) {
        const age = phase - drip;
        if (age > 0 && age < 0.065) {
          const frequency = 730 + channel * 43 + drip * 850;
          sample += Math.sin(2 * Math.PI * frequency * (age - age * age * 2))
            * Math.min(age / 0.003, 1) * Math.exp(-age * 85) * 0.017;
        }
      }
      // Fade the travel cue at its own edges, without affecting the music loop.
      const edge = Math.min(1, time / 0.025, (duration - time) / 0.12);
      samples[index] = sample * edge;
    }
  }
  return buffer;
}
