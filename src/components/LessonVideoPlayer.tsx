import {useRef, useState} from 'react';
import {Play, Pause, Volume2, VolumeX, Captions, Maximize} from 'lucide-react';
const timeLabel=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
export function LessonVideoPlayer({src,poster,captions,label,describedBy,onError}:{src:string;poster:string;captions:string;label:string;describedBy?:string;onError?:()=>void}){
 const video=useRef<HTMLVideoElement>(null),frame=useRef<HTMLDivElement>(null);
 const [playing,setPlaying]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(0),[volume,setVolume]=useState(1),[muted,setMuted]=useState(false),[cc,setCc]=useState(true),[message,setMessage]=useState('');
 const button='inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-sky-400/40 px-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:opacity-40';
 async function toggle(){const media=video.current;if(!media)return;setMessage('');if(media.paused){try{await media.play();}catch{setMessage('Playback could not start. Please try again.');}}else media.pause();}
 function toggleCaptions(){const media=video.current;if(!media)return;const next=!cc;for(const track of Array.from(media.textTracks))track.mode=next?'showing':'hidden';setCc(next);}
 return <div ref={frame} className="overflow-hidden rounded-xl border border-sky-800 bg-[#071c35]" role="group" aria-label={`${label} player`}>
  <video ref={video} playsInline preload="metadata" poster={poster} controlsList="nodownload noremoteplayback" disablePictureInPicture disableRemotePlayback
   aria-label={label} aria-describedby={describedBy} className="aspect-video max-h-[75vh] w-full bg-slate-950" onContextMenu={event=>event.preventDefault()}
   onLoadedMetadata={event=>{const media=event.currentTarget;setDuration(Number.isFinite(media.duration)?media.duration:0);for(const track of Array.from(media.textTracks))track.mode=cc?'showing':'hidden';}}
   onTimeUpdate={event=>setTime(event.currentTarget.currentTime)} onDurationChange={event=>setDuration(Number.isFinite(event.currentTarget.duration)?event.currentTarget.duration:0)}
   onPlay={()=>{setPlaying(true);document.querySelectorAll<HTMLMediaElement>('audio, video').forEach(media=>{if(media!==video.current)media.pause();});}}
   onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onVolumeChange={event=>{setMuted(event.currentTarget.muted);setVolume(event.currentTarget.volume);}}
   onError={()=>{setPlaying(false);setMessage('The video could not load. You can read the transcript below.');onError?.();}}>
   <source src={src} type="video/mp4"/><track kind="captions" src={captions} srcLang="en" label="English" default/>
   Your browser cannot play this video. Read the transcript below.
  </video>
  <div className="space-y-2 border-t border-sky-700/60 p-3 text-white">
   <div className="flex items-center gap-3"><label className="sr-only" htmlFor={`seek-${src}`}>Video progress</label><input id={`seek-${src}`} type="range" min={0} max={duration||0} step={0.1} value={time} disabled={!duration} aria-label="Video progress" aria-valuetext={`${timeLabel(time)} of ${timeLabel(duration)}`} onChange={event=>{if(video.current){video.current.currentTime=Number(event.target.value);setTime(Number(event.target.value));}}} className="min-h-11 min-w-0 flex-1 accent-emerald-400"/><span className="whitespace-nowrap text-xs tabular-nums text-sky-100">{timeLabel(time)} / {timeLabel(duration)}</span></div>
   <div className="flex flex-wrap items-center gap-2">
    <button type="button" onClick={toggle} className={`${button} bg-emerald-700 hover:bg-emerald-600`} aria-label={playing?'Pause video':'Play video'}>{playing?<Pause size={17}/>:<Play size={17}/>} {playing?'Pause':'Play'}</button>
    <button type="button" className={button} aria-label={muted?'Unmute video':'Mute video'} onClick={()=>{if(video.current)video.current.muted=!video.current.muted;}}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>
    <input type="range" aria-label="Video volume" min={0} max={1} step={0.05} value={muted?0:volume} onChange={event=>{if(video.current){video.current.volume=Number(event.target.value);video.current.muted=false;}}} className="min-h-11 w-20 accent-emerald-400"/>
    <button type="button" className={button} aria-label="English captions" aria-pressed={cc} onClick={toggleCaptions}><Captions size={18}/> <span className="text-xs">{cc?'On':'Off'}</span></button>
    <button type="button" className={`${button} ml-auto`} aria-label="Fullscreen video" onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(frame.current?.requestFullscreen)await frame.current.requestFullscreen();else setMessage('Fullscreen is unavailable in this browser.');}catch{setMessage('Fullscreen is unavailable in this browser.');}}}><Maximize size={17}/></button>
   </div>
   {message&&<p role="status" className="text-sm text-sky-100">{message}</p>}
  </div>
 </div>;
}
