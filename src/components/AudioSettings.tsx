import { useEffect, useId, useRef, useState } from 'react';
import { Music, SlidersHorizontal, Volume2, X } from 'lucide-react';
import { useAudioSettings } from '../context/AudioContext';
import { soundFX } from '../utils/soundEffects';
import { InabelWovenStrip } from './FilipinianaMotifs';

export function AudioSettings({ inAccountMenu = false }: { inAccountMenu?: boolean }) {
  const { preferences, update, error } = useAudioSettings();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Audio settings" title="Audio settings"
        className={inAccountMenu
          ? 'flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky-300'
          : 'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-500/60 px-3 text-sm font-bold text-sky-100 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky-300'}>
        <SlidersHorizontal size={18} aria-hidden="true" /><span>Audio settings</span>
      </button>
      <dialog ref={dialog} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} aria-labelledby={id}
        className="m-auto max-h-[90dvh] w-[min(94vw,460px)] overflow-y-auto rounded-2xl border border-sky-600 bg-[#071930] p-0 text-white shadow-2xl backdrop:bg-slate-950/70">
        <InabelWovenStrip variant="azure" height={8} />
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id={id} className="font-display text-xl font-bold">Audio settings</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close audio settings" className="grid size-11 place-items-center rounded-xl border border-sky-700"><X size={18} /></button>
          </div>
          <p className="text-sm text-sky-100">Choose your listening levels. Your preferences are saved on this device.</p>
          {(['music', 'effects'] as const).map(kind => {
            const music = kind === 'music';
            const enabled = music ? preferences.musicEnabled : preferences.effectsEnabled;
            const volume = music ? preferences.musicVolume : preferences.effectsVolume;
            const title = music ? 'Music & sea ambience' : 'Sound effects';
            const Icon = music ? Music : Volume2;
            return (
              <fieldset key={kind} className="space-y-3 rounded-xl border border-sky-800 p-4">
                <legend className="px-1 font-bold"><Icon className="mr-2 inline text-emerald-300" size={18} aria-hidden="true" />{title}</legend>
                <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
                  <span>{music ? 'Enable music and ambience' : 'Enable sound effects'}</span>
                  <input type="checkbox" checked={enabled} className="size-5 accent-emerald-400" onChange={event => update(music ? { musicEnabled: event.target.checked } : { effectsEnabled: event.target.checked })} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="flex justify-between"><span>{music ? 'Music volume' : 'Effects volume'}</span><output>{volume}%</output></span>
                  <input type="range" min="0" max="100" step="5" value={volume} disabled={!enabled}
                    className="min-h-8 w-full accent-emerald-400 disabled:opacity-40"
                    aria-label={music ? 'Music volume' : 'Effects volume'} aria-valuetext={volume + ' percent'}
                    onChange={event => update(music ? { musicVolume: Number(event.target.value) } : { effectsVolume: Number(event.target.value) })} />
                </label>
              </fieldset>
            );
          })}
          <p className="text-xs leading-relaxed text-sky-200">Music starts after your first interaction, continues quietly during lessons, writing, and games. Ocean ambience accompanies island maps.</p>
          {error && <p role="status" className="text-sm text-amber-200">Audio could not start. Try again after closing this panel.</p>}
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" disabled={!preferences.effectsEnabled || !preferences.effectsVolume} onClick={() => soundFX.playCorrect()} className="min-h-11 rounded-xl border border-sky-500 px-4 text-sm font-bold disabled:opacity-40">Test sound effect</button>
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-xl bg-emerald-300 px-5 font-bold text-slate-950">Done</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
