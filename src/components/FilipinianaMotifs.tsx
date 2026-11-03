import React from 'react';
import { Check, Lock, Play, Sparkles } from 'lucide-react';
import type { Module } from '../types/lingoquest';

// ============================================================================
// 1. <InabelWovenStrip /> — Repeating Geometric Inabel / Yakan / Dagmay SVG Strip
// ============================================================================
export const InabelWovenStrip: React.FC<{
  variant?: 'crimson' | 'emerald' | 'gold' | 'azure' | 'charcoal';
  height?: number;
  className?: string;
}> = ({ variant = 'crimson', height = 10, className = '' }) => {
  const palette = {
    crimson: { bg: '#123B63', chevron: '#38BDF8', diamond: '#DBEAFE', dot: '#07192F' },
    emerald: { bg: '#075E54', chevron: '#38BDF8', diamond: '#DCFCE7', dot: '#07192F' },
    gold: { bg: '#0F3460', chevron: '#22C55E', diamond: '#DBEAFE', dot: '#07192F' },
    azure: { bg: '#075985', chevron: '#22C55E', diamond: '#E0F2FE', dot: '#07192F' },
    charcoal: { bg: '#07192F', chevron: '#34D399', diamond: '#DBEAFE', dot: '#07192F' },
  }[variant];

  const patternId = `inabel-pattern-${variant}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div
      className={`w-full overflow-hidden select-none leading-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg width="100%" height={height} preserveAspectRatio="none" className="block w-full h-full">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="32"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <rect width="32" height={height} fill={palette.bg} />
            {/* Inabel / Yakan Chevron Zigzag */}
            <path
              d={`M 0 ${height} L 8 2 L 16 ${height} L 24 2 L 32 ${height}`}
              fill="none"
              stroke={palette.chevron}
              strokeWidth="2.2"
              strokeLinejoin="miter"
            />
            {/* Yakan Central Eye Diamonds */}
            <polygon
              points={`8,3 11,${height / 2} 8,${height - 2} 5,${height / 2}`}
              fill={palette.diamond}
            />
            <polygon
              points={`24,3 27,${height / 2} 24,${height - 2} 21,${height / 2}`}
              fill={palette.diamond}
            />
            <circle cx="16" cy={height / 2} r="1.4" fill={palette.dot} />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

// ============================================================================
// 2. <PhilippineSunMedallion /> — 8-Rayed Golden Sun SVG Medallion (XP / Coins)
// ============================================================================
export const PhilippineSunMedallion: React.FC<{
  size?: number;
  className?: string;
  animated?: boolean;
}> = ({ size = 24, className = '', animated = false }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${animated ? 'animate-lq-orbit-spin' : ''} ${className}`}
      aria-hidden="true"
    >
      {/* Outer Woodcut Medallion Disc */}
      <circle cx="24" cy="24" r="22" fill="#FFF8E1" stroke="#231F20" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="19" fill="#FFFDFB" stroke="#F57F17" strokeWidth="1.2" strokeDasharray="3 2" />

      {/* 8 Iconic Three-Pronged Philippine Sun Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 24 24)`}>
          {/* Main Central Ray */}
          <polygon points="24,4 26.3,14 21.7,14" fill="#F57F17" stroke="#231F20" strokeWidth="0.9" />
          {/* Flanking Sub-rays */}
          <polygon points="20.5,7 22,14.5 19.5,14.5" fill="#FFB300" />
          <polygon points="27.5,7 28.5,14.5 26,14.5" fill="#FFB300" />
        </g>
      ))}

      {/* Sun Core */}
      <circle cx="24" cy="24" r="8.5" fill="#F57F17" stroke="#231F20" strokeWidth="2" />
      <circle cx="24" cy="24" r="4.5" fill="#FFF59D" />
    </svg>
  );
};

// ============================================================================
// 3. <MayonStreakBadge /> — Glowing Mayon Volcano / Sunrise Flare Streak Icon
// ============================================================================
export const MayonStreakBadge: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Medallion Rim */}
      <circle cx="24" cy="24" r="22" fill="#FFF3E0" stroke="#231F20" strokeWidth="2.5" />
      {/* Golden Sunrise Halo Behind Cone */}
      <circle cx="24" cy="21" r="12" fill="#F57F17" opacity="0.35" />
      {/* Glowing Summit Lava Plume / Flame */}
      <path
        d="M24 6 C27 10, 29 13, 26 17 C28 15, 25 19, 24 19 C22 19, 20 15, 22 12 C21 10, 23 8, 24 6 Z"
        fill="#C62828"
        stroke="#231F20"
        strokeWidth="1.4"
      />
      <path d="M24 9 C25.5 12, 26 14, 24 16 C22.5 14, 23 12, 24 9 Z" fill="#FFD54F" />
      {/* Symmetric Mayon Volcano Cone */}
      <path
        d="M7 38 Q18 28 21.5 17 L26.5 17 Q30 28 41 38 Z"
        fill="#6D4C41"
        stroke="#231F20"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Lava Ridge Accent */}
      <path
        d="M22.5 17 L21 26 L24 23 L26.5 27 L25.5 17 Z"
        fill="#D84315"
      />
      {/* Emerald Rice Terrace Foothills */}
      <path
        d="M6 38 Q24 33 42 38 L40 42 Q24 44 8 42 Z"
        fill="#2E7D32"
        stroke="#231F20"
        strokeWidth="1.8"
      />
    </svg>
  );
};

// ============================================================================
// 4. <JeepneyMarkerSVG /> & <PhilippineEagleMarkerSVG /> — Active Lesson Nodes
// ============================================================================
export const JeepneyMarkerSVG: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 44, className = '' }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.72)}
      viewBox="0 0 88 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none animate-jeepney-bounce ${className}`}
      aria-label="Active Lesson Jeepney"
    >
      {/* Roof Signboard & Fiesta Pennants */}
      <rect x="20" y="6" width="38" height="8" rx="2" fill="#F57F17" stroke="#231F20" strokeWidth="2.2" />
      <line x1="25" y1="10" x2="53" y2="10" stroke="#C62828" strokeWidth="2.2" />
      {/* Chrome Hood Horses */}
      <circle cx="71" cy="23" r="3" fill="#FFD54F" stroke="#231F20" strokeWidth="1.8" />
      {/* Main Jeepney Body */}
      <path
        d="M8 14 H58 L66 26 H80 C82.5 26 84 28 84 31 V46 H8 V14 Z"
        fill="#C62828"
        stroke="#231F20"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Sunburst Gold & Tropical Cyan Side Stripes */}
      <rect x="10" y="32" width="72" height="5" fill="#F57F17" stroke="#231F20" strokeWidth="1.5" />
      <rect x="10" y="37" width="72" height="4" fill="#00838F" />
      {/* Passenger Windows & Windshield */}
      <rect x="13" y="18" width="12" height="10" rx="2" fill="#FFFDFB" stroke="#231F20" strokeWidth="2" />
      <rect x="28" y="18" width="12" height="10" rx="2" fill="#FFFDFB" stroke="#231F20" strokeWidth="2" />
      <polygon points="44,18 56,18 62,28 44,28" fill="#E0F7FA" stroke="#231F20" strokeWidth="2" />
      {/* Headlight */}
      <circle cx="82" cy="35" r="3.5" fill="#FFF59D" stroke="#231F20" strokeWidth="1.8" />
      {/* Wheels with Whitewall Tires */}
      <circle cx="24" cy="48" r="10" fill="#231F20" />
      <circle cx="24" cy="48" r="6" fill="#FFFDFB" />
      <circle cx="24" cy="48" r="3" fill="#F57F17" />
      <circle cx="66" cy="48" r="10" fill="#231F20" />
      <circle cx="66" cy="48" r="6" fill="#FFFDFB" />
      <circle cx="66" cy="48" r="3" fill="#F57F17" />
    </svg>
  );
};

export const PhilippineEagleMarkerSVG: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none animate-float-slow ${className}`}
      aria-label="Philippine Eagle Guide"
    >
      {/* Outstretched Crown & Wings */}
      <path
        d="M6 26 Q18 14 28 28 L32 22 L36 28 Q46 14 58 26 Q46 38 36 36 L32 46 L28 36 Q18 38 6 26 Z"
        fill="#6D4C41"
        stroke="#231F20"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* White Chest Crest */}
      <circle cx="32" cy="31" r="7" fill="#FFFDFB" stroke="#231F20" strokeWidth="2" />
      {/* Iconic Golden-Blue Hooked Beak */}
      <polygon points="32,29 36,34 32,37 28,34" fill="#F57F17" stroke="#231F20" strokeWidth="1.6" />
      {/* Crown Feathers */}
      <path d="M25 18 L28 24 M32 15 L32 22 M39 18 L36 24" stroke="#231F20" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

// ============================================================================
// 5. <BandurriaListenIcon /> — Stylized Filipino Bandurria / Guitar Audio Icon
// ============================================================================
export const BandurriaListenIcon: React.FC<{
  size?: number;
  isPlaying?: boolean;
  className?: string;
}> = ({ size = 18, isPlaying = false, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Pear-shaped Bandurria Body */}
      <path
        d="M14 14 C8 16, 5 22, 8 28 C11 33, 19 33, 22 28 C25 22, 22 16, 16 14 Z"
        fill="#D84315"
        stroke="#231F20"
        strokeWidth="2.2"
      />
      {/* Soundhole Rosette */}
      <circle cx="15" cy="23" r="3.6" fill="#231F20" stroke="#F57F17" strokeWidth="1.5" />
      {/* Fretboard & Headstock */}
      <path d="M16 15 L25 6 L28 9 L19 18 Z" fill="#8D6E63" stroke="#231F20" strokeWidth="1.8" />
      {/* Soundwave Ripples */}
      <path
        d="M27 16 Q31 20 27 24"
        stroke={isPlaying ? '#F57F17' : 'currentColor'}
        strokeWidth="2.2"
        strokeLinecap="round"
        className={isPlaying ? 'animate-ping' : ''}
      />
      <path
        d="M30 13 Q35 20 30 27"
        stroke={isPlaying ? '#C62828' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

// ============================================================================
// 6. <JeepneySignboardBanner /> — Retro Signboard & Baybayin Script Accent
// ============================================================================
export const JeepneySignboardBanner: React.FC<{
  label: string;
  baybayin?: string;
  variant?: 'crimson' | 'gold' | 'emerald' | 'azure';
  className?: string;
}> = ({ label, baybayin = 'ᜎᜒᜅ᜔ᜄᜓ', variant = 'crimson', className = '' }) => {
  const styles = {
    crimson: 'bg-[#C62828] text-[#FFFDFB] border-[#231F20]',
    gold: 'bg-[#F57F17] text-[#231F20] border-[#231F20]',
    emerald: 'bg-[#2E7D32] text-[#FFFDFB] border-[#231F20]',
    azure: 'bg-[#00838F] text-[#FFFDFB] border-[#231F20]',
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border-2 shadow-[2px_2px_0px_#231F20] text-[11px] font-extrabold uppercase tracking-wider select-none ${styles} ${className}`}
    >
      <span className="px-1.5 py-0.5 rounded bg-[#231F20]/20 font-mono text-[10px] tracking-widest">
        {baybayin}
      </span>
      <span>{label}</span>
    </div>
  );
};

// ============================================================================
// 7. <ScenicRiverTerracePath /> — Winding River & Stepped Rice Terrace Quest Map
// ============================================================================
export const ScenicRiverTerracePath: React.FC<{
  modules: Module[];
  completedModuleIds: string[];
  activeModuleId?: string;
  isModuleUnlocked: (mod: Module) => boolean;
  onSelectModule: (mod: Module, startQuizDirectly?: boolean) => void;
}> = ({
  modules,
  completedModuleIds,
  activeModuleId,
  isModuleUnlocked,
  onSelectModule,
}) => {
  // Determine current active lesson node (first unlocked & uncompleted module, or fallback to first)
  const firstActiveMod =
    modules.find((m) => isModuleUnlocked(m) && !completedModuleIds.includes(m.id)) ||
    modules.find((m) => m.id === activeModuleId) ||
    modules[0];

  return (
    <div className="linocut-card rounded-2xl overflow-hidden bg-[#FFFDFB]">
      <InabelWovenStrip variant="emerald" height={10} />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <JeepneySignboardBanner
                label="Banaue & Davao Stepped Terrace River Trail"
                baybayin="ᜌᜃᜈ᜔"
                variant="emerald"
              />
              <span className="text-xs font-bold text-[#6D4C41]">
                {completedModuleIds.filter((id) => modules.some((m) => m.id === id)).length} / {modules.length} Medallions Mastered
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#231F20] font-display mt-1.5">
              Winding Scenic River & Stepped Rice Terrace Quest Path
            </h3>
            <p className="text-xs text-[#6D4C41]">
              Follow the Tropical River (<span className="font-semibold text-[#00838F]">#00838F</span>) across the stepped emerald terraces (<span className="font-semibold text-[#2E7D32]">#2E7D32</span>). Tap any <em>Yakan</em> diamond medallion to enter its lesson!
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F5E9] text-[#2E7D32] border-2 border-[#231F20]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              Completed
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF3E0] text-[#D84315] border-2 border-[#231F20]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F57F17] animate-ping" />
              Active Jeepney Stop
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFEBE9] text-[#6D4C41] border-2 border-[#8D6E63]">
              <Lock className="w-3 h-3" />
              Locked Terrace
            </span>
          </div>
        </div>

        {/* Scenic Stepped Rice Terrace & Winding River Canvas */}
        <div className="relative rounded-xl border-2 border-[#231F20] overflow-hidden bg-gradient-to-b from-[#E8F5E9] via-[#FAF7F2] to-[#E0F7FA] p-4 sm:p-6">
          {/* Decorative Stepped Rice Terrace Backdrop & Winding River SVG */}
          <svg
            viewBox="0 0 1200 260"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
            aria-hidden="true"
          >
            {/* Stepped Banaue / Mindanao Rice Terrace Layers */}
            <path
              d="M0 55 H280 L310 85 H640 L670 115 H960 L990 145 H1200 V260 H0 Z"
              fill="#2E7D32"
              opacity="0.14"
            />
            <path
              d="M0 95 H220 L250 125 H560 L590 155 H890 L920 185 H1200 V260 H0 Z"
              fill="#2E7D32"
              opacity="0.2"
            />
            <path
              d="M0 145 H180 L210 175 H490 L520 205 H820 L850 230 H1200 V260 H0 Z"
              fill="#2E7D32"
              opacity="0.26"
            />
            {/* Hand-carved Woodcut Terrace Contour Lines */}
            <path
              d="M0 55 H280 L310 85 H640 L670 115 H960 L990 145 H1200"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="2.5"
              strokeDasharray="8 4"
            />
            <path
              d="M0 95 H220 L250 125 H560 L590 155 H890 L920 185 H1200"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="2.5"
            />
            {/* Winding Tropical River (#00838F) */}
            <path
              d="M -20 190 C 160 60, 320 230, 500 120 C 680 20, 840 220, 1020 110 C 1110 60, 1170 130, 1220 95"
              fill="none"
              stroke="#00838F"
              strokeWidth="28"
              strokeLinecap="round"
              opacity="0.25"
            />
            <path
              d="M -20 190 C 160 60, 320 230, 500 120 C 680 20, 840 220, 1020 110 C 1110 60, 1170 130, 1220 95"
              fill="none"
              stroke="#00838F"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M -20 190 C 160 60, 320 230, 500 120 C 680 20, 840 220, 1020 110 C 1110 60, 1170 130, 1220 95"
              fill="none"
              stroke="#FFFDFB"
              strokeWidth="3"
              strokeDasharray="10 10"
              className="animate-wave-flow"
            />
          </svg>

          {/* Horizontal Scrollable / Responsive Winding Terrace Nodes */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 items-center pt-4 pb-2">
            {modules.map((mod, idx) => {
              const isCompleted = completedModuleIds.includes(mod.id);
              const unlocked = isModuleUnlocked(mod);
              const isCurrentActive = firstActiveMod?.id === mod.id;
              // Alternate vertical stepping to mimic stepped rice terraces along the river
              const stepOffset = idx % 2 === 0 ? 'sm:-translate-y-2' : 'sm:translate-y-2';

              return (
                <div
                  key={mod.id}
                  className={`relative flex flex-col items-center text-center group ${stepOffset}`}
                >
                  {/* Hovering Miniature Jeepney & Philippine Eagle over Active Node */}
                  {isCurrentActive && (
                    <div className="mb-1 flex flex-col items-center">
                      <span className="px-2 py-0.5 rounded bg-[#C62828] text-[#FFFDFB] border border-[#231F20] text-[9px] font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_#231F20] mb-0.5">
                        Sakay Na!
                      </span>
                      <JeepneyMarkerSVG size={46} />
                    </div>
                  )}

                  {/* Textured Circular Medallion with Yakan Diamond Border */}
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onSelectModule(mod, false)}
                    title={`Module ${mod.moduleNumber}: ${mod.title}`}
                    className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                      isCompleted
                        ? 'bg-[#2E7D32] text-[#FFFDFB] border-[3px] border-[#231F20] shadow-[3px_3px_0px_#231F20] hover:-translate-y-1'
                        : isCurrentActive
                        ? 'bg-[#F57F17] text-[#231F20] border-[3px] border-[#231F20] shadow-[4px_4px_0px_#C62828] ring-4 ring-[#F57F17]/40 hover:scale-105'
                        : unlocked
                        ? 'bg-[#FFFDFB] text-[#231F20] border-[3px] border-[#231F20] shadow-[3px_3px_0px_#231F20] hover:-translate-y-1'
                        : 'bg-[#EFEBE9] text-[#8D6E63] border-[3px] border-[#8D6E63] opacity-75 cursor-not-allowed'
                    }`}
                  >
                    {/* Yakan Woven Diamond Rim SVG Overlay */}
                    <svg
                      viewBox="0 0 64 64"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="27"
                        fill="none"
                        stroke={isCompleted ? '#FFFDFB' : isCurrentActive ? '#C62828' : '#8D6E63'}
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                      {/* 4 Cardinal Yakan Diamonds */}
                      <polygon points="32,2 35,5 32,8 29,5" fill="#F57F17" />
                      <polygon points="32,56 35,59 32,62 29,59" fill="#F57F17" />
                      <polygon points="2,32 5,35 8,32 5,29" fill="#F57F17" />
                      <polygon points="56,32 59,35 62,32 59,29" fill="#F57F17" />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center leading-none">
                      <span className="text-[9px] font-mono font-extrabold uppercase opacity-85">
                        M0{mod.moduleNumber}
                      </span>
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3] mt-0.5" />
                      ) : !unlocked ? (
                        <Lock className="w-4 h-4 mt-0.5" />
                      ) : (
                        <Play className="w-4 h-4 fill-current mt-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Module Title Pill Below Medallion */}
                  <div className="mt-2 px-2 py-1 rounded-md bg-[#FFFDFB]/95 border border-[#231F20] shadow-[2px_2px_0px_#231F20] max-w-[135px]">
                    <div className="text-[10px] font-extrabold text-[#231F20] line-clamp-1">
                      {mod.title}
                    </div>
                    <div className="text-[9px] font-semibold text-[#6D4C41]">
                      Q{mod.quarter} · {isCompleted ? 'Bridge Built' : unlocked ? 'Open Quest' : 'Locked'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
