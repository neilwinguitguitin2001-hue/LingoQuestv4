import React, { useId } from 'react';

export interface InabelStripProps {
  /** Color theme for the woven Neo-Filipiniana Inabel geometric pattern */
  variant?: 'royal' | 'amber' | 'emerald' | 'crimson' | 'indigo' | 'dark';
  /** Height of the geometric SVG frieze in pixels (default 16) */
  height?: number;
  /** Optional className for outer wrapper */
  className?: string;
  /** Optional section kicker / card header title rendered inside a carved linocut bar */
  label?: string;
  /** Optional right-aligned metadata text */
  rightText?: string;
  /** Optional custom SVG pattern ID */
  patternId?: string;
}

const INABEL_PALETTES: Record<
  NonNullable<InabelStripProps['variant']>,
  { bg: string; primary: string; secondary: string; accent: string; weave: string }
> = {
  royal: {
    bg: '#0A192F',
    primary: '#38BDF8',
    secondary: '#22C55E',
    accent: '#DBEAFE',
    weave: '#1E3A8A',
  },
  amber: {
    bg: '#0B2A4A',
    primary: '#38BDF8',
    secondary: '#22C55E',
    accent: '#E0F2FE',
    weave: '#164E75',
  },
  emerald: {
    bg: '#073B4C',
    primary: '#38BDF8',
    secondary: '#34D399',
    accent: '#ECFDF5',
    weave: '#0F766E',
  },
  crimson: {
    bg: '#123B63',
    primary: '#60A5FA',
    secondary: '#22C55E',
    accent: '#EFF6FF',
    weave: '#1D4ED8',
  },
  indigo: {
    bg: '#172554',
    primary: '#60A5FA',
    secondary: '#34D399',
    accent: '#DBEAFE',
    weave: '#1E40AF',
  },
  dark: {
    bg: '#07192F',
    primary: '#38BDF8',
    secondary: '#22C55E',
    accent: '#F0FDF4',
    weave: '#164E63',
  },
};

/**
 * Reusable `InabelStrip` component rendering a traditional Filipino Inabel / Dagmay
 * geometric SVG pattern (stepped binakol diamonds, kusikos chevrons, and warp threads)
 * with a 2D linocut ink border to reinforce the Neo-Filipiniana aesthetic across
 * all lesson and module card headers.
 */
export const InabelStrip: React.FC<InabelStripProps> = ({
  variant = 'royal',
  height = 16,
  className = '',
  label,
  rightText,
  patternId: customPatternId,
}) => {
  const reactId = useId();
  const safeId = customPatternId || `inabel-svg-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const colors = INABEL_PALETTES[variant] || INABEL_PALETTES.royal;

  return (
    <div
      className={`w-full select-none overflow-hidden border-b-2 border-[#123B63] shrink-0 ${className}`}
      aria-hidden={!label}
    >
      {/* Geometric Inabel / Dagmay Repeating SVG Pattern Strip */}
      <svg
        className="w-full block"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={safeId}
            width="48"
            height={height}
            patternUnits="userSpaceOnUse"
            viewBox="0 0 48 16"
            preserveAspectRatio="none"
          >
            {/* Base woven loom background */}
            <rect width="48" height="16" fill={colors.bg} />

            {/* Subtle horizontal loom weft threads */}
            <rect x="0" y="0" width="48" height="2" fill="#231F20" opacity="0.6" />
            <rect x="0" y="7.5" width="48" height="1" fill={colors.weave} opacity="0.55" />
            <rect x="0" y="14" width="48" height="2" fill="#231F20" opacity="0.6" />

            {/* Left & Right Geometric Kusikos Chevrons */}
            <polygon
              points="0,8 8,2 12,2 4,8 12,14 8,14"
              fill={colors.primary}
            />
            <polygon
              points="48,8 40,2 36,2 44,8 36,14 40,14"
              fill={colors.primary}
            />

            {/* Stepped Outer Binakol Diamond */}
            <polygon
              points="24,1 33,8 24,15 15,8"
              fill={colors.secondary}
            />
            {/* Stepped Inner Binakol Diamond */}
            <polygon
              points="24,4 29,8 24,12 19,8"
              fill={colors.bg}
            />
            {/* Center Loom Eye */}
            <rect
              x="22.5"
              y="6.5"
              width="3"
              height="3"
              fill={colors.accent}
            />

            {/* Flanking Mini Geometric Diamonds */}
            <polygon points="12,6 15,8 12,10 9,8" fill={colors.accent} />
            <polygon points="36,6 39,8 36,10 33,8" fill={colors.accent} />

            {/* Vertical Linocut Woodblock Border Ticks */}
            <rect x="0" y="3" width="1.5" height="10" fill={colors.secondary} opacity="0.8" />
            <rect x="46.5" y="3" width="1.5" height="10" fill={colors.secondary} opacity="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${safeId})`} />
      </svg>

      {/* Optional Neo-Filipiniana Linocut Kicker Bar */}
      {label && (
        <div className="bg-[#07192F] text-[#E0F2FE] px-4 py-1.5 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.15em] border-t border-white/15">
          <span className="flex items-center gap-2 truncate">
            <span
              className="inline-block w-2 h-2 rotate-45 shrink-0"
              style={{ backgroundColor: colors.secondary }}
            />
            <span className="truncate">{label}</span>
          </span>
          {rightText && (
            <span
              className="font-mono text-[10px] font-bold shrink-0"
              style={{ color: colors.primary }}
            >
              {rightText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default InabelStrip;
