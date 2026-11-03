import React from 'react';

export type LingoQuestLogoVariant = 'primary' | 'reversed' | 'auto';

export interface LingoQuestEmblemProps {
  size?: number;
  className?: string;
  animated?: boolean;
  variant?: 'primary' | 'reversed';
  withSquircle?: boolean;
  starColor?: string;
}

export interface LingoQuestLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  showSubtitle?: boolean;
  textColor?: 'dark' | 'light';
  variant?: LingoQuestLogoVariant;
  className?: string;
  animated?: boolean;
  align?: 'left' | 'center';
}

/**
 * Official LingoQuest "Q" Emblem:
 * Precision speech-bubble/magnifying-lens emblem with circular outer ring,
 * 45-degree pointer tail, central 4-point sparkle star, and two sparkle dots.
 * Strictly adheres to the updated official brand attachments:
 * - "App icon@1x.png"
 * - "Reversed on navy@2x (1).png"
 * - "Primary logo@2x (1).png"
 */
export const LingoQuestEmblem: React.FC<LingoQuestEmblemProps> = ({
  size = 48,
  className = '',
  animated = false,
  variant = 'reversed',
  withSquircle = false,
  starColor: customStarColor,
}) => {
  const isPrimary = variant === 'primary';

  // Palette strictly matched from the official brand assets:
  // - App icon: squircle = #0F4299, ring = #FFFFFF, star = #5AA8F8, dots = #FFFFFF
  // - Reversed on navy: ring = #FFFFFF, star = #FFFFFF (or sky blue), dots = #FFFFFF, transparent hollow
  // - Primary logo: ring = #0F4299, lens = #E5F0FE, star = #1B6CEB, dots = #E5F0FE
  const ringColor = isPrimary ? '#0F4299' : '#FFFFFF';
  const starColor =
    customStarColor ||
    (isPrimary ? '#1B6CEB' : withSquircle ? '#5AA8F8' : '#FFFFFF');
  const dotColor = isPrimary ? '#E5F0FE' : '#FFFFFF';

  if (withSquircle) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${animated ? 'animate-lq-emblem-float' : ''} ${className}`}
        aria-label="LingoQuest App Icon"
      >
        {/* Squircle App Icon Background */}
        <rect width="512" height="512" rx="118" fill="#0F4299" />

        {/* Outer Q Ring with symmetric 45-degree speech pointer and hollow inner hole */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 372.5 298.4 L 388 388 L 298.4 372.5 A 124 124 0 1 1 372.5 298.4 Z M 256 174 A 82 82 0 1 0 256 338 A 82 82 0 1 0 256 174 Z"
          fill="#FFFFFF"
        />

        {/* Central 4-Point Astroid Sparkle Star in Brand Sky Blue */}
        <path
          d="M 256 194 Q 263 249 318 256 Q 263 263 256 318 Q 249 263 194 256 Q 249 249 256 194 Z"
          fill="#5AA8F8"
          className={animated ? 'animate-lq-star-twinkle' : 'transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110'}
          style={{ transformOrigin: '256px 256px' }}
        />

        {/* Two Sparkle Dots */}
        <circle
          cx="298"
          cy="202"
          r="9.5"
          fill="#FFFFFF"
          className={animated ? 'animate-lq-dot-pulse-1' : ''}
        />
        <circle
          cx="202"
          cy="300"
          r="6.8"
          fill="#FFFFFF"
          className={animated ? 'animate-lq-dot-pulse-2' : ''}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="130 130 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${animated ? 'animate-lq-emblem-float' : ''} ${className}`}
      aria-label="LingoQuest Q Emblem"
    >
      {/* For Primary variant on light background: soft ice-blue circular lens */}
      {isPrimary && <circle cx="256" cy="256" r="82" fill="#E5F0FE" />}

      {/* Outer Q Ring with integrated speech pointer and true hollow center */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 372.5 298.4 L 388 388 L 298.4 372.5 A 124 124 0 1 1 372.5 298.4 Z M 256 174 A 82 82 0 1 0 256 338 A 82 82 0 1 0 256 174 Z"
        fill={ringColor}
      />

      {/* Central 4-Point Astroid Sparkle Star */}
      <path
        d="M 256 194 Q 263 249 318 256 Q 263 263 256 318 Q 249 263 194 256 Q 249 249 256 194 Z"
        fill={starColor}
        className={animated ? 'animate-lq-star-twinkle' : 'transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110'}
        style={{ transformOrigin: '256px 256px' }}
      />

      {/* Two Sparkle Dots */}
      <circle
        cx="298"
        cy="202"
        r="9.5"
        fill={dotColor}
        className={animated ? 'animate-lq-dot-pulse-1' : ''}
      />
      <circle
        cx="202"
        cy="300"
        r="6.8"
        fill={dotColor}
        className={animated ? 'animate-lq-dot-pulse-2' : ''}
      />
    </svg>
  );
};

/**
 * Dedicated App Icon component matching App icon@1x.png
 */
export const LingoQuestAppIcon: React.FC<{ size?: number; className?: string; animated?: boolean }> = ({
  size = 64,
  className = '',
  animated = false,
}) => {
  return <LingoQuestEmblem size={size} withSquircle={true} animated={animated} className={className} />;
};

/**
 * Official LingoQuest Brand Logo Lockup:
 * Combines "Lingo" + "Q" emblem + "uest", the official tagline "LEARN ENGLISH · LEVEL UP",
 * and optional sub-tagline "A Gamified E-Learning System · DepEd Davao Oriental".
 * Strictly follows the official "Reversed on navy@2x (1).png" and "Primary logo@2x (1).png" specifications.
 */
export const LingoQuestLogo: React.FC<LingoQuestLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  showSubtitle = false,
  textColor,
  variant,
  className = '',
  animated = false,
  align = 'left',
}) => {
  // Determine variant (reversed for dark backgrounds, primary for light)
  const isLight =
    variant === 'reversed' ||
    (variant === undefined && textColor !== 'dark') ||
    textColor === 'light';

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 34
      : size === 'md'
      ? 46
      : size === 'lg'
      ? 64
      : 84;

  const emblemSize = Math.round(pixelSize * 0.95);

  if (!showText) {
    return (
      <LingoQuestEmblem
        size={pixelSize}
        variant={isLight ? 'reversed' : 'primary'}
        animated={animated}
        className={className}
      />
    );
  }

  // Exact brand colors from updated attachments:
  // Reversed on navy: Lingo = #FFFFFF, uest = #5AA8F8, tagline = #FFFFFF, subtitle = #FFFFFF
  // Primary: Lingo = #0F4299, uest = #297CF6, tagline = #0F4299, subtitle = #2E4D7E
  const lingoColor = isLight ? 'text-white' : 'text-[#0F4299]';
  const uestColor = isLight ? 'text-[#5AA8F8]' : 'text-[#297CF6]';
  const taglineColor = isLight ? 'text-white' : 'text-[#0F4299]';
  const subtitleColor = isLight ? 'text-white/90' : 'text-[#2E4D7E]';

  const textSizeClass =
    pixelSize <= 34
      ? 'text-lg sm:text-xl'
      : pixelSize <= 46
      ? 'text-2xl sm:text-3xl'
      : pixelSize <= 64
      ? 'text-3xl sm:text-4xl'
      : 'text-4xl sm:text-5xl';

  const taglineSizeClass =
    pixelSize <= 34
      ? 'text-[7.5px] sm:text-[8px] tracking-[0.24em]'
      : pixelSize <= 46
      ? 'text-[9px] sm:text-[10px] tracking-[0.26em]'
      : pixelSize <= 64
      ? 'text-[11px] sm:text-[12px] tracking-[0.28em]'
      : 'text-[14px] sm:text-[15px] tracking-[0.3em]';

  const subtitleSizeClass =
    pixelSize <= 34
      ? 'text-[7px]'
      : pixelSize <= 46
      ? 'text-[8.5px] sm:text-[9.5px]'
      : pixelSize <= 64
      ? 'text-[10.5px] sm:text-[11.5px]'
      : 'text-[13px] sm:text-[14px]';

  return (
    <div
      className={`inline-flex flex-col ${
        align === 'center' ? 'items-center text-center' : 'items-start text-left'
      } select-none group ${className}`}
      role="banner"
      aria-label="LingoQuest: Learn English · Level Up"
    >
      {/* Wordmark Row: Lingo + [Q Emblem] + uest */}
      <div className="flex items-center leading-none">
        <span
          className={`font-black tracking-[-0.015em] ${textSizeClass} ${lingoColor}`}
          style={{ fontFamily: "'Nunito', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
        >
          Lingo
        </span>

        <LingoQuestEmblem
          size={emblemSize}
          variant={isLight ? 'reversed' : 'primary'}
          animated={animated}
          className="-mx-0.5 sm:-mx-1 relative top-[1px]"
        />

        <span
          className={`font-black tracking-[-0.015em] ${textSizeClass} ${uestColor}`}
          style={{ fontFamily: "'Nunito', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
        >
          uest
        </span>
      </div>

      {/* Official Tagline: LEARN ENGLISH · LEVEL UP */}
      {showTagline && (
        <div
          className={`font-extrabold uppercase mt-1 ${taglineSizeClass} ${taglineColor}`}
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          LEARN ENGLISH · LEVEL UP
        </div>
      )}

      {/* Official Subtitle: A Gamified E-Learning System · DepEd Davao Oriental */}
      {showSubtitle && (
        <div
          className={`font-medium tracking-[0.02em] mt-0.5 ${subtitleSizeClass} ${subtitleColor}`}
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          A Gamified E-Learning System · DepEd Davao Oriental
        </div>
      )}
    </div>
  );
};

export interface LogoTransitionOverlayProps {
  active: boolean;
  exiting?: boolean;
  title?: string;
  subtitle?: string;
  kind?: 'signin' | 'logout' | 'navigate';
}

/**
 * Full-screen animated LingoQuest Logo transition screen shown when signing in,
 * logging out, or navigating between pages.
 */
export const LogoTransitionOverlay: React.FC<LogoTransitionOverlayProps> = ({
  active,
  exiting = false,
  title = 'Loading Quest...',
  subtitle = 'DepEd Davao Oriental · English Archipelago',
  kind = 'navigate',
}) => {
  if (!active) return null;

  const badgeTone =
    kind === 'signin'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
      : kind === 'logout'
      ? 'bg-rose-500/20 text-rose-200 border-rose-400/35'
      : 'bg-sky-500/20 text-sky-300 border-sky-400/35';

  const badgeDot =
    kind === 'signin'
      ? 'bg-emerald-400'
      : kind === 'logout'
      ? 'bg-rose-400'
      : 'bg-sky-400';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#071527]/95 backdrop-blur-md transition-all duration-300 select-none ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient Radial Glow & Archipelago Wave Rings */}
      <div className="relative flex flex-col items-center justify-center px-6">
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer pulsing aura */}
          <div
            className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-blue-600/35 via-sky-400/25 to-indigo-500/30 blur-2xl"
            style={{ animation: 'logoGlowPulse 2s ease-in-out infinite' }}
          />

          {/* Spinning dashed compass/archipelago orbit ring */}
          <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-sky-400/35 animate-lq-orbit-spin" />

          {/* Secondary subtle counter-ring */}
          <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-white/10" />

          {/* Central Animated LingoQuest App Icon Squircle */}
          <div className="relative z-10 p-3 rounded-[30px] bg-[#0B1E36]/90 border border-sky-400/30 shadow-2xl shadow-sky-950/80">
            <LingoQuestEmblem size={76} withSquircle={true} animated={true} />
          </div>
        </div>

        {/* Animated Full Brand Lockup */}
        <LingoQuestLogo
          size="lg"
          variant="reversed"
          align="center"
          animated={true}
          showTagline={true}
          showSubtitle={false}
          className="mb-5"
        />

        {/* Transition Status Pill */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold tracking-wide shadow-lg ${badgeTone}`}
        >
          <span className={`w-2 h-2 rounded-full animate-ping ${badgeDot}`} />
          <span>{title}</span>
        </div>

        {subtitle && (
          <p className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-300/85 tracking-wide text-center max-w-xs">
            {subtitle}
          </p>
        )}

        {/* Shimmering Progress Bar */}
        <div className="mt-5 w-48 sm:w-56 h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-lq-progress-sweep" />
        </div>
      </div>
    </div>
  );
};

export default LingoQuestLogo;

