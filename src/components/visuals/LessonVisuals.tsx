import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Compass,
  Eye,
  Flame,
  HelpCircle,
  Lightbulb,
  MapPin,
  Pause,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  WifiOff,
  Zap,
} from 'lucide-react';
import type {
  CheatsheetVisualNode,
  DavaoHotspotItem,
  DavaoSceneType,
  DiagramPairNode,
  ExplainerSlide,
  GuidedStepperStep,
  MiniGameSortItem,
  PitfallVisualPair,
  RuleVisualSpec,
  SelfCheckRapidQuestion,
  VisualActivityKey,
  VocabFlipCardSpec,
} from '../../data/moduleVisualConfigs.ts';
import { soundFX } from '../../utils/soundEffects.ts';
import { findPronunciationEntry } from '../../data/pronunciationDictionary.ts';
import { loadUserVoicePreferences } from '../../data/voiceConfig.ts';
import {
  speakQuickPassage,
  stopAllVoicePlayback,
} from '../../utils/voiceEngineClient.ts';
import { InabelStrip } from '../InabelStrip.tsx';

// ============================================================================
// 0. Error Boundary for Resilient Visual Rendering
// ============================================================================
interface ErrorBoundaryProps {
  fallbackTitle?: string;
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

export class VisualErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
          <span>
            {this.props.fallbackTitle || 'Interactive visual loaded in simplified text mode.'}
          </span>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
          >
            Retry Visual
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 1. <XPToast /> — Animated Floating XP Gain & Badge Popup
// ============================================================================
export interface XPToastPayload {
  id: string;
  xp: number;
  label: string;
  badgeUnlocked?: string;
}

export const XPToast: React.FC<{
  toast: XPToastPayload | null;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 max-w-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black font-mono text-xs flex items-center justify-center shrink-0 shadow">
            +{toast.xp} XP
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-300 truncate">{toast.label}</div>
            {toast.badgeUnlocked ? (
              <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Badge Unlocked: {toast.badgeUnlocked}!</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-300">Visual Mastery Progress Saved</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 2. <MascotReaction /> — Friendly Island Mascot ("Kapitan Pawikan")
// ============================================================================
export const MascotReaction: React.FC<{
  mood: 'idle' | 'cheer' | 'hint' | 'encourage';
  message: string;
  subtext?: string;
  compact?: boolean;
}> = ({ mood, message, subtext, compact = false }) => {
  const shouldReduceMotion = useReducedMotion();

  const moodConfig = {
    idle: {
      bg: 'bg-sky-50 border-sky-200 text-sky-950',
      badge: 'Kapitan Pawikan · Island Guide',
      accent: 'text-sky-700',
      shellColor: '#0284C7',
    },
    cheer: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      badge: 'Kapitan Pawikan · Bibo Kaayo!',
      accent: 'text-emerald-700',
      shellColor: '#059669',
    },
    hint: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      badge: 'Kapitan Pawikan · Bridge Hint',
      accent: 'text-amber-800',
      shellColor: '#D97706',
    },
    encourage: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
      badge: 'Kapitan Pawikan · Keep Sailing!',
      accent: 'text-indigo-700',
      shellColor: '#4F46E5',
    },
  }[mood];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`rounded-xl border ${moodConfig.bg} ${compact ? 'p-3' : 'p-3.5'} flex items-center gap-3`}
    >
      {/* Original SVG Island Mascot: Kapitan Pawikan (Davao Oriental Sea Turtle Navigator) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : mood === 'cheer'
            ? { y: [0, -5, 0], rotate: [0, -6, 6, 0] }
            : mood === 'hint'
            ? { scale: [1, 1.06, 1] }
            : { y: [0, -2, 0] }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" className="w-10 h-10">
          {/* Explorer Hat */}
          <path d="M18 20 C20 11, 44 11, 46 20 Z" fill="#F59E0B" />
          <rect x="14" y="19" width="36" height="4" rx="2" fill="#D97706" />
          {/* Turtle Head */}
          <circle cx="32" cy="34" r="14" fill="#34D399" />
          {/* Shell Rim Behind */}
          <path
            d="M16 44 C16 54, 48 54, 48 44"
            fill={moodConfig.shellColor}
            opacity="0.25"
          />
          {/* Eyes */}
          <circle cx="26" cy="32" r="2.6" fill="#0F172A" />
          <circle cx="38" cy="32" r="2.6" fill="#0F172A" />
          <circle cx="26.8" cy="31.2" r="0.9" fill="#FFFFFF" />
          <circle cx="38.8" cy="31.2" r="0.9" fill="#FFFFFF" />
          {/* Rosy Cheeks */}
          <ellipse cx="22" cy="36" rx="2.5" ry="1.4" fill="#FB7185" opacity="0.6" />
          <ellipse cx="42" cy="36" rx="2.5" ry="1.4" fill="#FB7185" opacity="0.6" />
          {/* Smile / Expression */}
          {mood === 'cheer' ? (
            <path d="M26 38 Q32 45 38 38 Z" fill="#0F172A" />
          ) : mood === 'hint' ? (
            <circle cx="32" cy="40" r="2.5" fill="#0F172A" />
          ) : (
            <path
              d="M27 38 Q32 43 37 38"
              stroke="#0F172A"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {/* Compass Badge on Hat */}
          <circle cx="32" cy="16" r="3" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        </svg>
      </motion.div>

      <div className="min-w-0 flex-1">
        <div className={`text-[11px] font-bold ${moodConfig.accent}`}>
          {moodConfig.badge}
        </div>
        <p className="text-xs sm:text-sm font-medium leading-snug mt-0.5">{message}</p>
        {subtext && <p className="text-[11px] opacity-80 mt-0.5">{subtext}</p>}
      </div>
    </motion.div>
  );
};

// ============================================================================
// 3. <ModuleExplainer /> — 60-Second Animated Lesson Explainer
// ============================================================================
export const ModuleExplainer: React.FC<{
  title: string;
  subtitle: string;
  posterTitle: string;
  slides: ExplainerSlide[];
  xpReward: number;
  isCompleted: boolean;
  dataSaver: boolean;
  onComplete: () => void;
}> = ({
  title,
  subtitle,
  posterTitle,
  slides,
  xpReward,
  isCompleted,
  dataSaver,
  onComplete,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  const currentSlide = slides[currentSlideIdx] || slides[0];

  // Speak narration with upgraded Neural TTS / Philippine English fallback when voice is enabled
  useEffect(() => {
    if (!isPlaying || !voiceEnabled) {
      return;
    }
    const prefs = loadUserVoicePreferences();
    void speakQuickPassage({
      segmentId: `explainer-${currentSlide.id}`,
      spokenText: currentSlide.narrationText,
      displayText: currentSlide.caption,
      personaId: prefs.personaId,
      prosodyRole: 'intro',
      speed: prefs.speed,
      dataSaver,
    });
    return () => {
      stopAllVoicePlayback();
    };
  }, [isPlaying, currentSlideIdx, voiceEnabled, currentSlide, dataSaver]);

  // Auto-advance slides while playing
  useEffect(() => {
    if (!isPlaying || dataSaver) return;

    const timer = window.setTimeout(() => {
      if (currentSlideIdx + 1 < slides.length) {
        setCurrentSlideIdx((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        onComplete();
      }
    }, 5500); // 5.5s per visual scene so students can comfortably watch or scrub

    return () => window.clearTimeout(timer);
  }, [isPlaying, currentSlideIdx, slides.length, dataSaver, onComplete]);

  const handleTogglePlay = () => {
    soundFX.playClick();
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    soundFX.playClick();
    setCurrentSlideIdx(0);
    setIsPlaying(true);
  };

  const handleSkipToFinish = () => {
    soundFX.playClick();
    setIsPlaying(false);
    setCurrentSlideIdx(slides.length - 1);
    onComplete();
  };

  return (
    <div className="rounded-xl border-2 border-[#231F20] bg-slate-900 text-white overflow-hidden linocut-card">
      <InabelStrip
        variant="amber"
        label="60-Second Animated Lesson Explainer"
        rightText={isCompleted ? `Watched (+${xpReward} XP)` : `+${xpReward} XP`}
      />
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">{title}</h3>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Watched (+{xpReward} XP)</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono font-bold text-amber-300">
              +{xpReward} XP
            </span>
          )}
        </div>
      </div>

      {/* Animated Stage or Data-Saver Static Poster */}
      {dataSaver ? (
        <div className="p-5 bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <WifiOff className="w-4 h-4" />
              <span>Data Saver Active — Static Poster Storyboard ({slides.length} Key Frames)</span>
            </span>
            {!isCompleted && (
              <button
                type="button"
                onClick={onComplete}
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
              >
                Mark Storyboard Read (+{xpReward} XP)
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slides.map((sl) => (
              <div
                key={sl.id}
                className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5"
              >
                <div className="text-xs font-bold text-sky-300">{sl.headline}</div>
                <p className="text-xs text-slate-200 leading-relaxed">{sl.caption}</p>
                {sl.highlightSignal && (
                  <div className="text-[11px] font-mono text-amber-300 pt-1">
                    {sl.highlightSignal}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Visual Canvas */}
          <div className="relative rounded-xl bg-gradient-to-br from-slate-950 via-[#0B213F] to-slate-900 border border-slate-800 p-4 sm:p-6 min-h-[210px] flex flex-col justify-between overflow-hidden">
            {/* Scene Counter & Hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 z-10">
              <span className="text-xs font-mono font-bold text-sky-300">
                Scene {currentSlideIdx + 1} of {slides.length} · {currentSlide.headline}
              </span>
              {currentSlide.filipinoBisayaHint && (
                <span className="text-[11px] text-amber-300/90 font-medium">
                  {currentSlide.filipinoBisayaHint}
                </span>
              )}
            </div>

            {/* Animated Interactive Pair / Bridge Graphic */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="my-4 z-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                  {/* Left Pair Card */}
                  {currentSlide.pairLeft && (
                    <div className="sm:col-span-5 p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/40 text-center space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
                        {currentSlide.pairLeft.tag}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30">
                          {currentSlide.pairLeft.a}
                        </span>
                        <span className="text-amber-400 font-mono font-black">:</span>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30">
                          {currentSlide.pairLeft.b}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Center Bridge Connector */}
                  <div className="sm:col-span-1 flex flex-col items-center justify-center">
                    <motion.div
                      animate={
                        shouldReduceMotion || !isPlaying
                          ? {}
                          : { scale: [1, 1.18, 1] }
                      }
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-sm flex items-center justify-center shadow"
                    >
                      ::
                    </motion.div>
                    <span className="text-[10px] font-mono text-amber-300 mt-0.5">AS</span>
                  </div>

                  {/* Right Pair Card */}
                  {currentSlide.pairRight && (
                    <div className="sm:col-span-5 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                        {currentSlide.pairRight.tag}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                          {currentSlide.pairRight.c}
                        </span>
                        <span className="text-amber-400 font-mono font-black">:</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                          {currentSlide.pairRight.d}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {currentSlide.highlightSignal && (
                  <div className="mt-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-sky-200 border border-white/10">
                      {currentSlide.highlightSignal}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Synchronized Caption Box */}
            <div
              className="p-3 rounded-lg bg-black/65 border border-white/10 text-xs sm:text-sm text-slate-100 leading-relaxed z-10"
              aria-live="polite"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 mr-2">
                [CC]
              </span>
              {currentSlide.caption}
            </div>
          </div>

          {/* Progress Dots & Playback Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pause animated lesson' : 'Play animated lesson'}
                className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : currentSlideIdx > 0 ? 'Resume' : 'Watch 60s Lesson'}</span>
              </button>

              <button
                type="button"
                onClick={handleReplay}
                aria-label="Replay animated explainer from start"
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setVoiceEnabled((v) => !v);
                }}
                aria-label={voiceEnabled ? 'Mute voice narration' : 'Enable voice narration'}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border ${
                  voiceEnabled
                    ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>
            </div>

            {/* Scene Scrubber Buttons */}
            <div className="flex items-center gap-1.5">
              {slides.map((sl, idx) => (
                <button
                  key={sl.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setCurrentSlideIdx(idx);
                    if (idx === slides.length - 1) {
                      onComplete();
                    }
                  }}
                  aria-label={`Jump to scene ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIdx
                      ? 'w-7 bg-amber-400'
                      : idx < currentSlideIdx
                      ? 'w-2.5 bg-sky-400'
                      : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTranscript((t) => !t)}
                className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
              >
                {showTranscript ? 'Hide Transcript' : 'Transcript'}
              </button>
              <button
                type="button"
                onClick={handleSkipToFinish}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Skip</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showTranscript && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-sky-300">Full Lesson Narration Transcript:</div>
              {slides.map((s, idx) => (
                <p key={s.id}>
                  <strong className="text-white">0{idx + 1}.</strong> {s.narrationText}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. <RuleVisualIllustration /> — Animated Rule Card Micro-Visualizer
// ============================================================================
export const RuleVisualIllustration: React.FC<{
  spec: RuleVisualSpec;
  dataSaver: boolean;
}> = ({ spec, dataSaver }) => {
  const [flipped, setFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200/90 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold text-sky-700">{spec.badgeLabel}</span>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setFlipped((f) => !f);
            }}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
          >
            {flipped ? 'Show Pair 1 (A : B)' : 'Animate Pair 2 (C : D)'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setShowHint((h) => !h);
          }}
          className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'Hide Filipino/Bisaya Hint' : 'Filipino / Bisaya Hint'}</span>
        </button>
      </div>

      {/* Interactive Animated Pair Strip */}
      <div
        onClick={() => {
          soundFX.playClick();
          setFlipped((f) => !f);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        aria-label={spec.alt}
        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:border-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
          <motion.span
            key={flipped ? spec.pairC : spec.pairA}
            initial={dataSaver ? false : { scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.16 }}
            className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-900 border border-sky-200"
          >
            {flipped ? spec.pairC : spec.pairA}
          </motion.span>
          <span className="text-slate-400 font-mono">
            {spec.animationType === 'antonyms'
              ? '↔'
              : spec.animationType === 'synonyms'
              ? '='
              : '→'}
          </span>
          <motion.span
            key={flipped ? spec.pairD : spec.pairB}
            initial={dataSaver ? false : { scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.16 }}
            className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200"
          >
            {flipped ? spec.pairD : spec.pairB}
          </motion.span>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          {spec.pairA} : {spec.pairB} :: {spec.pairC} : {spec.pairD}
        </span>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-0.5">
          <div>
            <strong>Filipino:</strong> {spec.filipinoHint}
          </div>
          <div>
            <strong>Bisaya:</strong> {spec.bisayaHint}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. <InteractiveDiagram /> — Interactive A : B :: C : D Bridge Connector
// ============================================================================
export const InteractiveDiagram: React.FC<{
  title: string;
  subtitle: string;
  nodes: DiagramPairNode[];
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({ title, subtitle, nodes, xpReward, isCompleted, onComplete }) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [wrongChoice, setWrongChoice] = useState<string>('');

  const currentNode = nodes[activeIdx] || nodes[0];
  const isCurrentSolved = Boolean(solvedMap[currentNode.id]);
  const allSolved = nodes.every((n) => Boolean(solvedMap[n.id]));

  const choices = React.useMemo(() => {
    const raw = [currentNode.correctCompletion, ...currentNode.distractors];
    return Array.from(new Set(raw));
  }, [currentNode]);

  const handleSelectOption = (opt: string) => {
    setSelectedChoice(opt);
    if (opt === currentNode.correctCompletion) {
      soundFX.playCorrect();
      setWrongChoice('');
      const nextMap = { ...solvedMap, [currentNode.id]: true };
      setSolvedMap(nextMap);
      if (nodes.every((n) => Boolean(nextMap[n.id]))) {
        onComplete();
      }
    } else {
      soundFX.playIncorrect();
      setWrongChoice(opt);
    }
  };

  return (
    <section className="bg-white border-2 border-[#231F20] rounded-xl overflow-hidden linocut-card">
      <InabelStrip
        variant="royal"
        label="Interactive Concept Bridge Diagram"
        rightText={`${Object.keys(solvedMap).length}/${nodes.length} Linked`}
      />
      <div className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-600" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="text-xs font-mono font-bold">
          {isCompleted || allSolved ? (
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bridge Connected (+{xpReward} XP)</span>
            </span>
          ) : (
            <span className="text-sky-700">
              {Object.keys(solvedMap).length}/{nodes.length} Linked · +{xpReward} XP
            </span>
          )}
        </div>
      </div>

      {/* Node Selector Tabs */}
      <div className="flex items-center gap-1.5">
        {nodes.map((n, idx) => {
          const solved = Boolean(solvedMap[n.id]);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveIdx(idx);
                setSelectedChoice('');
                setWrongChoice('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                idx === activeIdx
                  ? 'bg-slate-900 text-white'
                  : solved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Bridge #{idx + 1}</span>
              {solved && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      {/* Interactive Two-Pillar Bridge SVG + Controls */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
        <div className="text-center text-xs font-mono text-amber-300">
          Relationship Type: {currentNode.relationshipLabel}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
          {/* Pillar 1 (A : B) */}
          <div className="sm:col-span-5 p-3.5 rounded-xl bg-slate-800 border border-sky-400/50 text-center">
            <div className="text-[10px] font-mono text-sky-300 uppercase">Island Pillar 1 (A : B)</div>
            <div className="text-sm sm:text-base font-bold text-white mt-1">
              {currentNode.leftPair}
            </div>
          </div>

          {/* Animated Glowing Bridge Link */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-sm transition-all ${
                isCurrentSolved
                  ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/40 scale-110'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              ::
            </div>
          </div>

          {/* Pillar 2 (C : D) */}
          <div
            className={`sm:col-span-5 p-3.5 rounded-xl border text-center transition-all ${
              isCurrentSolved
                ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 border-amber-400/50'
            }`}
          >
            <div className="text-[10px] font-mono text-amber-300 uppercase">Island Pillar 2 (C : D)</div>
            <div className="text-sm sm:text-base font-bold text-white mt-1">
              {isCurrentSolved
                ? currentNode.rightPrompt.replace('________', currentNode.correctCompletion)
                : currentNode.rightPrompt}
            </div>
          </div>
        </div>

        {/* Option Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {choices.map((opt) => {
            const isCorrect = opt === currentNode.correctCompletion && isCurrentSolved;
            const isWrong = wrongChoice === opt;
            return (
              <motion.button
                key={opt}
                type="button"
                animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.25 }}
                onClick={() => handleSelectOption(opt)}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isCorrect
                    ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                    : isWrong
                    ? 'bg-rose-950 border-rose-400 text-rose-200'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-100'
                }`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        {isCurrentSolved && (
          <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-2">
            <span>✓ {currentNode.bridgeExplanation}</span>
            {activeIdx + 1 < nodes.length && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveIdx((i) => i + 1);
                }}
                className="px-3 py-1 rounded bg-emerald-400 text-slate-950 font-bold shrink-0 cursor-pointer"
              >
                Next Bridge →
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </section>
  );
};

// ============================================================================
// 6. <DragDropMatch /> — Embedded Mini Visual Game (Sort Pairs into Baskets)
// ============================================================================
export const DragDropMatch: React.FC<{
  title: string;
  subtitle: string;
  categories: string[];
  items: MiniGameSortItem[];
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({ title, subtitle, categories, items, xpReward, isCompleted, onComplete }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [placedMap, setPlacedMap] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const remainingItems = items.filter((it) => !placedMap[it.id]);
  const activeItem = items.find((it) => it.id === selectedItemId) || remainingItems[0];

  const handleAssignToBasket = (category: string) => {
    if (!activeItem) return;
    if (activeItem.category === category) {
      soundFX.playCorrect();
      const next = { ...placedMap, [activeItem.id]: category };
      setPlacedMap(next);
      setFeedbackMsg({
        text: `Matched! "${activeItem.wordPair}" belongs to ${category}.`,
        ok: true,
      });
      const nextRemaining = items.filter((it) => !next[it.id]);
      if (nextRemaining.length > 0) {
        setSelectedItemId(nextRemaining[0].id);
      } else {
        onComplete();
      }
    } else {
      soundFX.playIncorrect();
      setFeedbackMsg({
        text: `Not quite! Hint: ${activeItem.hint}`,
        ok: false,
      });
    }
  };

  const handleResetGame = () => {
    soundFX.playClick();
    setPlacedMap({});
    setSelectedItemId(items[0]?.id || '');
    setFeedbackMsg(null);
  };

  return (
    <section className="bg-white border-2 border-[#231F20] rounded-xl overflow-hidden linocut-card">
      <InabelStrip
        variant="amber"
        label="Interactive Concept Sorting Mini-Game"
        rightText={`${Object.keys(placedMap).length}/${items.length} Sorted`}
      />
      <div className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-700">
            {Object.keys(placedMap).length}/{items.length} Sorted · +{xpReward} XP
          </span>
          {Object.keys(placedMap).length > 0 && (
            <button
              type="button"
              onClick={handleResetGame}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              title="Replay Mini-Game"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unsorted Word Pair Chips */}
      {remainingItems.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-600">
            1. Select or Drag a Word Pair Card:
          </div>
          <div className="flex flex-wrap gap-2">
            {remainingItems.map((it) => {
              const isSelected = activeItem?.id === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  draggable
                  onDragStart={() => setSelectedItemId(it.id)}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedItemId(it.id);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {it.wordPair}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span>🎉 Mini-Game Complete! All {items.length} word pairs sorted accurately!</span>
          <button
            type="button"
            onClick={handleResetGame}
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Relationship Category Baskets */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600">
          2. Tap (or Drop Into) the Matching Relationship Basket:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {categories.map((cat) => {
            const matchedHere = items.filter((it) => placedMap[it.id] === cat);
            return (
              <button
                key={cat}
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleAssignToBasket(cat)}
                onClick={() => handleAssignToBasket(cat)}
                className="p-3 rounded-xl border border-dashed border-slate-300 hover:border-sky-500 bg-slate-50/70 hover:bg-sky-50/40 text-left transition-colors space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{cat}</span>
                  <span className="text-[11px] font-mono text-sky-700 font-bold">
                    {matchedHere.length}
                  </span>
                </div>
                {matchedHere.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {matchedHere.map((m) => (
                      <span
                        key={m.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold"
                      >
                        ✓ {m.wordPair}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">Tap to place selected pair here</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs font-medium ${
            feedbackMsg.ok
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}
      </div>
    </section>
  );
};

// ============================================================================
// 7. <AnimatedStepper /> — Guided Analysis Step-by-Step Word Highlighter
// ============================================================================
export const AnimatedStepper: React.FC<{
  steps: GuidedStepperStep[];
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({ steps, xpReward, isCompleted, onComplete }) => {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const currentStep = steps[stepIdx] || steps[0];

  useEffect(() => {
    if (!autoPlay) return;
    const t = window.setTimeout(() => {
      if (stepIdx + 1 < steps.length) {
        setStepIdx((s) => s + 1);
      } else {
        setAutoPlay(false);
        onComplete();
      }
    }, 4200);
    return () => window.clearTimeout(t);
  }, [autoPlay, stepIdx, steps.length, onComplete]);

  const highlightStyles = {
    sky: 'bg-sky-200/90 text-sky-950 border-b-2 border-sky-600 px-1.5 py-0.5 rounded',
    amber: 'bg-amber-200/90 text-amber-950 border-b-2 border-amber-600 px-1.5 py-0.5 rounded',
    emerald: 'bg-emerald-200/90 text-emerald-950 border-b-2 border-emerald-600 px-1.5 py-0.5 rounded',
    rose: 'bg-rose-200/90 text-rose-950 border-b-2 border-rose-600 px-1.5 py-0.5 rounded',
    purple: 'bg-purple-200/90 text-purple-950 border-b-2 border-purple-600 px-1.5 py-0.5 rounded',
  };

  return (
    <div className="rounded-xl bg-slate-50 border-2 border-[#231F20] linocut-card overflow-hidden">
      <InabelStrip
        variant="royal"
        label={`Interactive Sentence Decoder • Step ${stepIdx + 1} of ${steps.length}`}
        rightText={`+${xpReward} XP`}
      />
      <div className="p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
          Interactive Sentence Decoder · Step {stepIdx + 1} of {steps.length}
        </div>
        <div className="text-xs font-mono font-bold text-emerald-700">
          {isCompleted ? `Completed (+${xpReward} XP)` : `+${xpReward} XP on Step ${steps.length}`}
        </div>
      </div>

      {/* Highlighted Sentence Box */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
        <div className="text-xs font-bold text-slate-500">{currentStep.label}</div>
        <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {currentStep.sentenceParts.map((part, idx) => (
            <span
              key={idx}
              className={
                part.isHighlighted
                  ? highlightStyles[part.highlightColor || 'sky']
                  : ''
              }
            >
              {part.text}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {currentStep.sentenceParts
            .filter((p) => p.isHighlighted && p.tagLabel)
            .map((p, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200"
              >
                ↑ {p.tagLabel}
              </span>
            ))}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {currentStep.explanation}
      </p>

      <MascotReaction mood="hint" message={currentStep.mascotTip} compact />

      {/* Play / Pause / Back / Next Stepper Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setAutoPlay((a) => !a);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoPlay ? 'Pause Walkthrough' : 'Auto-Play Steps'}</span>
          </button>
          <button
            type="button"
            disabled={stepIdx === 0}
            onClick={() => {
              soundFX.playClick();
              setAutoPlay(false);
              setStepIdx((s) => Math.max(0, s - 1));
            }}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setAutoPlay(false);
              if (stepIdx + 1 < steps.length) {
                setStepIdx((s) => s + 1);
                if (stepIdx + 1 === steps.length - 1) {
                  onComplete();
                }
              } else {
                onComplete();
                setStepIdx(0);
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
          >
            <span>{stepIdx + 1 < steps.length ? 'Next Step' : 'Finish & Replay'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <button
              key={s.stepNumber}
              type="button"
              onClick={() => {
                setStepIdx(i);
                if (i === steps.length - 1) onComplete();
              }}
              className={`w-6 h-6 rounded-md text-xs font-mono font-bold cursor-pointer ${
                i === stepIdx
                  ? 'bg-sky-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {s.stepNumber}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. <PitfallComparisonCards /> — Shake (Wrong) vs. Glow (Right) + Spot Challenge
// ============================================================================
export const PitfallComparisonCards: React.FC<{
  pairs: PitfallVisualPair[];
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({ pairs, xpReward, isCompleted, onComplete }) => {
  const [shakeId, setShakeId] = useState<string>('');
  const [solvedMap, setSolvedMap] = useState<Record<string, string>>({});

  const handleSpotAnswer = (pair: PitfallVisualPair, opt: string) => {
    setSolvedMap((prev) => {
      const next = { ...prev, [pair.id]: opt };
      const allCorrect = pairs.every((p) => next[p.id] === p.spotCorrect);
      if (allCorrect) {
        onComplete();
      }
      return next;
    });
    if (opt === pair.spotCorrect) {
      soundFX.playCorrect();
    } else {
      soundFX.playIncorrect();
      setShakeId(pair.id);
      window.setTimeout(() => setShakeId(''), 400);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">
          Tap a card to compare the Wrong Trap (shakes) vs. Correct Fix (glows), then solve the quick check:
        </span>
        <span className="font-mono font-bold text-emerald-700">
          {isCompleted ? `Spot-the-Mistake Complete (+${xpReward} XP)` : `+${xpReward} XP`}
        </span>
      </div>

      {pairs.map((p) => {
        const chosen = solvedMap[p.id];
        const isRight = chosen === p.spotCorrect;
        return (
          <div
            key={p.id}
            className="rounded-xl border-2 border-[#231F20] linocut-card bg-slate-50/70 overflow-hidden"
          >
            <InabelStrip variant="crimson" label={p.categoryLabel} rightText="Spot-the-Mistake" />
            <div className="p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800">{p.categoryLabel}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Wrong Trap Card (Shakes on click) */}
              <motion.div
                animate={shakeId === p.id ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  soundFX.playIncorrect();
                  setShakeId(p.id);
                  window.setTimeout(() => setShakeId(''), 400);
                }}
                className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1 cursor-pointer"
              >
                <div className="text-[11px] font-bold text-rose-800 uppercase">
                  ✕ Common Mistake (Tap to Test Trap)
                </div>
                <div className="text-xs font-bold text-rose-950">{p.wrongText}</div>
                <p className="text-[11px] text-rose-800/90 leading-snug">{p.wrongReason}</p>
              </motion.div>

              {/* Correct Card (Glows Emerald) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-300 shadow-xs space-y-1">
                <div className="text-[11px] font-bold text-emerald-800 uppercase">
                  ✓ Verified Correct Pattern
                </div>
                <div className="text-xs font-bold text-emerald-950">{p.rightText}</div>
                <p className="text-[11px] text-emerald-800/90 leading-snug">{p.rightReason}</p>
              </div>
            </div>

            {/* Spot-the-Mistake Micro-Check */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800">{p.spotQuestion}</span>
              <div className="flex items-center gap-2 shrink-0">
                {p.spotOptions.map((opt) => {
                  const active = chosen === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSpotAnswer(p, opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        active
                          ? opt === p.spotCorrect
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            {chosen && (
              <div className={`text-xs font-bold ${isRight ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isRight ? '✓ Spot on! You avoided the trap.' : '✕ Watch out! Check the green card above and try again.'}
              </div>
            )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 9. <HotspotScene /> — Illustrated Animated Davao Oriental Local Scene
// ============================================================================
export const HotspotScene: React.FC<{
  scene: DavaoSceneType;
  sceneTitle: string;
  sceneSubtitle: string;
  municipality: string;
  hotspots: DavaoHotspotItem[];
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({
  scene,
  sceneTitle,
  sceneSubtitle,
  municipality,
  hotspots,
  xpReward,
  isCompleted,
  onComplete,
}) => {
  const [activeHotspotId, setActiveHotspotId] = useState<string>(hotspots[0]?.id || '');
  const [visitedIds, setVisitedIds] = useState<Record<string, boolean>>(() =>
    hotspots[0] ? { [hotspots[0].id]: true } : {}
  );

  const activeHotspot = hotspots.find((h) => h.id === activeHotspotId) || hotspots[0];
  const visitedCount = Object.keys(visitedIds).length;

  const handleSelectHotspot = (hs: DavaoHotspotItem) => {
    soundFX.playClick();
    setActiveHotspotId(hs.id);
    const next = { ...visitedIds, [hs.id]: true };
    setVisitedIds(next);
    if (hotspots.every((h) => Boolean(next[h.id]))) {
      onComplete();
    }
  };

  return (
    <div className="rounded-xl border-2 border-[#231F20] bg-white overflow-hidden linocut-card">
      <InabelStrip
        variant="emerald"
        label={`Davao Oriental Heritage Explorer • ${municipality}`}
        rightText={`${visitedCount}/${hotspots.length} Pins`}
      />
      <div className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {municipality}
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">{sceneTitle}</h3>
          <p className="text-xs text-slate-500">{sceneSubtitle}</p>
        </div>
        <div className="text-xs font-mono font-bold text-emerald-700">
          {isCompleted || visitedCount === hotspots.length
            ? `All Hotspots Explored (+${xpReward} XP)`
            : `${visitedCount}/${hotspots.length} Pins Visited · +${xpReward} XP`}
        </div>
      </div>

      {/* Original Illustrated SVG Scene with Tappable Hotspot Pins */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 h-60 sm:h-72 bg-slate-900 select-none">
        <svg
          viewBox="0 0 800 360"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          role="img"
          aria-label={sceneTitle}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scene === 'hamiguitan' ? '#0F172A' : '#0284C7'} />
              <stop offset="65%" stopColor={scene === 'aliwagwag' ? '#0D9488' : '#38BDF8'} />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Sky Backdrop */}
          <rect width="800" height="360" fill="url(#skyGrad)" />

          {/* Sun / Golden Glow */}
          <circle cx="660" cy="78" r="42" fill="#FDE047" opacity="0.85" />
          <circle cx="660" cy="78" r="62" fill="#FEF08A" opacity="0.25" />

          {/* Mount Hamiguitan / Highland Ridges */}
          <path
            d="M0 250 L140 115 L290 220 L450 95 L610 230 L740 150 L800 240 L800 360 L0 360 Z"
            fill="#065F46"
          />
          <path
            d="M80 260 L230 140 L380 245 L530 130 L690 250 L800 250 L800 360 L0 360 Z"
            fill="#047857"
          />

          {/* Bonsai Trees / Coconut Palms */}
          <circle cx="230" cy="135" r="18" fill="#10B981" />
          <circle cx="530" cy="125" r="22" fill="#34D399" />

          {/* Waterfall Stream if Aliwagwag / Hamiguitan */}
          <path
            d="M445 105 Q460 180 430 265"
            stroke="#E0F2FE"
            strokeWidth="12"
            fill="none"
            strokeDasharray="8 4"
            opacity="0.8"
          />

          {/* White Sandbar & Pujada / Dahican Turquoise Waters */}
          <path d="M0 265 Q400 240 800 270 L800 360 L0 360 Z" fill="#FDE68A" />
          <path d="M0 282 Q400 260 800 285 L800 360 L0 360 Z" fill="url(#seaGrad)" />

          {/* Coastal Waves */}
          <path
            d="M60 315 Q120 305 180 315 T300 315 T420 315 T540 315 T660 315"
            stroke="#7DD3FC"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
        </svg>

        {/* Tappable Hotspot Pins */}
        {hotspots.map((hs, idx) => {
          const isSelected = activeHotspot?.id === hs.id;
          const isVisited = Boolean(visitedIds[hs.id]);
          return (
            <button
              key={hs.id}
              type="button"
              onClick={() => handleSelectHotspot(hs)}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={`Inspect hotspot: ${hs.label}`}
              className={`-translate-x-1/2 -translate-y-1/2 absolute px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-transform cursor-pointer shadow-md ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 scale-110 ring-4 ring-amber-300/60 z-20'
                  : isVisited
                  ? 'bg-emerald-600 text-white hover:scale-105 z-10'
                  : 'bg-slate-900/90 text-white border border-amber-300 hover:scale-105 z-10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className=" whitespace-nowrap">
                0{idx + 1}. {hs.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Hotspot Sentence Card */}
      {activeHotspot && (
        <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{activeHotspot.label}</span>
              <span className="text-emerald-400">·</span>
              <span className="text-emerald-800 font-mono">{activeHotspot.localTerm}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800">
              {activeHotspot.conceptHighlight}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-emerald-200/80">
            “{activeHotspot.sentence}”
          </p>

          <div className="text-[11px] text-emerald-900">
            <strong>Local / Bisaya Context:</strong> {activeHotspot.bisayaMeaning}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

// ============================================================================
// 10. <FlipCard /> — Vocabulary Flip Card with Web Speech Pronunciation
// ============================================================================
export const FlipCard: React.FC<{
  card: VocabFlipCardSpec;
  isFlipped: boolean;
  onToggleFlip: () => void;
}> = ({ card, isFlipped, onToggleFlip }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const pronEntry = findPronunciationEntry(card.term);

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    if (isSpeaking) {
      stopAllVoicePlayback();
      setIsSpeaking(false);
      return;
    }
    const prefs = loadUserVoicePreferences();
    const conversationalVocabScript = `${card.term}. ... ${card.term} means: ${card.definition} ... Here's an example sentence: ${card.exampleSentence}`;
    void speakQuickPassage({
      segmentId: `vocab-${card.id}`,
      spokenText: conversationalVocabScript,
      displayText: `${card.term}: ${card.definition}`,
      personaId: prefs.personaId,
      prosodyRole: 'vocab_card',
      speed: prefs.speed,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div
      onClick={() => {
        soundFX.playClick();
        onToggleFlip();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleFlip();
        }
      }}
      aria-label={`Vocabulary card for ${card.term}. Click to flip.`}
      className="rounded-xl border-2 border-[#231F20] linocut-card-sm bg-white hover:border-sky-500 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[178px]"
    >
      <InabelStrip variant="indigo" height={10} />
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-base font-bold text-slate-900">{card.term}</span>
          {pronEntry && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              /{pronEntry.syllables}/
            </span>
          )}
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] font-semibold text-sky-700">{card.partOfSpeech}</span>
        </div>

        {/* Pronunciation Button with Animated Sound Wave */}
        <button
          type="button"
          onClick={handlePronounce}
          aria-label={`Listen to pronunciation of ${card.term}`}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
            isSpeaking
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-slate-100 hover:bg-sky-50 text-slate-700 border-slate-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {isSpeaking ? (
            <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
              <motion.span
                animate={{ height: [4, 12, 5] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="w-0.5 bg-white rounded-full"
              />
              <motion.span
                animate={{ height: [10, 4, 12] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="w-0.5 bg-white rounded-full"
              />
              <motion.span
                animate={{ height: [6, 11, 4] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="w-0.5 bg-white rounded-full"
              />
            </span>
          ) : (
            <span>Speak</span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 0, rotateX: -15 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 15 }}
            transition={{ duration: 0.16 }}
            className="space-y-1.5"
          >
            <p className="text-xs text-slate-700 leading-relaxed">{card.definition}</p>
            <div className="text-[11px] font-semibold text-sky-700 pt-1">
              Tap card to flip for example & Filipino/Bisaya hint ↻
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateX: 15 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: -15 }}
            transition={{ duration: 0.16 }}
            className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 space-y-1.5"
          >
            <p className="text-xs font-semibold text-sky-950 italic">
              “{card.exampleSentence}”
            </p>
            <div className="text-[11px] text-amber-900 font-medium">
              {card.filipinoBisayaHint}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// 11. <SelfCheckVisualChallenge /> — Streak Counter, Timer Ring & Mascot
// ============================================================================
export const SelfCheckVisualChallenge: React.FC<{
  questions: SelfCheckRapidQuestion[];
  timerSeconds: number;
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({ questions, timerSeconds, xpReward, isCompleted, onComplete }) => {
  const [qIdx, setQIdx] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<string>('');
  const [finished, setFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const currentQ = questions[qIdx] || questions[0];

  useEffect(() => {
    if (!timerActive || finished || Boolean(selected)) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          setSelected('__TIMEOUT__');
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [timerActive, finished, selected]);

  const handleChoose = (opt: string) => {
    if (selected) return;
    setTimerActive( true );
    setSelected(opt);
    if (opt === currentQ.answer) {
      soundFX.playCorrect();
      setStreak((s) => s + 1);
      setScore((s) => s + 1);
    } else {
      soundFX.playIncorrect();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundFX.playClick();
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setSelected('');
      setTimeLeft(timerSeconds);
      setTimerActive(true);
    } else {
      setFinished(true);
      onComplete();
    }
  };

  const handleReplay = () => {
    soundFX.playClick();
    setQIdx(0);
    setStreak(0);
    setScore(0);
    setSelected('');
    setFinished(false);
    setTimeLeft(timerSeconds);
    setTimerActive(true);
  };

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / Math.max(1, timerSeconds));

  return (
    <div className="rounded-xl bg-slate-900 text-white border-2 border-[#231F20] linocut-card overflow-hidden">
      <InabelStrip
        variant="amber"
        label="Rapid Visual Self-Check Challenge"
        rightText={`Streak: ${streak}`}
      />
      <div className="p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Rapid Visual Self-Check Challenge
          </div>
          <p className="text-[11px] text-slate-300">
            Build your streak before taking the official bridge quiz!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak Counter */}
          <div className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak: {streak}</span>
          </div>

          {/* Animated SVG Timer Ring */}
          <div className="flex items-center gap-1.5">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="#334155"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke={timeLeft <= 5 ? '#F43F5E' : '#38BDF8'}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="text-xs font-mono font-bold text-sky-300">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {finished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl bg-slate-800 border border-emerald-400/40 text-center space-y-3"
        >
          <div className="text-lg font-bold text-emerald-300">
            Self-Check Complete! Score: {score}/{questions.length}
          </div>
          <p className="text-xs text-slate-300">
            You earned +{xpReward} Visual XP and unlocked full readiness for the module quiz!
          </p>
          <button
            type="button"
            onClick={handleReplay}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Practice Again
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400">
            Question {qIdx + 1} of {questions.length} · +{xpReward} XP
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white">
            {currentQ.prompt}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentQ.options.map((opt) => {
              const isChosen = selected === opt;
              const isAnswer = opt === currentQ.answer;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChoose(opt)}
                  className={`p-3 rounded-lg text-left text-xs font-bold border transition-all cursor-pointer ${
                    selected
                      ? isAnswer
                        ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                        : isChosen
                        ? 'bg-rose-900 border-rose-400 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="space-y-2 pt-1">
              <MascotReaction
                mood={selected === currentQ.answer ? 'cheer' : 'hint'}
                message={
                  selected === currentQ.answer ? currentQ.mascotCheer : currentQ.mascotHint
                }
                compact
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {qIdx + 1 < questions.length ? 'Next Question →' : 'See Results →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

// ============================================================================
// 12. <AnimatedCheatsheetInfographic /> — Section-by-Section Builder + Print
// ============================================================================
export const AnimatedCheatsheetInfographic: React.FC<{
  moduleTitle: string;
  nodes: CheatsheetVisualNode[];
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
}> = ({ moduleTitle, nodes, xpReward, isCompleted, onComplete }) => {
  const [revealedCount, setRevealedCount] = useState<number>(1);

  const handleRevealNext = () => {
    soundFX.playClick();
    if (revealedCount < nodes.length) {
      const next = revealedCount + 1;
      setRevealedCount(next);
      if (next === nodes.length) {
        onComplete();
      }
    } else {
      onComplete();
    }
  };

  const handleRevealAll = () => {
    soundFX.playClick();
    setRevealedCount(nodes.length);
    onComplete();
  };

  const handlePrintCheatsheet = () => {
    soundFX.playClick();
    setRevealedCount(nodes.length);
    onComplete();
    try {
      window.print();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-600">
          Build your visual memory map section by section ({revealedCount}/{nodes.length} unlocked):
        </div>
        <div className="flex items-center gap-2">
          {revealedCount < nodes.length ? (
            <>
              <button
                type="button"
                onClick={handleRevealNext}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
              >
                + Build Next Section ({revealedCount}/{nodes.length})
              </button>
              <button
                type="button"
                onClick={handleRevealAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Show All (+{xpReward} XP)
              </button>
            </>
          ) : (
            <span className="text-xs font-mono font-bold text-emerald-700">
              ✓ Full Infographic Built (+{xpReward} XP)
            </span>
          )}

          <button
            type="button"
            onClick={handlePrintCheatsheet}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nodes.slice(0, revealedCount).map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border-2 border-[#231F20] linocut-card-sm bg-slate-50/80 overflow-hidden"
          >
            <InabelStrip variant="royal" height={10} />
            <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-sky-700">
                0{node.stepIndex} · {node.title}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900">
              {node.formulaOrKey}
            </div>
            <div className="text-xs text-slate-700">
              <strong>Example:</strong> {node.quickExample}
            </div>
            <div className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              <strong>Memory Trick:</strong> {node.memoryTrick}
            </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
