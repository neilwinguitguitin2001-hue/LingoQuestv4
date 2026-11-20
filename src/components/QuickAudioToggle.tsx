import {useRef} from 'react';
import {Volume2, VolumeX} from 'lucide-react';
import {useAudioSettings} from '../context/AudioContext';

/** One action for music and effects, preserving the user's individual levels. */
export function QuickAudioToggle(){
 const {preferences,update}=useAudioSettings();
 const previous=useRef({musicEnabled:true,effectsEnabled:true});
 const muted=!preferences.musicEnabled&&!preferences.effectsEnabled;
 function toggle(){
  if(muted)update(previous.current);
  else {
   previous.current={musicEnabled:preferences.musicEnabled,effectsEnabled:preferences.effectsEnabled};
   update({musicEnabled:false,effectsEnabled:false});
  }
 }
 return <button type="button" onClick={toggle} aria-pressed={muted}
  aria-label={muted?'Unmute background music and sound effects':'Mute background music and sound effects'}
  title={muted?'Unmute music and effects':'Mute music and effects'}
  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-400/60 bg-sky-950/60 px-3 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
  {muted?<VolumeX size={18} aria-hidden="true"/>:<Volume2 size={18} aria-hidden="true"/>}
  <span>{muted?'Unmute':'Mute'}</span>
 </button>;
}
