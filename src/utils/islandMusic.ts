// Island Breeze: an original instrumental loop built from soft plucks and sustained chords.
export function createIslandMusic(context: AudioContext) {
  const rate = 22050;
  const beat = 0.75;
  const length = 24 * rate;
  const buffer = context.createBuffer(2, length, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const chords = [
    [50, 57, 62, 65], [46, 53, 60, 65], [53, 60, 65, 69], [48, 55, 62, 64],
    [50, 57, 62, 69], [46, 53, 62, 65], [53, 60, 65, 69], [48, 55, 62, 64],
  ];
  const pattern = [[0, 2], [0.75, 1], [1.5, 3], [2.5, 2], [3.25, 1]];

  function mixNote(midi: number, start: number, duration: number, volume: number, pan: number, pluck: boolean) {
    const phaseIncrement = 2 * Math.PI * 440 * 2 ** ((midi - 69) / 12) / rate;
    const frames = Math.round(duration * rate);
    const offset = Math.round(start * rate);
    const leftGain = Math.sqrt(1 - pan) * volume;
    const rightGain = Math.sqrt(pan) * volume;

    for (let frame = 0; frame < frames; frame++) {
      const time = frame / rate;
      const phase = frame * phaseIncrement;
      const envelope = pluck
        ? Math.min(time / 0.013, 1) * Math.exp(-3.6 * time) * Math.min((duration - time) / 0.11, 1)
        : Math.sin(Math.PI * frame / frames) ** 1.8;
      const tone = Math.sin(phase) + (pluck ? 0.28 * Math.exp(-3 * time) : 0.12) * Math.sin(2 * phase);
      const sample = tone * envelope;
      const index = (offset + frame + length) % length;
      left[index] += sample * leftGain;
      right[index] += sample * rightGain;
    }
  }

  chords.forEach((chord, bar) => {
    const start = bar * 4 * beat;
    chord.forEach((note, index) => mixNote(note, start - 0.3, 3.55, 0.035, 0.22 + index * 0.17, false));
    for (const [offset, index] of pattern) {
      const note = chord[index] + 12;
      const time = start + offset * beat;
      mixNote(note, time, 1.38, 0.072, 0.32 + index * 0.1, true);
      mixNote(note, time + 0.22, 1.38, 0.013, 0.75, true);
    }
  });

  const track = context.createBufferSource();
  track.buffer = buffer;
  track.loop = true;
  const gain = context.createGain();
  gain.gain.value = 0.32;
  track.connect(gain).connect(context.destination);
  return track;
}
