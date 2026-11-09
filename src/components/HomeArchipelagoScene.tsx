import React, {useId, useState} from 'react';

/** Decorative scene using the selector's original vector paths/palettes.
 * No route controls, island labels or geographic/curriculum claims are added.
 * IDs are local to this SVG so it can coexist with the full selector.
 */
export function HomeArchipelagoScene({quarter = 1}: {quarter?: number}) {
 const [paused, setPaused] = useState(false);
 const activeQuarter = [1,2,3,4].includes(quarter) ? quarter : 1;
 const islandName = ["San Victor Island", "Oak Island", "Waniban Island", "Pujada Island"][activeQuarter - 1];
 const id=useId().replace(/[^a-zA-Z0-9]/g,'');
 return <div className={paused ? "lq-home-scene is-paused" : "lq-home-scene"}>
 <svg viewBox="0 0 480 320" className="block w-full rounded-2xl border border-sky-300/30" aria-hidden="true" focusable="false">
 <defs>
<linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#0b548b" />
<stop offset="22%" stopColor="#084270" />
<stop offset="50%" stopColor="#062e52" />
<stop offset="80%" stopColor="#041f39" />
<stop offset="100%" stopColor="#021120" />
</linearGradient>
<linearGradient id={`${id}-davaoSkyGrad`} x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#1e5cb3" />
<stop offset="30%" stopColor="#3b82f6" />
<stop offset="60%" stopColor="#60a5fa" />
<stop offset="82%" stopColor="#93c5fd" />
<stop offset="94%" stopColor="#fed7aa" />
<stop offset="100%" stopColor="#fef08a" />
</linearGradient>
<radialGradient id={`${id}-morningSunGlow`} cx="50%" cy="50%" r="50%">
<stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
<stop offset="25%" stopColor="#FEF08A" stopOpacity="0.9" />
<stop offset="55%" stopColor="#FDE047" stopOpacity="0.5" />
<stop offset="80%" stopColor="#FBBF24" stopOpacity="0.2" />
<stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
</radialGradient>
<radialGradient id={`${id}-cloudPuffGrad`} cx="50%" cy="32%" r="68%">
<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
<stop offset="35%" stopColor="#FEF9C3" stopOpacity="0.85" />
<stop offset="68%" stopColor="#FED7AA" stopOpacity="0.55" />
<stop offset="88%" stopColor="#BAE6FD" stopOpacity="0.25" />
<stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
</radialGradient>
<pattern id={`${id}-causticPattern`} width="48" height="22" patternUnits="userSpaceOnUse">
<path
d="M0 11 Q12 5 24 11 T48 11"
fill="none"
stroke="#7dd3fc"
strokeWidth="1.1"
opacity="0.38"
/>
<path
d="M12 17 Q24 9 36 17 T60 17"
fill="none"
stroke="#fef08a"
strokeWidth="0.8"
opacity="0.26"
/>
</pattern>
<linearGradient id={`${id}-forest`} x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#63c066" />
<stop offset=".55" stopColor="#2f8a4a" />
<stop offset="1" stopColor="#16553a" />
</linearGradient>
<linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#fffbe6" />
<stop offset="1" stopColor="#efd696" />
</linearGradient>
<radialGradient id={`${id}-glow`}>
<stop offset="0" stopColor="#5aa8ff" stopOpacity=".42" />
<stop offset="1" stopColor="#5aa8ff" stopOpacity="0" />
</radialGradient>
<radialGradient id={`${id}-shallow`}>
<stop offset="0" stopColor="#8ceaf0" stopOpacity=".95" />
<stop offset=".7" stopColor="#43b2d4" stopOpacity=".8" />
<stop offset="1" stopColor="#2b86b3" stopOpacity="0" />
</radialGradient>
<g id={`${id}-palm`}>
<path
d="M0 0 C3 -10 -1 -20 4 -30"
stroke="#8a5a2b"
strokeWidth="2.6"
fill="none"
strokeLinecap="round"
/>
<g stroke="#2f9a4c" strokeWidth="2.6" fill="none" strokeLinecap="round">
<path d="M4 -30 C-6 -40 -18 -36 -24 -26" />
<path d="M4 -30 C-2 -44 10 -48 20 -42" />
<path d="M4 -30 C14 -38 26 -32 28 -22" />
<path d="M4 -30 C-10 -32 -20 -26 -26 -18" />
<path d="M4 -30 C16 -28 24 -22 26 -14" />
</g>
</g>
 </defs>
 <rect width="480" height="110" fill={`url(#${id}-davaoSkyGrad)`}/>
 <rect y="100" width="480" height="220" fill={`url(#${id}-sea)`}/>
 <defs><clipPath id={`${id}-waterClip`}><rect y="103" width="480" height="217"/></clipPath></defs>
 <g clipPath={`url(#${id}-waterClip)`}><rect className="lq-home-caustics" x="-48" y="100" width="576" height="240" fill={`url(#${id}-causticPattern)`} opacity=".6"/></g>
 <g fill={`url(#${id}-cloudPuffGrad)`}><ellipse cx="75" cy="47" rx="55" ry="21"/><ellipse cx="116" cy="41" rx="62" ry="24"/><ellipse cx="162" cy="49" rx="55" ry="21"/></g>
 <circle cx="402" cy="49" r="48" fill={`url(#${id}-morningSunGlow)`}/><circle cx="402" cy="49" r="10" fill="#fffbeb"/>
 <path d="M0 100h480" stroke="#fef08a" strokeWidth="3" opacity=".3"/>
 <g clipPath={`url(#${id}-waterClip)`}><g className="lq-home-waves" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity=".38"><path d="M0 130q40-12 80 0t80 0 80 0 80 0 80 0 80 0M0 180q40-12 80 0t80 0 80 0 80 0 80 0 80 0M0 232q40-12 80 0t80 0 80 0 80 0 80 0 80 0M0 284q40-12 80 0t80 0 80 0 80 0 80 0 80 0"/></g></g>
 <path d="M92 275C166 301 194 264 239 221" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 8" opacity=".7"/>
{activeQuarter === 1 && <g data-quarter="1" transform="translate(285 178) scale(1.45)">
<ellipse rx="118" ry="60" fill={`url(#${id}-glow)`} />
<ellipse rx="96" ry="48" fill={`url(#${id}-shallow)`} opacity=".85" />
<ellipse rx="78" ry="38" fill="#5eead4" opacity=".25" />
<path
d="M-82 12 C-88 -12 -54 -38 0 -40 C56 -42 90 -16 84 14 C76 36 28 44 -12 42 C-52 40 -76 30 -82 12Z"
fill="none"
stroke="#ffffff"
strokeWidth="1.4"
strokeOpacity=".45"
strokeDasharray="4 3"
/>
<g transform="translate(-86, 18) scale(0.85)">
<ellipse cx="0" cy="4" rx="6" ry="2.5" fill="#0284c7" opacity=".4" />
<rect x="-3" y="-1" width="6" height="5" fill="#f8fafc" rx="1" />
<polygon points="-4,-1 4,-1 0,-6" fill="#ef4444" />
<line x1="0" y1="-6" x2="0" y2="-10" stroke="#f8fafc" strokeWidth="1" />
<circle cx="0" cy="-10" r="1.5" fill="#f59e0b" />
</g>
<g transform="translate(56, 26) scale(0.68) rotate(-14)">
<ellipse cx="0" cy="3" rx="14" ry="4" fill="#0f766e" opacity=".35" />
<line x1="-15" y1="-8" x2="15" y2="-8" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
<line x1="-15" y1="8" x2="15" y2="8" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
<line x1="-6" y1="-8" x2="-6" y2="8" stroke="#78350f" strokeWidth="1.2" />
<line x1="6" y1="-8" x2="6" y2="8" stroke="#78350f" strokeWidth="1.2" />
<path d="M-16 0 C-12 -3 12 -3 16 0 C12 3 -12 3 -16 0Z" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />
<rect x="-8" y="-2.5" width="16" height="5" rx="1.5" fill="#0284c7" />
</g>
<g transform="translate(-48, 28) scale(0.55)">
<path d="M 0,0 Q 5,-7 10,0 Q 15,-7 20,0 Q 10,9 0,0 Z" fill="#0d9488" stroke="#5eead4" strokeWidth="1.2" />
<circle cx="10" cy="0" r="2" fill="#6ee7b7" />
</g>
<path
d="M-64 16 C-68 -10 -38 -30 4 -32 C48 -34 68 -12 66 12 C64 28 36 34 0 34 C-36 34 -60 28 -64 16Z"
fill={`url(#${id}-sand)`}
/>
<path
d="M-52 14 C-55 -4 -28 -20 2 -22 C36 -24 54 -6 52 10 C50 22 26 27 -2 27 C-30 27 -48 22 -52 14Z"
fill="#fff8e7"
opacity=".75"
/>
<g transform="translate(-32, 6)">
<rect x="-4" y="-2" width="8" height="5" fill="#f8fafc" rx="0.8" />
<polygon points="-5,-2 5,-2 0,-6" fill="#b45309" />
</g>
<g transform="translate(-18, 10)">
<rect x="-3.5" y="-2" width="7" height="4.5" fill="#f8fafc" rx="0.8" />
<polygon points="-4.5,-2 4.5,-2 0,-5" fill="#b45309" />
</g>
<path
d="M-44 8 C-46 -14 -24 -36 6 -36 C34 -36 50 -16 46 6 C42 16 18 20 -4 20 C-26 20 -42 16 -44 8Z"
fill={`url(#${id}-forest)`}
/>
<g fill="#166534" opacity=".8">
<ellipse cx="-28" cy="2" rx="11" ry="8" />
<ellipse cx="-12" cy="-12" rx="13" ry="9" />
<ellipse cx="6" cy="-18" rx="14" ry="10" />
<ellipse cx="26" cy="-8" rx="12" ry="8" />
<ellipse cx="34" cy="4" rx="10" ry="7" />
<ellipse cx="14" cy="6" rx="13" ry="8" />
<ellipse cx="-8" cy="8" rx="12" ry="7" />
</g>
<g fill="#22c55e" opacity=".7">
<ellipse cx="-18" cy="-6" rx="8" ry="6" />
<ellipse cx="2" cy="-16" rx="10" ry="7" />
<ellipse cx="20" cy="-12" rx="8" ry="6" />
<ellipse cx="8" cy="-2" rx="9" ry="6" />
</g>
<g fill="#86efac" opacity=".4">
<ellipse cx="0" cy="-20" rx="6" ry="3.5" />
<ellipse cx="16" cy="-15" rx="5" ry="3" />
</g>
<g transform="translate(6, -26)">
<path
d="M0 8 C1 -6 3 -16 2 -26"
stroke="#78350f"
strokeWidth="2.2"
fill="none"
strokeLinecap="round"
/>
<g stroke="#15803d" strokeWidth="2.2" fill="none" strokeLinecap="round">
<path d="M2 -26 C-7 -34 -15 -30 -18 -22" />
<path d="M2 -26 C-2 -37 7 -40 14 -35" />
<path d="M2 -26 C11 -33 19 -28 20 -19" />
<path d="M2 -26 C-8 -26 -14 -20 -17 -13" />
<path d="M2 -26 C12 -23 18 -18 19 -11" />
</g>
<circle cx="2" cy="-26" r="2.2" fill="#854d0e" />
</g>
<use href={`#${id}-palm`} transform="translate(-24, -14) scale(0.9)" />
<use href={`#${id}-palm`} transform="translate(28, -6) scale(0.75)" />
<path
d="M-58 18 C-36 28 0 28 36 24 C54 22 62 14 62 10"
stroke="#ffffff"
strokeWidth="1.5"
fill="none"
strokeLinecap="round"
opacity=".7"
/>
 </g>}
{activeQuarter === 2 && <g data-quarter="2" transform="translate(285 178) scale(1.45)"><ellipse rx="104" ry="48" fill={`url(#${id}-glow)`} opacity=".7" />
<ellipse rx="82" ry="36" fill={`url(#${id}-shallow)`} />
<ellipse rx="62" ry="25" fill="#9bf0f4" opacity=".28" />
<g fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.2">
<ellipse rx="72" ry="30" />
<ellipse rx="52" ry="21" />
</g>
<path
d="M-52 6 C-46 -12 -6 -18 32 -9 C58 -4 62 9 44 16 C12 24 -42 22 -52 6Z"
fill={`url(#${id}-sand)`}
/>
<path
d="M-40 4 C-35 -7 -4 -12 26 -6 C46 -2 48 6 34 11 C10 17 -32 16 -40 4Z"
fill="#fff8e7"
opacity=".7"
/>
<path
d="M-28 6 C-14 3 6 4 20 8 M-15 11 C-4 9 10 10 18 13"
stroke="#dfc08b"
strokeWidth="1.2"
strokeLinecap="round"
fill="none"
opacity=".55"
/></g>}
{activeQuarter === 3 && <g data-quarter="3" transform="translate(285 178) scale(1.2)"><ellipse rx="120" ry="50" fill={`url(#${id}-glow)`} />
<path
d="M-84 6 C-82 -22 -30 -34 24 -30 C74 -26 112 -4 120 10 C100 30 -50 40 -84 6Z"
fill={`url(#${id}-shallow)`}
opacity=".8"
/>
<g fill="#1d7fa6" opacity=".38">
<ellipse cx="-50" cy="15" rx="10" ry="4" />
<ellipse cx="30" cy="22" rx="12" ry="4" />
<ellipse cx="72" cy="15" rx="9" ry="3" />
<ellipse cx="-8" cy="-18" rx="8" ry="3" />
<ellipse cx="-72" cy="2" rx="6" ry="3" />
</g>
<path
d="M-62 6 C-58 -8 -20 -14 14 -12 C40 -10 66 -2 110 8 C78 8 56 14 30 14 C-6 20 -52 18 -62 6Z"
fill={`url(#${id}-sand)`}
/>
<path
d="M-54 4 C-54 -12 -36 -22 -20 -16 C-6 -14 0 -4 -2 4 C-20 10 -44 10 -54 4Z"
fill={`url(#${id}-forest)`}
/>
<g fill="#1d6a3a" opacity=".5">
<circle cx="-38" cy="-2" r="4" />
<circle cx="-18" cy="-4" r="4" />
</g>
<use href={`#${id}-palm`} transform="translate(-34,-4) scale(.9)" />
<use href={`#${id}-palm`} transform="translate(-14,-2) scale(.72)" /></g>}
{activeQuarter === 4 && <g data-quarter="4" transform="translate(285 178) scale(1.2)"><ellipse rx="135" ry="64" fill={`url(#${id}-glow)`} />
<path
d="M-100 12 C-98 -30 -30 -46 40 -38 C98 -30 118 6 96 32 C60 56 -64 58 -100 12Z"
fill={`url(#${id}-shallow)`}
opacity=".7"
/>
<path
d="M-84 12 C-82 -14 -30 -24 22 -20 C72 -16 96 -2 92 16 C72 36 -52 40 -84 12Z"
fill={`url(#${id}-sand)`}
/>
<path
d="M-72 8 C-68 -22 -46 -40 -16 -38 C-2 -50 28 -46 40 -26 C62 -24 76 -8 68 10 C40 22 -42 24 -72 8Z"
fill={`url(#${id}-forest)`}
/>
<path
d="M-52 -8 C-42 -28 -22 -34 -8 -30 C-22 -22 -36 -14 -52 -8Z"
fill="#8be08b"
opacity=".45"
/>
<path
d="M10 -32 C24 -42 42 -34 46 -22 C34 -22 20 -24 10 -32Z"
fill="#8be08b"
opacity=".35"
/>
<g fill="#1d6a3a" opacity=".5">
<circle cx="-44" cy="-4" r="5" />
<circle cx="-20" cy="-14" r="6" />
<circle cx="14" cy="-12" r="6" />
<circle cx="46" cy="-4" r="5" />
<circle cx="-4" cy="2" r="5" />
</g>
<path
d="M-76 14 C-44 34 34 36 74 14"
stroke="#fffdf0"
strokeWidth="3.5"
fill="none"
strokeLinecap="round"
opacity=".9"
/>
<use href={`#${id}-palm`} transform="translate(-26,-26) scale(1.1)" />
<use href={`#${id}-palm`} transform="translate(12,-32) scale(1)" />
<use href={`#${id}-palm`} transform="translate(40,-14) scale(.8)" /></g>}
 <g transform="translate(123 263) scale(1.8)"><g className="lq-home-boat">
<ellipse
rx="30"
ry="8"
fill="none"
stroke="#bfe3ff"
strokeOpacity=".6"
strokeWidth="1.5"
/>
<circle r="24" fill="#ffd45a" opacity=".1" />
<g
>
<path
d="M-28 6 L28 6"
stroke="#ffe9a8"
strokeWidth="2.6"
strokeLinecap="round"
/>
<path
d="M-16 5 L-14 -1 M16 5 L14 -1"
stroke="#caa86a"
strokeWidth="1.4"
strokeLinecap="round"
/>
<path
d="M-15 -3 C-11 7 11 7 15 -3Z"
fill="#8a4b22"
stroke="#4e2810"
strokeWidth="1"
/>
<path
d="M0 -3 L0 -31"
stroke="#5a3418"
strokeWidth="1.6"
strokeLinecap="round"
/>
<path d="M1 -30 L6.1 -22 L1 -22Z" fill="#ff6b6b" />
<path d="M1 -22 L6.1 -22 L11.6 -13.5 L1 -13.5Z" fill="#ffd166" />
<path d="M1 -13.5 L11.6 -13.5 L17 -5 L1 -5Z" fill="#4dabf7" />
<circle cx="0" cy="-32" r="2.2" fill="#ffb53d" />
</g>
 </g></g>
 </svg>
 <div className="mt-2 flex items-center justify-between gap-3 text-xs text-sky-100"><span>Quarter {activeQuarter} · {islandName}</span><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="min-h-11 shrink-0 rounded-lg border border-sky-300/40 px-3 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">{paused ? "Play water" : "Pause water"}</button></div>
 </div>;
}
