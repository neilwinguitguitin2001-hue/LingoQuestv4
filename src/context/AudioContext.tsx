import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createIslandMusic, createSeaAmbience } from '../utils/islandMusic';
import { soundFX } from '../utils/soundEffects';

type AudioPreferences = {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
};
const storageKey = 'lingoquest_audio_settings_v1';

function loadPreferences(): AudioPreferences {
  const defaults: AudioPreferences = { musicEnabled: true, effectsEnabled: true, musicVolume: 45, effectsVolume: 65 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : localStorage.getItem('lingoquest_background_music') !== 'false',
      effectsEnabled: typeof saved.effectsEnabled === 'boolean' ? saved.effectsEnabled : localStorage.getItem('lingoquest_sound_muted') !== 'true',
      musicVolume: Number.isFinite(saved.musicVolume) ? Math.max(0, Math.min(100, saved.musicVolume)) : defaults.musicVolume,
      effectsVolume: Number.isFinite(saved.effectsVolume) ? Math.max(0, Math.min(100, saved.effectsVolume)) : defaults.effectsVolume,
    };
  } catch { return defaults; }
}

type AudioControls = {
  preferences: AudioPreferences;
  update: (changes: Partial<AudioPreferences>) => void;
  error: boolean;
  setStudy: (study: boolean) => void;
  setQuiz: (quiz: boolean) => void;
  registerMap: () => () => void;
};
const AudioControlsContext = createContext<AudioControls | null>(null);
export function useAudioSettings() {
  const controls = useContext(AudioControlsContext);
  if (!controls) throw new Error('Audio settings require AudioProvider.');
  return controls;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [error, setError] = useState(false);
  const [study, setStudy] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [maps, setMaps] = useState(0);
  const engine = useRef<{ context: AudioContext; music: GainNode; sea: GainNode } | null>(null);
  const suspendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ preferences, study, quiz, maps });
  latest.current = { preferences, study, quiz, maps };

  function syncAudio() {
    const { preferences: value, study: reading, quiz: playing, maps: visibleMaps } = latest.current;
    const output = engine.current;
    if (!output) return;
    const { context, music, sea } = output;
    const audible = value.musicEnabled && value.musicVolume > 0 && !document.hidden;
    const volume = audible ? value.musicVolume / 100 : 0;
    music.gain.setTargetAtTime(volume * (playing ? 0.4 : reading ? 0.25 : visibleMaps ? 0.55 : 1), context.currentTime, 0.25);
    sea.gain.setTargetAtTime(visibleMaps && audible && !playing ? volume * 0.8 : 0, context.currentTime, 0.25);
    // Keep the same looping sources through navigation and mute changes. Fade
    // before suspending a hidden tab, and cancel stale suspension on return.
    if (suspendTimer.current !== null) clearTimeout(suspendTimer.current);
    suspendTimer.current = null;
    if (document.hidden) {
      suspendTimer.current = setTimeout(() => {
        if (document.hidden && engine.current === output) void context.suspend().catch(() => {});
        suspendTimer.current = null;
      }, 1500);
    } else if (audible) {
      void context.resume().catch(() => {});
    }
  }

  function unlockAudio() {
    const current = latest.current;
    soundFX.setMuted(!current.preferences.effectsEnabled);
    soundFX.setVolume(current.preferences.effectsVolume / 100);
    if (!current.preferences.musicEnabled || !current.preferences.musicVolume || document.hidden) return;
    try {
      if (!engine.current) {
        const context = new AudioContext();
        const music = context.createGain();
        const sea = context.createGain();
        music.gain.value = 0;
        sea.gain.value = 0;
        music.connect(context.destination);
        sea.connect(context.destination);
        engine.current = { context, music, sea };
        createIslandMusic(context, music).start();
        createSeaAmbience(context, sea).start();
      }
      syncAudio();
      setError(false);
    } catch { setError(true); }
  }

  useEffect(() => {
    document.addEventListener('pointerup', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('visibilitychange', syncAudio);
    return () => {
      document.removeEventListener('pointerup', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('visibilitychange', syncAudio);
      if (suspendTimer.current !== null) clearTimeout(suspendTimer.current);
      const context = engine.current?.context;
      engine.current = null;
      if (context) void context.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    soundFX.setMuted(!preferences.effectsEnabled);
    soundFX.setVolume(preferences.effectsVolume / 100);
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch {}
    syncAudio();
  }, [preferences, study, quiz, maps]);

  return (
    <AudioControlsContext.Provider value={{
      preferences, error, setStudy, setQuiz,
      update: changes => setPreferences(previous => ({ ...previous, ...changes })),
      registerMap: () => {
        setMaps(count => count + 1);
        return () => setMaps(count => Math.max(0, count - 1));
      },
    }}>
      {children}
    </AudioControlsContext.Provider>
  );
}

// These hooks keep audio in sync with the actual rendered screen.
export function AudioScene({ study }: { study: boolean }) {
  const { setStudy } = useAudioSettings();
  useEffect(() => { setStudy(study); return () => setStudy(false); }, [study, setStudy]);
  return null;
}

export function useMapAudio() {
  const { registerMap } = useAudioSettings();
  const register = useRef(registerMap);
  useEffect(() => register.current(), []);
}
