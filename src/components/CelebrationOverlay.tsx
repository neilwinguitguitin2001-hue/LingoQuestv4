import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, Sparkles, X } from 'lucide-react';
import { BADGE_DEFINITIONS } from '../data/seedData';
import type { BadgeDefinition } from '../types/lingoquest';
import { BadgeIcon } from './BadgeIcon';
import {
  InabelWovenStrip,
  JeepneySignboardBanner,
  PhilippineSunMedallion,
} from './FilipinianaMotifs';

export interface StudentLevelTier {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
}

export const STUDENT_LEVEL_TIERS: StudentLevelTier[] = [
  { level: 1, title: 'Bangka Paddler', minPoints: 0, maxPoints: 499, badgeColor: '#00838F' },
  { level: 2, title: 'Terrace Explorer', minPoints: 500, maxPoints: 1199, badgeColor: '#2E7D32' },
  { level: 3, title: 'Inabel Weaver', minPoints: 1200, maxPoints: 2199, badgeColor: '#D84315' },
  { level: 4, title: 'Pujada Navigator', minPoints: 2200, maxPoints: 3499, badgeColor: '#F57F17' },
  { level: 5, title: 'Pamana Master', minPoints: 3500, maxPoints: 99999, badgeColor: '#C62828' },
];

export function getStudentLevelInfo(points: number): StudentLevelTier {
  for (let i = STUDENT_LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (points >= STUDENT_LEVEL_TIERS[i].minPoints) {
      return STUDENT_LEVEL_TIERS[i];
    }
  }
  return STUDENT_LEVEL_TIERS[0];
}

export type CelebrationEvent =
  | {
      type: 'badge';
      badge: BadgeDefinition;
    }
  | {
      type: 'level_up';
      previousLevel: number;
      newLevel: number;
      levelInfo: StudentLevelTier;
      totalPoints: number;
    };

export interface CelebrationPayload {
  title: string;
  subtitle: string;
  pointsAdded: number;
  unlockedBadgeIds: string[];
  bridgeRestored: boolean;
}

interface CelebrationOverlayProps {
  celebration?: CelebrationPayload | null;
  onDismiss?: () => void;
  events?: CelebrationEvent[];
  onClose?: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  celebration,
  onDismiss,
  events,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [eventIdx, setEventIdx] = useState<number>(0);

  const handleClose = () => {
    if (events && events.length > 0 && eventIdx + 1 < events.length) {
      setEventIdx((prev) => prev + 1);
      return;
    }
    if (onDismiss) onDismiss();
    if (onClose) onClose();
  };

  // Normalize either `events` prop or `celebration` prop into a unified display model
  const activeEvent = events && events.length > 0 ? events[eventIdx] || events[0] : null;
  const resolvedCelebration: CelebrationPayload | null = celebration
    ? celebration
    : activeEvent
    ? activeEvent.type === 'badge'
      ? {
          title: `Pamana Badge Unlocked: ${activeEvent.badge.name}!`,
          subtitle: activeEvent.badge.description,
          pointsAdded: activeEvent.badge.pointsBonus,
          unlockedBadgeIds: [activeEvent.badge.id],
          bridgeRestored: true,
        }
      : {
          title: `Level Up! Lv.${activeEvent.newLevel} ${activeEvent.levelInfo.title}`,
          subtitle: `You advanced from Level ${activeEvent.previousLevel} to Level ${activeEvent.newLevel}!`,
          pointsAdded: activeEvent.totalPoints,
          unlockedBadgeIds: [],
          bridgeRestored: true,
        }
    : null;

  useEffect(() => {
    if (!resolvedCelebration) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fiesta palette: Fiesta Crimson, Sunburst Harvest Gold, Banaue Emerald, Tropical River Cyan, Terracotta
    const colors = ['#C62828', '#F57F17', '#2E7D32', '#00838F', '#D84315', '#FFD54F'];
    const particles = Array.from({ length: 82 }).map((_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.45 - 60,
      vx: (Math.random() - 0.5) * 5.5,
      vy: Math.random() * 3.8 + 1.8,
      size: Math.random() * 11 + 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.12,
      // Alternate between Fiesta Banderitas (triangular pennants) and Tropical Gumamela (5-petal hibiscus)
      kind: i % 3 === 0 ? 'gumamela' : 'banderitas',
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055; // gentle gravity
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.kind === 'banderitas') {
          // Fiesta Banderitas: Colorful Triangular Pennant with woodcut outline
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.7, -p.size * 0.5);
          ctx.lineTo(p.size * 0.7, -p.size * 0.5);
          ctx.lineTo(0, p.size * 0.85);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = '#231F20';
          ctx.stroke();
        } else {
          // Tropical Gumamela (Hibiscus) 5-Petal Blossom
          ctx.fillStyle = p.color;
          for (let petal = 0; petal < 5; petal++) {
            ctx.save();
            ctx.rotate((petal * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.ellipse(0, -p.size * 0.42, p.size * 0.28, p.size * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          // Golden Stamen Center
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.18, 0, Math.PI * 2);
          ctx.fillStyle = '#FFD54F';
          ctx.fill();
        }
        ctx.restore();
      });
      animId = requestAnimationFrame(render);
    };

    render();

    const autoCloseTimer = window.setTimeout(() => {
      handleClose();
    }, 5500);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(autoCloseTimer);
    };
  }, [Boolean(resolvedCelebration), eventIdx]);

  if (!resolvedCelebration) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 nipa-modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      <div className="relative z-10 w-full max-w-md linocut-card rounded-2xl overflow-hidden text-center jeepney-modal-enter">
        <InabelWovenStrip variant="crimson" height={12} />

        <div className="p-6 sm:p-7 space-y-5 bg-[#FFFDFB]">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-4 p-1.5 rounded-lg border-2 border-[#231F20] bg-[#FAF7F2] text-[#231F20] hover:bg-[#F57F17] transition-colors cursor-pointer"
            aria-label="Close celebration modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <JeepneySignboardBanner
              label="Fiesta Tagumpay · Quest Victory"
              baybayin="ᜆᜄᜓᜋ᜔ᜉᜌ᜔"
              variant="gold"
            />
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF8E1] border-2 border-[#231F20] shadow-[3px_3px_0px_#231F20] flex items-center justify-center mt-1">
              <PhilippineSunMedallion size={46} animated={true} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8F5E9] border border-[#2E7D32] text-[#2E7D32] text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Banderitas & Gumamela Fiesta Reward</span>
            </div>
            <h2
              id="celebration-title"
              className="text-2xl font-bold text-[#231F20] font-display"
            >
              {resolvedCelebration.title}
            </h2>
            <p className="text-sm text-[#6D4C41]">{resolvedCelebration.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#FFF8E1] border-2 border-[#231F20] shadow-[2px_2px_0px_#231F20]">
              <div className="text-xs font-bold text-[#6D4C41]">Sun XP Earned</div>
              <div className="text-xl font-black font-mono text-[#D84315] mt-0.5 flex items-center justify-center gap-1">
                <PhilippineSunMedallion size={20} />
                <span>+{resolvedCelebration.pointsAdded} XP</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F5E9] border-2 border-[#231F20] shadow-[2px_2px_0px_#231F20]">
              <div className="text-xs font-bold text-[#2E7D32]">Terrace Bridge</div>
              <div className="text-sm font-extrabold text-[#1B5E20] mt-1.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>{resolvedCelebration.bridgeRestored ? 'Restored!' : 'Verified!'}</span>
              </div>
            </div>
          </div>

          {resolvedCelebration.unlockedBadgeIds.length > 0 && (
            <div className="space-y-2.5 text-left">
              <div className="text-xs font-extrabold text-[#231F20] flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#C62828]" />
                <span>New Pamana Badges Unlocked:</span>
              </div>
              <div className="space-y-2">
                {Array.from(new Set(resolvedCelebration.unlockedBadgeIds)).map((bId) => {
                  const badge = BADGE_DEFINITIONS.find((b) => b.id === bId);
                  if (!badge) return null;
                  return (
                    <div
                      key={`celebrate-badge-${bId}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#231F20] shadow-[2px_2px_0px_#231F20]"
                    >
                      <BadgeIcon
                        iconType={badge.iconType}
                        unlocked={true}
                        className="w-7 h-7 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#231F20]">
                          {badge.name}
                        </div>
                        <div className="text-[11px] text-[#6D4C41]">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 px-4 btn-fiesta text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            {events && events.length > 1 && eventIdx + 1 < events.length
              ? `Next Reward (${eventIdx + 1}/${events.length}) →`
              : 'Padayon! Continue Island Quest'}
          </button>
        </div>
      </div>
    </div>
  );
};
