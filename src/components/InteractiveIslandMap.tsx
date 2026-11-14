import { IslandBoat } from './IslandBoat';
import { useMapAudio } from '../context/AudioContext';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { soundFX } from '../utils/soundEffects';

export interface IslandStationData {
  id: string;
  key: 'q1' | 'q2' | 'q3' | 'q4' | 'discovery' | 'mastery';
  quarterNumber?: 1 | 2 | 3 | 4;
  tag: string;
  cardKicker: string;
  name: string;
  place: string;
  location: string;
  label: string;
  pillLabel: string;
  ax: number;
  ay: number;
  by: number;
  lx: number;
  ly: number;
  note: string;
  realLifeGeography: string;
  curriculumFocus: string;
  competencySnippet: string;
  // Role-specific badges and stats
  status?: 'completed' | 'current' | 'upcoming' | 'locked';
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'default';
  statA?: { label: string; value: string | number };
  statB?: { label: string; value: string | number };
  statC?: { label: string; value: string | number };
}

export const DAVAO_ORIENTAL_ISLANDS: IslandStationData[] = [
  {
    id: 'q1-san-victor',
    key: 'q1',
    quarterNumber: 1,
    tag: 'Quarter 1',
    cardKicker: 'QUARTER 1',
    name: 'San Victor Island',
    place: 'Baganga',
    location: 'Baganga',
    label: 'Q1 · San Victor',
    pillLabel: 'Q1 · San Victor',
    ax: 155,
    ay: 321,
    by: 292,
    lx: 156,
    ly: 146,
    note: 'Lush teardrop sanctuary with wide white sand beach, dense forest, and tall emergent palm.',
    realLifeGeography:
      'A 3-hectare pristine teardrop islet in Baganga, Davao Oriental featuring powdery white coral sand, vibrant turquoise reef shallows, dense tropical broadleaf canopy, and Baganga\'s renowned giant clam sanctuary.',
    curriculumFocus: 'Grammar Foundations, Voice, Tenses & Viewing Genres',
    competencySnippet: 'Active/Passive Voice, Past Perfect Tense, and Contextual Analogies.',
  },
  {
    id: 'q2-oak',
    key: 'q2',
    quarterNumber: 2,
    tag: 'Quarter 2',
    cardKicker: 'QUARTER 2',
    name: 'Oak Island',
    place: 'Mati City',
    location: 'Mati City',
    label: 'Q2 · Oak',
    pillLabel: 'Q2 · Oak',
    ax: 339,
    ay: 223,
    by: 190,
    lx: 345,
    ly: 80,
    note: 'Pristine pure vanishing sandbar in a turquoise lagoon, emerged from the sea.',
    realLifeGeography:
      'The legendary vanishing sandbar of Pujada Bay that submerges during high tide and emerges as a pristine white coral sandbar at low tide, with turquoise ripple flats and crystal waters.',
    curriculumFocus: 'Modals, Syntax, Connectors & Expository Prose',
    competencySnippet: 'Modal verbs of obligation/necessity and transition signals in expository writing.',
  },
  {
    id: 'q3-waniban',
    key: 'q3',
    quarterNumber: 3,
    tag: 'Quarter 3',
    cardKicker: 'QUARTER 3',
    name: 'Waniban Island',
    place: 'Mati City',
    location: 'Mati City',
    label: 'Q3 · Waniban',
    pillLabel: 'Q3 · Waniban',
    ax: 556,
    ay: 345,
    by: 280,
    lx: 556,
    ly: 156,
    note: 'Low sand spit and a small grove, ringed by shallow reef.',
    realLifeGeography:
      'A low sand spit cay with a lush central palm grove, swept by vibrant aquamarine shallows and protected living coral reef.',
    curriculumFocus: 'Literary Imagery, Figurative Devices & Descriptive Tone',
    competencySnippet: 'Sensory imagery, metaphors, and participial modifiers in regional poetry.',
  },
  {
    id: 'q4-pujada',
    key: 'q4',
    quarterNumber: 4,
    tag: 'Quarter 4',
    cardKicker: 'QUARTER 4',
    name: 'Pujada Island',
    place: 'Mati City',
    location: 'Mati City',
    label: 'Q4 · Pujada',
    pillLabel: 'Q4 · Pujada',
    ax: 760,
    ay: 218,
    by: 189,
    lx: 760,
    ly: 64,
    note: 'Hilly forest cap with a pale beach curving along the front.',
    realLifeGeography:
      'Expansive 156-hectare gem of Pujada Bay with rolling forested hill ridges, white sand beach curving along the front, and turquoise lagoon shallows.',
    curriculumFocus: 'Persuasive Rhetoric, Argumentative Claims & Synthesis',
    competencySnippet: 'Claims of fact/value/policy and synthesizing multi-genre research evidence.',
  },
  {
    id: 'discovery-dinosaur',
    key: 'discovery',
    tag: 'Discovery',
    cardKicker: 'DISCOVERY',
    name: 'Sleeping Dinosaur',
    place: 'Badas',
    location: 'Badas',
    label: 'Sleeping Dinosaur',
    pillLabel: 'Sleeping Dinosaur',
    ax: 980,
    ay: 330,
    by: 250,
    lx: 980,
    ly: 120,
    note: 'Natural peninsula shaped like a sleeping dinosaur, head resting in the sea.',
    realLifeGeography:
      'Iconic headland promontory stretching across Pujada Bay with the unmistakable silhouette of a giant sleeping dinosaur (snout resting peacefully on the sea, curved neck saddle, and forested ridged back).',
    curriculumFocus: 'Diagnostic Vocabulary, Idioms & Visual Bridge Quests',
    competencySnippet: 'Picture hunt vocabulary identification, regional word etymology, and fast-paced word puzzles.',
  },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export interface InteractiveIslandMapProps {
  mode?: 'signin' | 'student' | 'teacher' | 'admin';
  activeIslandId?: string;
  onSelectIsland?: (island: IslandStationData) => void;
  islandCustomData?: Partial<
    Record<
      string,
      {
        status?: 'completed' | 'current' | 'upcoming' | 'locked';
        badgeText?: string;
        badgeType?: 'success' | 'warning' | 'info' | 'default';
        statA?: { label: string; value: string | number };
        statB?: { label: string; value: string | number };
        statC?: { label: string; value: string | number };
      }
    >
  >;
  className?: string;
  showCards?: boolean;
  enableKeyboardNav?: boolean;
  interactive?: boolean;
  showRouteLine?: boolean;
}

const EMPTY_CUSTOM_DATA: Record<string, Partial<IslandStationData>> = {};

// Static route paths definition: cubic bezier between consecutive island stations
const STATIC_ROUTE_SEGMENTS = (() => {
  const list: Array<{
    from: IslandStationData;
    to: IslandStationData;
    d: string;
    color: string;
  }> = [];

  for (let i = 0; i < DAVAO_ORIENTAL_ISLANDS.length - 1; i++) {
    const P = DAVAO_ORIENTAL_ISLANDS[i];
    const Q = DAVAO_ORIENTAL_ISLANDS[i + 1];
    const dx = Q.ax - P.ax;
    const d = `M${P.ax} ${P.ay} C${P.ax + dx * 0.5} ${P.ay} ${Q.ax - dx * 0.5} ${Q.ay} ${Q.ax} ${Q.ay}`;
    list.push({
      from: P,
      to: Q,
      d,
      color: COLORS[i % COLORS.length],
    });
  }
  return list;
})();

// Exact analytical cubic Bezier arc lengths and cumulative positions for 5 islands
const STATIC_SEG_LENGTHS = [233.6, 267.94, 250.55, 255.33];
const STATIC_CUM_LENGTHS = [0, 233.6, 501.54, 752.09, 1007.42];

export const InteractiveIslandMap: React.FC<InteractiveIslandMapProps> = ({
  mode = 'signin',
  activeIslandId,
  onSelectIsland,
  islandCustomData = EMPTY_CUSTOM_DATA,
  className = '',
  showCards = true,
  enableKeyboardNav = true,
  interactive = true,
  showRouteLine = true,
}) => {
  useMapAudio();
  // Keep onSelectIsland in a ref so changes in parent callbacks do not trigger effect re-runs
  const onSelectIslandRef = useRef(onSelectIsland);
  onSelectIslandRef.current = onSelectIsland;

  // Merge static station data with dynamic runtime props
  const islands = useMemo(() => {
    return DAVAO_ORIENTAL_ISLANDS.map((station) => {
      const overrides = islandCustomData?.[station.id];
      if (!overrides) return station;
      return {
        ...station,
        ...overrides,
      };
    });
  }, [islandCustomData]);

  const islandsRef = useRef(islands);
  islandsRef.current = islands;

  // Determine initial index (Discovery is index 4, or match activeIslandId)
  const getInitialIndex = useCallback(() => {
    if (activeIslandId) {
      const idx = DAVAO_ORIENTAL_ISLANDS.findIndex((isl) => isl.id === activeIslandId);
      if (idx !== -1) return idx;
    }
    return mode === 'signin' ? 4 : 0;
  }, [activeIslandId, mode]);

  const [activeIndex, setActiveIndex] = useState<number>(getInitialIndex);

  // Analytical cubic Bezier point evaluation
  const getPointAnalytic = useCallback((segmentIndex: number, t: number) => {
    const P = DAVAO_ORIENTAL_ISLANDS[segmentIndex];
    const Q = DAVAO_ORIENTAL_ISLANDS[segmentIndex + 1];
    if (!P || !Q) return { x: 0, y: 0 };
    const dx = Q.ax - P.ax;
    const p0 = { x: P.ax, y: P.ay };
    const p1 = { x: P.ax + dx * 0.5, y: P.ay };
    const p2 = { x: Q.ax - dx * 0.5, y: Q.ay };
    const p3 = { x: Q.ax, y: Q.ay };

    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
    const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
    return { x, y };
  }, []);

  const getPointAt = useCallback(
    (L: number) => {
      let i = 0;
      while (i < STATIC_SEG_LENGTHS.length - 1 && L > STATIC_CUM_LENGTHS[i + 1]) {
        i++;
      }

      const segLen = STATIC_SEG_LENGTHS[i] || 1;
      const distInSeg = Math.max(0, Math.min(L - STATIC_CUM_LENGTHS[i], segLen));
      const t = distInSeg / segLen;
      return getPointAnalytic(i, t);
    },
    [getPointAnalytic]
  );

  // Boat distance along the entire path - initialized immediately without layout delays
  const initialDist = STATIC_CUM_LENGTHS[getInitialIndex()] || 0;
  const [currentDist, setCurrentDist] = useState<number>(initialDist);
  const curDistRef = useRef<number>(initialDist);
  const rafRef = useRef<number>(0);

  // Boat travel heading direction ('east' = sailing rightward, 'west' = sailing leftward)
  const [heading, setHeading] = useState<'east' | 'west'>('east');

  // Navigate boat to island `i` with easeInOutQuad timing
  const goToIsland = useCallback((i: number, triggerCallback = true) => {
    if (i < 0 || i >= DAVAO_ORIENTAL_ISLANDS.length) return;
    soundFX.stopSailing();
    setActiveIndex(i);

    const target = STATIC_CUM_LENGTHS[i] ?? 0;
    const from = curDistRef.current;

    if (target < from) {
      setHeading('west');
    } else if (target > from) {
      setHeading('east');
    }

    if (triggerCallback) {
      const selectedIsland = islandsRef.current[i] || DAVAO_ORIENTAL_ISLANDS[i];
      if (selectedIsland) {
        prevPropActiveIslandIdRef.current = selectedIsland.id;
        onSelectIslandRef.current?.(selectedIsland);
      }
    }

    cancelAnimationFrame(rafRef.current);

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || from === target) {
      curDistRef.current = target;
      setCurrentDist(target);
      return;
    }

    const dist = Math.abs(target - from);
    const dur = Math.min(2600, Math.max(700, dist * 2.2));
    soundFX.playSailing(dur / 1000);
    const t0 = performance.now();

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const cur = from + (target - from) * e;
      curDistRef.current = cur;
      setCurrentDist(cur);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  // Sync external activeIslandId ONLY when the parent prop genuinely changes
  const prevPropActiveIslandIdRef = useRef<string | undefined>(activeIslandId);
  useEffect(() => {
    if (activeIslandId && activeIslandId !== prevPropActiveIslandIdRef.current) {
      prevPropActiveIslandIdRef.current = activeIslandId;
      const idx = DAVAO_ORIENTAL_ISLANDS.findIndex(
        (isl) => isl.id === activeIslandId || isl.key === activeIslandId
      );
      if (idx !== -1) {
        goToIsland(idx, false); // Do not trigger callback back to parent
      }
    } else if (!activeIslandId && prevPropActiveIslandIdRef.current) {
      prevPropActiveIslandIdRef.current = undefined;
    }
  }, [activeIslandId, goToIsland]);

  // Cleanup requestAnimationFrame on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    if (!enableKeyboardNav) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % DAVAO_ORIENTAL_ISLANDS.length;
        goToIsland(nextIndex, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (activeIndex - 1 + DAVAO_ORIENTAL_ISLANDS.length) % DAVAO_ORIENTAL_ISLANDS.length;
        goToIsland(prevIndex, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, enableKeyboardNav, goToIsland]);

  // Compute current boat coordinates (pt.x, pt.y - 3) as in approved design
  const boatPos = useMemo(() => {
    const pt = getPointAt(currentDist);
    return { x: pt.x, y: pt.y - 3 };
  }, [currentDist, getPointAt]);

  const activeIsland = islands[activeIndex] || islands[4];

  return (
    <div
      className={`relative w-full max-w-[1280px] mx-auto select-none ${className}`}
      role="region"
      aria-label="Illustrated map of six islands in Davao Oriental"
    >
      {/* Scoped CSS from approved design */}
      <style>{`
        .davao-map-frame {
          border: 1px solid #142748;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(#0b1a3a, #050c20);
        }
        .davao-map-scene-wrap {
          overflow-x: auto;
        }
        .davao-map-scene {
          position: relative;
          min-width: 760px;
          aspect-ratio: 1200 / 480;
          container-type: inline-size;
        }
        .davao-map-scene svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Labels */
        .davao-map-lbl {
          position: absolute;
          transform: translate(-50%, -50%);
          font: 600 clamp(10px, 1.3cqw, 16px) / 1 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          color: #fff;
          white-space: nowrap;
          cursor: pointer;
          padding: 0.62em 1.15em;
          border-radius: 999px;
          border: 1.5px solid #284580;
          background: rgba(9, 22, 50, 0.9);
          transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .davao-map-lbl:hover {
          border-color: #4a6fc0;
        }
        .davao-map-lbl[aria-pressed="true"] {
          background: #4f46e5;
          border-color: #8a84ff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.22), 0 8px 24px rgba(79, 70, 229, 0.45);
        }
        .davao-map-lbl:focus-visible,
        .davao-map-card:focus-visible {
          outline: 3px solid #9bb8ff;
          outline-offset: 3px;
        }

        /* Caption in the open water */
        .davao-map-caption {
          position: absolute;
          left: 2.6%;
          bottom: 6%;
          max-width: min(36%, 380px);
          color: #9fb2d6;
          font-size: clamp(11px, 1.15cqw, 14px);
          line-height: 1.5;
          pointer-events: none;
        }
        .davao-map-caption strong {
          display: block;
          color: #eaf1ff;
          font-size: clamp(13px, 1.5cqw, 19px);
          font-weight: 700;
          margin-bottom: 0.15em;
        }

        /* Cards */
        .davao-map-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          padding: 16px;
          border-top: 1px solid #1b3160;
          background: #060f26;
        }
        .davao-map-card {
          position: relative;
          text-align: left;
          cursor: pointer;
          color: #eaf1ff;
          font: inherit;
          padding: 16px 20px 15px;
          border-radius: 16px;
          background: #0a1631;
          border: 1px solid #142748;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .davao-map-card:hover {
          border-color: #2d4b86;
        }
        .davao-map-card .tag {
          display: block;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #c6d3ef;
        }
        .davao-map-card .name {
          display: block;
          margin-top: 12px;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .davao-map-card .place {
          display: block;
          margin-top: 5px;
          font-size: 14.5px;
          color: #9fb2d6;
        }
        .davao-map-card[aria-pressed="true"] {
          border: 2px solid #3b82f6;
          padding: 15px 19px 14px;
          background: #0d2147;
          box-shadow: 0 0 22px rgba(59, 130, 246, 0.25);
        }
        .davao-map-card .dot {
          display: none;
          position: absolute;
          top: 19px;
          right: 20px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #f5b82e;
          box-shadow: 0 0 8px rgba(245, 184, 46, 0.8);
        }
        .davao-map-card[aria-pressed="true"] .dot {
          display: block;
        }

        @media (max-width: 980px) {
          .davao-map-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 560px) {
          .davao-map-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 12px;
          }
          .davao-map-card .name {
            font-size: 16px;
          }
        }

        /* Morning atmosphere and ambient motion: realistic morning sky, sun rays, ocean waves, clouds, boat and lighthouse */
        @keyframes davao_sun_pulse {
          0%, 100% {
            opacity: 0.92;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
        @keyframes davao_sun_rays {
          0%, 100% {
            opacity: 0.22;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.38;
            transform: rotate(2.5deg);
          }
        }
        @keyframes davao_morning_glitter {
          0%, 100% {
            opacity: 0.3;
            transform: scaleX(1) translateX(0);
          }
          50% {
            opacity: 0.58;
            transform: scaleX(1.08) translateX(6px);
          }
        }
        @keyframes davao_caustic_shimmer {
          0%, 100% {
            transform: translate(0, 0) scaleY(1);
            opacity: 0.32;
          }
          50% {
            transform: translate(8px, -2px) scaleY(1.05);
            opacity: 0.52;
          }
        }
        /* Realistic trochoidal ocean wave swell orbital motion */
        @keyframes davao_ocean_swell_1 {
          0% {
            transform: translate(0px, 0px);
          }
          25% {
            transform: translate(18px, -2.5px);
          }
          50% {
            transform: translate(36px, 0px);
          }
          75% {
            transform: translate(18px, 2px);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }
        @keyframes davao_ocean_swell_2 {
          0% {
            transform: translate(0px, 0px);
          }
          25% {
            transform: translate(-16px, 2px);
          }
          50% {
            transform: translate(-32px, 0px);
          }
          75% {
            transform: translate(-16px, -2.5px);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }
        @keyframes davao_ocean_swell_3 {
          0% {
            transform: translate(0px, 0px);
          }
          33% {
            transform: translate(15px, -1.8px);
          }
          66% {
            transform: translate(28px, 1.2px);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }
        /* High Altitude Cirrus Wisps slow atmospheric drift */
        @keyframes davao_cirrus_drift {
          0% {
            transform: translateX(-24px);
          }
          50% {
            transform: translateX(36px);
          }
          100% {
            transform: translateX(-24px);
          }
        }
        /* Primary Volumetric Morning Cumulus Billowing & Atmospheric Drift */
        @keyframes davao_cloud_billow_1 {
          0% {
            transform: translate(-18px, 0px) scale(1, 1);
          }
          33% {
            transform: translate(14px, -1.8px) scale(1.025, 1.018);
          }
          66% {
            transform: translate(36px, 0.8px) scale(0.99, 1.01);
          }
          100% {
            transform: translate(-18px, 0px) scale(1, 1);
          }
        }
        @keyframes davao_cloud_billow_2 {
          0% {
            transform: translate(24px, 0px) scale(1, 1);
          }
          33% {
            transform: translate(-8px, -2px) scale(1.02, 1.02);
          }
          66% {
            transform: translate(-32px, 1.2px) scale(1.01, 0.995);
          }
          100% {
            transform: translate(24px, 0px) scale(1, 1);
          }
        }
        @keyframes davao_wake {
          0% { transform: translateX(0) scale(0.75, 0.65); opacity: 0; }
          22% { opacity: 0.65; }
          100% { transform: translateX(-16px) scale(1.45, 1.2); opacity: 0; }
        }
        @keyframes davao_beam {
          0%,
          100% {
            opacity: 0.06;
          }
          50% {
            opacity: 0.32;
          }
        }
        @keyframes davao_lantern {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
          }
        }
        .davao_sun {
          animation: davao_sun_pulse 9s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .davao_sun_rays {
          animation: davao_sun_rays 14s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .davao_morning_glitter {
          animation: davao_morning_glitter 5.5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .davao_caustic_shimmer {
          animation: davao_caustic_shimmer 6.5s ease-in-out infinite;
        }
        .davao_ocean_swell_1 {
          animation: davao_ocean_swell_1 12s ease-in-out infinite;
        }
        .davao_ocean_swell_2 {
          animation: davao_ocean_swell_2 8.5s ease-in-out infinite;
        }
        .davao_ocean_swell_3 {
          animation: davao_ocean_swell_3 6.2s ease-in-out infinite;
        }
        .davao_cirrus {
          animation: davao_cirrus_drift 75s ease-in-out infinite;
        }
        .davao_cloud_1 {
          animation: davao_cloud_billow_1 60s ease-in-out infinite;
        }
        .davao_cloud_2 {
          animation: davao_cloud_billow_2 45s ease-in-out infinite;
        }
        .davao_wake {
          animation: davao_wake 2.4s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .davao_beam {
          animation: davao_beam 3.4s ease-in-out infinite;
        }
        .davao_lantern {
          animation: davao_lantern 3.4s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .davao_isl {
          cursor: pointer;
        }
        @media (prefers-reduced-motion: reduce) {
          .davao_sun,
          .davao_sun_rays,
          .davao_morning_glitter,
          .davao_caustic_shimmer,
          .davao_ocean_swell_1,
          .davao_ocean_swell_2,
          .davao_ocean_swell_3,
          .davao_cirrus,
          .davao_cloud_1,
          .davao_cloud_2,
          .davao_wake,
          .davao_beam,
          .davao_lantern {
            animation: none;
          }
          .davao-map-lbl,
          .davao-map-card {
            transition: none;
          }
        }
      `}</style>

      <div className="davao-map-frame">
        <div className="davao-map-scene-wrap">
          <div className="davao-map-scene">
            <svg
              viewBox="0 0 1200 480"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label="Illustrated map of five islands in Davao Oriental connected by a dashed route, with an outrigger boat at the Sleeping Dinosaur."
            >
              <defs>
                {/* 1. Brilliant Tropical Morning Ocean Depth Gradient (Pacific Ocean & Pujada Bay) */}
                <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b548b" />
                  <stop offset="22%" stopColor="#084270" />
                  <stop offset="50%" stopColor="#062e52" />
                  <stop offset="80%" stopColor="#041f39" />
                  <stop offset="100%" stopColor="#021120" />
                </linearGradient>

                {/* 2. Radiant Morning Sky Gradient: Clear Azure Zenith to Golden Sunrise Horizon */}
                <linearGradient id="davaoSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e5cb3" />
                  <stop offset="30%" stopColor="#3b82f6" />
                  <stop offset="60%" stopColor="#60a5fa" />
                  <stop offset="82%" stopColor="#93c5fd" />
                  <stop offset="94%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>

                {/* 3. Golden Morning Horizon Mist & Atmospheric Glow */}
                <linearGradient id="davaoHorizonMist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0" />
                  <stop offset="45%" stopColor="#fed7aa" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#fef08a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>

                {/* 4. Morning Sun Radial Corona in the Eastern Sky */}
                <radialGradient id="morningSunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
                  <stop offset="25%" stopColor="#FEF08A" stopOpacity="0.9" />
                  <stop offset="55%" stopColor="#FDE047" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#FBBF24" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>

                {/* 5. Morning Sun Glitter / Specular Ocean Light Trail */}
                <linearGradient id="sunGlitterGrad" x1="1020" y1="120" x2="980" y2="480" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
                  <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
                </linearGradient>

                {/* 6. Realistic Volumetric Morning Cloud Gradients */}
                <radialGradient id="cloudPuffGrad" cx="50%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
                  <stop offset="35%" stopColor="#FEF9C3" stopOpacity="0.85" />
                  <stop offset="68%" stopColor="#FED7AA" stopOpacity="0.55" />
                  <stop offset="88%" stopColor="#BAE6FD" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="cloudBaseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#FED7AA" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.65" />
                </linearGradient>

                <linearGradient id="cirrusWispGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="48%" stopColor="#FEF08A" stopOpacity="0.65" />
                  <stop offset="82%" stopColor="#FFFFFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* 7. Caustic Water Shimmer Pattern */}
                <pattern id="causticPattern" width="48" height="22" patternUnits="userSpaceOnUse">
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

                <filter id="cloudBlur" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="4.5" />
                </filter>
                <filter id="cirrusBlur" x="-10%" y="-30%" width="120%" height="160%">
                  <feGaussianBlur stdDeviation="1.8" />
                </filter>

                <linearGradient id="forest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63c066" />
                  <stop offset=".55" stopColor="#2f8a4a" />
                  <stop offset="1" stopColor="#16553a" />
                </linearGradient>

                <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fffbe6" />
                  <stop offset="1" stopColor="#efd696" />
                </linearGradient>

                <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9aa5b6" />
                  <stop offset="1" stopColor="#474f61" />
                </linearGradient>

                <linearGradient id="cliff" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8794a8" />
                  <stop offset=".6" stopColor="#586275" />
                  <stop offset="1" stopColor="#394152" />
                </linearGradient>

                <radialGradient id="glow">
                  <stop offset="0" stopColor="#5aa8ff" stopOpacity=".42" />
                  <stop offset="1" stopColor="#5aa8ff" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="shallow">
                  <stop offset="0" stopColor="#8ceaf0" stopOpacity=".95" />
                  <stop offset=".7" stopColor="#43b2d4" stopOpacity=".8" />
                  <stop offset="1" stopColor="#2b86b3" stopOpacity="0" />
                </radialGradient>

                <filter id="blur9" x="-30%" y="-100%" width="160%" height="300%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
                <filter id="blur5" x="-10%" y="-100%" width="120%" height="300%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>

                <g id="palm"><g className="davao_palm_bend">
                  <path
                    d="M0 0 C3 -10 -1 -20 4 -30"
                    stroke="#8a5a2b"
                    strokeWidth="2.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <g className="davao_fronds" stroke="#2f9a4c" strokeWidth="2.6" fill="none" strokeLinecap="round">
                    <path d="M4 -30 C-6 -40 -18 -36 -24 -26" />
                    <path d="M4 -30 C-2 -44 10 -48 20 -42" />
                    <path d="M4 -30 C14 -38 26 -32 28 -22" />
                    <path d="M4 -30 C-10 -32 -20 -26 -26 -18" />
                    <path d="M4 -30 C16 -28 24 -22 26 -14" />
                  </g>
                </g></g>

                <path
                  id="dinoBody"
                  d="M-155 24 C-130 18 -105 6 -85 -10 C-65 -36 -28 -56 16 -54 C48 -52 70 -38 88 -22 C104 -36 128 -34 144 -20 C158 -8 164 10 152 22 C138 28 122 18 106 24 C68 32 18 34 -32 32 C-76 32 -118 30 -155 24Z"
                />
                <clipPath id="dinoClip">
                  <use href="#dinoBody" />
                </clipPath>
              </defs>

              {/* 1. Radiant Morning Sky (y: 0 to 135) */}
              <rect width="1200" height="135" fill="url(#davaoSkyGrad)" />

              {/* 2. Morning Sun in Eastern Sky (Pacific Ocean horizon, near x=1020, y=48) */}
              <g className="davao_sun" pointerEvents="none">
                {/* Sun Outer Halo */}
                <circle cx="1020" cy="48" r="75" fill="url(#morningSunGlow)" />
                {/* Sun Mid Corona */}
                <circle cx="1020" cy="48" r="38" fill="url(#morningSunGlow)" opacity="0.9" />
                {/* Sun Core Disk */}
                <circle cx="1020" cy="48" r="16" fill="#fffbeb" />
              </g>

              {/* Subtle Morning Sunbeams / God Rays */}
              <g className="davao_sun_rays" opacity="0.22" pointerEvents="none">
                <polygon points="1020,48 880,135 940,135" fill="url(#morningSunGlow)" />
                <polygon points="1020,48 980,135 1060,135" fill="url(#morningSunGlow)" />
                <polygon points="1020,48 1100,135 1180,135" fill="url(#morningSunGlow)" />
              </g>

              {/* 3. Realistic Tropical Morning Ocean Waters (y: 120 to 480) */}
              <rect y="120" width="1200" height="360" fill="url(#sea)" />

              {/* 4. Golden Morning Sun Glitter Path across water */}
              <polygon
                points="990,120 1050,120 1120,480 920,480"
                fill="url(#sunGlitterGrad)"
                className="davao_morning_glitter"
                pointerEvents="none"
              />

              {/* 5. Golden Horizon Atmospheric Mist */}
              <rect y="112" width="1200" height="28" fill="url(#davaoHorizonMist)" pointerEvents="none" />

              {/* 6. Realistic Animated Water Caustics Shimmer */}
              <rect
                y="120"
                width="1200"
                height="360"
                fill="url(#causticPattern)"
                className="davao_caustic_shimmer"
                pointerEvents="none"
              />

              {/* 7. Realistic Pacific Ocean Swell Wave Trains */}
              {/* Swell Wave Train 1: Deep Ocean Swell with authentic sinusoidal curvature */}
              <g className="davao_ocean_swell_1" opacity="0.4" pointerEvents="none">
                <path
                  d="M0 185 C 80 172, 160 196, 240 182 C 320 168, 400 194, 480 180 C 560 166, 640 192, 720 178 C 800 164, 880 190, 960 176 C 1040 162, 1120 188, 1200 174 L 1200 200 C 1120 210, 1040 188, 960 202 C 880 216, 800 194, 720 208 C 640 222, 560 200, 480 214 C 400 228, 320 206, 240 220 C 160 234, 80 212, 0 226 Z"
                  fill="#0369a1"
                />
                {/* Wave Crest 1 subtle highlight */}
                <path
                  d="M0 184 C 80 171, 160 195, 240 181 C 320 167, 400 193, 480 179 C 560 165, 640 191, 720 177 C 800 163, 880 189, 960 175 C 1040 161, 1120 187, 1200 173"
                  fill="none"
                  stroke="#7dd3fc"
                  strokeWidth="1.2"
                  opacity="0.38"
                />
              </g>

              {/* Swell Wave Train 2: Mid-Bay Rolling Waves with Glistening Foam Crests */}
              <g className="davao_ocean_swell_2" opacity="0.32" pointerEvents="none">
                <path
                  d="M0 295 C 90 282, 180 304, 270 290 C 360 276, 450 302, 540 288 C 630 274, 720 300, 810 286 C 900 272, 990 298, 1080 284 C 1140 276, 1180 292, 1200 286 L 1200 302 C 1180 308, 1140 292, 1080 298 C 990 312, 900 290, 810 304 C 720 318, 630 296, 540 310 C 450 324, 360 302, 270 316 C 180 330, 90 308, 0 322 Z"
                  fill="#0284c7"
                />
                {/* Wave Crest Highlights catching morning sunlight */}
                <path
                  d="M0 294 C 90 281, 180 303, 270 289 C 360 275, 450 301, 540 287 C 630 273, 720 299, 810 285 C 900 271, 990 297, 1080 283 C 1140 275, 1180 291, 1200 285"
                  fill="none"
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              </g>

              {/* Swell Wave Train 3: Nearshore Surface Wave Crests */}
              <g className="davao_ocean_swell_3" opacity="0.25" pointerEvents="none">
                <path
                  d="M0 405 C 100 394, 200 416, 300 404 C 400 392, 500 414, 600 402 C 700 390, 800 412, 900 400 C 1000 388, 1100 410, 1200 398 L 1200 410 C 1100 422, 1000 400, 900 412 C 800 424, 700 402, 600 414 C 500 426, 400 404, 300 416 C 200 428, 100 406, 0 418 Z"
                  fill="#38bdf8"
                />
                {/* Wave Crest 3 surface shimmer highlight */}
                <path
                  d="M0 404 C 100 393, 200 415, 300 403 C 400 391, 500 413, 600 401 C 700 389, 800 411, 900 399 C 1000 387, 1100 409, 1200 397"
                  fill="none"
                  stroke="#e0f2fe"
                  strokeWidth="1.2"
                  opacity="0.45"
                />
              </g>

              {/* 8. Ultra-Realistic Multi-Layered Morning Clouds */}
              {/* Layer A: High Wispy Cirrus Feathers (drifting slowly across the upper sky) */}
              <g className="davao_cirrus" filter="url(#cirrusBlur)" pointerEvents="none">
                <path
                  d="M 60,18 Q 180,12 310,17 Q 440,22 560,15"
                  fill="none"
                  stroke="url(#cirrusWispGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <path
                  d="M 220,24 Q 340,19 460,25 Q 580,31 700,22"
                  fill="none"
                  stroke="url(#cirrusWispGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                <path
                  d="M 680,16 Q 800,10 930,15 Q 1060,20 1160,14"
                  fill="none"
                  stroke="url(#cirrusWispGrad)"
                  strokeWidth="3.0"
                  strokeLinecap="round"
                  opacity="0.65"
                />
              </g>

              {/* Layer B: Volumetric Morning Cumulus Banks with Golden Sunlit Puffs (y=26-72) */}
              <g className="davao_cloud_1" filter="url(#cloudBlur)" pointerEvents="none">
                {/* West Cumulus Bank (Mati Mountain Ridge & Pujada Bay entrance) */}
                <g>
                  {/* Underside Atmospheric Base Shadow */}
                  <path
                    d="M 30,62 C 45,64 120,65 240,62 C 260,54 270,44 260,36 C 240,22 210,24 195,32 C 180,18 145,16 125,28 C 105,22 80,26 65,38 C 45,36 30,46 30,62 Z"
                    fill="url(#cloudBaseGradient)"
                  />
                  {/* Billowing Sunlit Cumulus Puffs */}
                  <ellipse cx="75" cy="46" rx="42" ry="18" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="120" cy="36" rx="52" ry="22" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="170" cy="40" rx="48" ry="20" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="215" cy="48" rx="40" ry="17" fill="url(#cloudPuffGrad)" />
                  {/* Top Highlight Rim catching eastern morning sun */}
                  <ellipse cx="128" cy="30" rx="36" ry="14" fill="#FFFFFF" opacity="0.6" />
                </g>

                {/* Central Bay Cumulus Bank */}
                <g>
                  <path
                    d="M 520,60 C 560,63 680,63 760,59 C 775,50 780,40 765,32 C 745,20 715,22 700,30 C 680,16 645,14 625,26 C 605,18 575,22 560,34 C 540,32 525,42 520,60 Z"
                    fill="url(#cloudBaseGradient)"
                  />
                  <ellipse cx="565" cy="44" rx="45" ry="18" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="625" cy="34" rx="55" ry="22" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="685" cy="38" rx="50" ry="20" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="735" cy="46" rx="38" ry="16" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="632" cy="28" rx="38" ry="14" fill="#FFFFFF" opacity="0.6" />
                </g>

                {/* East Sunrise Cumulus Bank (Rising from Pacific Ocean) */}
                <g opacity="0.85">
                  <path
                    d="M 1040,60 C 1070,62 1150,62 1195,58 C 1200,48 1195,38 1180,32 C 1160,20 1130,22 1115,28 C 1095,16 1065,18 1050,30 C 1035,36 1030,48 1040,60 Z"
                    fill="url(#cloudBaseGradient)"
                  />
                  <ellipse cx="1080" cy="42" rx="46" ry="18" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="1135" cy="34" rx="52" ry="20" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="1175" cy="42" rx="36" ry="16" fill="url(#cloudPuffGrad)" />
                </g>
              </g>

              {/* Layer C: Mid-Lower Coastal Sea-Breeze Vapor Clouds (y=44-78) */}
              <g className="davao_cloud_2" filter="url(#cloudBlur)" opacity="0.68" pointerEvents="none">
                <g>
                  <ellipse cx="360" cy="56" rx="65" ry="18" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="410" cy="48" rx="50" ry="16" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="460" cy="54" rx="58" ry="17" fill="url(#cloudPuffGrad)" />
                </g>
                <g>
                  <ellipse cx="880" cy="52" rx="72" ry="19" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="935" cy="45" rx="55" ry="17" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="985" cy="53" rx="48" ry="16" fill="url(#cloudPuffGrad)" />
                </g>
              </g>

              {/* Route: horizontal tangents at every island so it rolls like a wave */}
              <g id="route" fill="none" strokeLinecap="round" pointerEvents="none">
                {STATIC_ROUTE_SEGMENTS.map((seg, idx) => (
                  <React.Fragment key={`route-seg-${idx}`}>
                    <path
                      d={seg.d}
                      stroke={seg.color}
                      strokeWidth={10}
                      opacity={0.12}
                    />
                    <path
                      d={seg.d}
                      stroke={seg.color}
                      strokeWidth={4}
                      strokeDasharray="10 9"
                    />
                  </React.Fragment>
                ))}
              </g>

              {/* 1 · San Victor Island (Baganga): pristine teardrop islet based on real reference photo */}
              <g
                className="davao_isl"
                data-i="0"
                transform="translate(156,252) scale(1.05)"
                style={{ cursor: 'pointer' }}
                pointerEvents="all"
                onClick={() => goToIsland(0)}
              >
                {/* Generous invisible hit zone */}
                <ellipse rx="130" ry="70" fill="transparent" pointerEvents="all" />
                <ellipse rx="118" ry="60" fill="url(#glow)" />

                {/* Outer Pacific Coral Reef & Shallow Lagoon Shelf */}
                <ellipse rx="96" ry="48" fill="url(#shallow)" opacity=".85" />
                <ellipse rx="78" ry="38" fill="#5eead4" opacity=".25" />

                {/* Outer coral reef ring & white surf breakers */}
                <path
                  d="M-82 12 C-88 -12 -54 -38 0 -40 C56 -42 90 -16 84 14 C76 36 28 44 -12 42 C-52 40 -76 30 -82 12Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  strokeOpacity=".45"
                  strokeDasharray="4 3"
                />

                {/* Floating Sanctuary Marker Buoy (on far-left water as in reference image) */}
                <g transform="translate(-86, 18) scale(0.85)">
                  <ellipse cx="0" cy="4" rx="6" ry="2.5" fill="#0284c7" opacity=".4" />
                  <rect x="-3" y="-1" width="6" height="5" fill="#f8fafc" rx="1" />
                  <polygon points="-4,-1 4,-1 0,-6" fill="#ef4444" />
                  <line x1="0" y1="-6" x2="0" y2="-10" stroke="#f8fafc" strokeWidth="1" />
                  <circle cx="0" cy="-10" r="1.5" fill="#f59e0b" />
                </g>

                {/* Anchored Small Philippine Bangka in the Turquoise Shallows (as in aerial reference) */}
                <g transform="translate(56, 26) scale(0.68) rotate(-14)">
                  {/* Boat shadow in crystal water */}
                  <ellipse cx="0" cy="3" rx="14" ry="4" fill="#0f766e" opacity=".35" />
                  {/* Outrigger Katig (Bamboo floats) */}
                  <line x1="-15" y1="-8" x2="15" y2="-8" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="-15" y1="8" x2="15" y2="8" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Crossbeams (Tadlak) */}
                  <line x1="-6" y1="-8" x2="-6" y2="8" stroke="#78350f" strokeWidth="1.2" />
                  <line x1="6" y1="-8" x2="6" y2="8" stroke="#78350f" strokeWidth="1.2" />
                  {/* Wooden Hull */}
                  <path d="M-16 0 C-12 -3 12 -3 16 0 C12 3 -12 3 -16 0Z" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />
                  {/* Blue Sun Canopy */}
                  <rect x="-8" y="-2.5" width="16" height="5" rx="1.5" fill="#0284c7" />
                </g>

                {/* Giant Clams (Taklobo) submerged in the transparent lagoon */}
                <g transform="translate(-48, 28) scale(0.55)">
                  <path d="M 0,0 Q 5,-7 10,0 Q 15,-7 20,0 Q 10,9 0,0 Z" fill="#0d9488" stroke="#5eead4" strokeWidth="1.2" />
                  <circle cx="10" cy="0" r="2" fill="#6ee7b7" />
                </g>

                {/* Wide, Sweeping White Coral Sand Beach (exact shape from drone aerial photo) */}
                <path
                  d="M-64 16 C-68 -10 -38 -30 4 -32 C48 -34 68 -12 66 12 C64 28 36 34 0 34 C-36 34 -60 28 -64 16Z"
                  fill="url(#sand)"
                />
                {/* Sunlit powdery upper sandbar zone */}
                <path
                  d="M-52 14 C-55 -4 -28 -20 2 -22 C36 -24 54 -6 52 10 C50 22 26 27 -2 27 C-30 27 -48 22 -52 14Z"
                  fill="#fff8e7"
                  opacity=".75"
                />

                {/* Nestled White Beach Cottages / Picnic Sheds under tree canopy (from reference) */}
                <g transform="translate(-32, 6)">
                  <rect x="-4" y="-2" width="8" height="5" fill="#f8fafc" rx="0.8" />
                  <polygon points="-5,-2 5,-2 0,-6" fill="#b45309" />
                </g>
                <g transform="translate(-18, 10)">
                  <rect x="-3.5" y="-2" width="7" height="4.5" fill="#f8fafc" rx="0.8" />
                  <polygon points="-4.5,-2 4.5,-2 0,-5" fill="#b45309" />
                </g>

                {/* Dense Tropical Forest Island Core (Dome-shaped canopy from reference photo) */}
                <path
                  d="M-44 8 C-46 -14 -24 -36 6 -36 C34 -36 50 -16 46 6 C42 16 18 20 -4 20 C-26 20 -42 16 -44 8Z"
                  fill="url(#forest)"
                />

                {/* Layered Rich Jungle Tree Canopies (Broadleaf forest bumps) */}
                <g fill="#166534" opacity=".8">
                  <ellipse cx="-28" cy="2" rx="11" ry="8" />
                  <ellipse cx="-12" cy="-12" rx="13" ry="9" />
                  <ellipse cx="6" cy="-18" rx="14" ry="10" />
                  <ellipse cx="26" cy="-8" rx="12" ry="8" />
                  <ellipse cx="34" cy="4" rx="10" ry="7" />
                  <ellipse cx="14" cy="6" rx="13" ry="8" />
                  <ellipse cx="-8" cy="8" rx="12" ry="7" />
                </g>
                {/* Lighter sunlit foliage highlights on the canopy crest */}
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

                {/* Distinctive Lone Tall Coconut Palm (Prominent feature in reference image 1 rising above center-right) */}
                <g transform="translate(6, -26)"><g className="davao_palm_bend">
                  {/* Tall curved slender trunk */}
                  <path
                    d="M0 8 C1 -6 3 -16 2 -26"
                    stroke="#78350f"
                    strokeWidth="2.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Palm fronds crowning the tall palm */}
                  <g className="davao_fronds" stroke="#15803d" strokeWidth="2.2" fill="none" strokeLinecap="round">
                    <path d="M2 -26 C-7 -34 -15 -30 -18 -22" />
                    <path d="M2 -26 C-2 -37 7 -40 14 -35" />
                    <path d="M2 -26 C11 -33 19 -28 20 -19" />
                    <path d="M2 -26 C-8 -26 -14 -20 -17 -13" />
                    <path d="M2 -26 C12 -23 18 -18 19 -11" />
                  </g>
                  <circle cx="2" cy="-26" r="2.2" fill="#854d0e" />
                </g></g>

                {/* Companion Palm on the Left Slope */}
                <use className="davao_palm_instance" href="#palm" transform="translate(-24, -14) scale(0.9)" />
                {/* Companion Palm on the Far-Right Edge */}
                <use className="davao_palm_instance" href="#palm" transform="translate(28, -6) scale(0.75)" />

                {/* Gentle Shoreline Water Wash / Gentle Surf Lapping on the Sand */}
                <path
                  d="M-58 18 C-36 28 0 28 36 24 C54 22 62 14 62 10"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity=".7"
                />
              </g>

              {/* 2 · Oak Island: pristine pure vanishing sandbar in turquoise lagoon (no grass, no trees, no hut) */}
              <g
                className="davao_isl"
                data-i="1"
                transform="translate(345,172)"
                style={{ cursor: 'pointer' }}
                pointerEvents="all"
                onClick={() => goToIsland(1)}
              >
                {/* Generous invisible hit zone */}
                <ellipse rx="110" ry="54" fill="transparent" pointerEvents="all" />
                <ellipse rx="104" ry="48" fill="url(#glow)" opacity=".7" />
                <ellipse rx="82" ry="36" fill="url(#shallow)" />
                <ellipse rx="62" ry="25" fill="#9bf0f4" opacity=".28" />
                <g fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.2">
                  <ellipse rx="72" ry="30" />
                  <ellipse rx="52" ry="21" />
                </g>
                {/* Pristine Vanishing Sandbar (pure coral sand, zero vegetation or structures) */}
                <path
                  d="M-52 6 C-46 -12 -6 -18 32 -9 C58 -4 62 9 44 16 C12 24 -42 22 -52 6Z"
                  fill="url(#sand)"
                />
                {/* Sunlit ivory sand dune ridge */}
                <path
                  d="M-40 4 C-35 -7 -4 -12 26 -6 C46 -2 48 6 34 11 C10 17 -32 16 -40 4Z"
                  fill="#fff8e7"
                  opacity=".7"
                />
                {/* Soft coral sand ripple lines */}
                <path
                  d="M-28 6 C-14 3 6 4 20 8 M-15 11 C-4 9 10 10 18 13"
                  stroke="#dfc08b"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity=".55"
                />
              </g>

              {/* 3 · Waniban Island: low sand spit, small grove, coral-shallow ring */}
              <g
                className="davao_isl"
                data-i="2"
                transform="translate(556,236)"
                style={{ cursor: 'pointer' }}
                pointerEvents="all"
                onClick={() => goToIsland(2)}
              >
                {/* Generous invisible hit zone */}
                <ellipse rx="130" ry="55" fill="transparent" pointerEvents="all" />
                <ellipse rx="120" ry="50" fill="url(#glow)" />
                <path
                  d="M-84 6 C-82 -22 -30 -34 24 -30 C74 -26 112 -4 120 10 C100 30 -50 40 -84 6Z"
                  fill="url(#shallow)"
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
                  fill="url(#sand)"
                />
                <path
                  d="M-54 4 C-54 -12 -36 -22 -20 -16 C-6 -14 0 -4 -2 4 C-20 10 -44 10 -54 4Z"
                  fill="url(#forest)"
                />
                <g fill="#1d6a3a" opacity=".5">
                  <circle cx="-38" cy="-2" r="4" />
                  <circle cx="-18" cy="-4" r="4" />
                </g>
                <use className="davao_palm_instance" href="#palm" transform="translate(-34,-4) scale(.9)" />
                <use className="davao_palm_instance" href="#palm" transform="translate(-14,-2) scale(.72)" />
              </g>

              {/* 4 · Pujada Island: big forested hills, curving white beach */}
              <g
                className="davao_isl"
                data-i="3"
                transform="translate(760,165) scale(1.05)"
                style={{ cursor: 'pointer' }}
                pointerEvents="all"
                onClick={() => goToIsland(3)}
              >
                {/* Generous invisible hit zone */}
                <ellipse rx="145" ry="70" fill="transparent" pointerEvents="all" />
                <ellipse rx="135" ry="64" fill="url(#glow)" />
                <path
                  d="M-100 12 C-98 -30 -30 -46 40 -38 C98 -30 118 6 96 32 C60 56 -64 58 -100 12Z"
                  fill="url(#shallow)"
                  opacity=".7"
                />
                <path
                  d="M-84 12 C-82 -14 -30 -24 22 -20 C72 -16 96 -2 92 16 C72 36 -52 40 -84 12Z"
                  fill="url(#sand)"
                />
                <path
                  d="M-72 8 C-68 -22 -46 -40 -16 -38 C-2 -50 28 -46 40 -26 C62 -24 76 -8 68 10 C40 22 -42 24 -72 8Z"
                  fill="url(#forest)"
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
                <use className="davao_palm_instance" href="#palm" transform="translate(-26,-26) scale(1.1)" />
                <use className="davao_palm_instance" href="#palm" transform="translate(12,-32) scale(1)" />
                <use className="davao_palm_instance" href="#palm" transform="translate(40,-14) scale(.8)" />
              </g>

              {/* 5 · Sleeping Dinosaur (Badas, Mati City): recreated based on real landmark headland */}
              <g
                className="davao_isl"
                data-i="4"
                transform="translate(980,210) scale(0.9)"
                style={{ cursor: 'pointer' }}
                pointerEvents="all"
                onClick={() => goToIsland(4)}
              >
                {/* Generous invisible hit zone */}
                <ellipse rx="175" ry="70" fill="transparent" pointerEvents="all" />
                <ellipse rx="160" ry="62" fill="url(#glow)" />
                <ellipse cx="0" cy="22" rx="145" ry="22" fill="url(#shallow)" opacity=".6" />
                <use href="#dinoBody" fill="url(#forest)" />
                <g clipPath="url(#dinoClip)">
                  {/* Layered deep forest canopy and hillside shadows */}
                  <g fill="#124823" opacity=".65">
                    <ellipse cx="-110" cy="4" rx="14" ry="9" />
                    <ellipse cx="-85" cy="-8" rx="16" ry="11" />
                    <ellipse cx="-55" cy="-22" rx="16" ry="12" />
                    <ellipse cx="-20" cy="-36" rx="18" ry="13" />
                    <ellipse cx="14" cy="-38" rx="18" ry="13" />
                    <ellipse cx="50" cy="-28" rx="16" ry="12" />
                    <ellipse cx="82" cy="-14" rx="14" ry="10" />
                    <ellipse cx="112" cy="-20" rx="14" ry="10" />
                    <ellipse cx="138" cy="-8" rx="12" ry="8" />
                  </g>
                  {/* Vibrant tropical midtone ridges */}
                  <g fill="#1e7b3f" opacity=".75">
                    <ellipse cx="-70" cy="-18" rx="12" ry="8" />
                    <ellipse cx="-35" cy="-38" rx="14" ry="9" />
                    <ellipse cx="0" cy="-44" rx="15" ry="10" />
                    <ellipse cx="32" cy="-40" rx="14" ry="9" />
                    <ellipse cx="65" cy="-26" rx="12" ry="8" />
                    <ellipse cx="122" cy="-24" rx="11" ry="7" />
                  </g>
                  {/* Sunlit crest highlights along the highest spine */}
                  <g fill="#86efac" opacity=".45">
                    <ellipse cx="-25" cy="-48" rx="18" ry="4" />
                    <ellipse cx="12" cy="-52" rx="20" ry="4" />
                    <ellipse cx="128" cy="-30" rx="14" ry="4" />
                  </g>
                  {/* Coastal ochre & clay sandstone cliffs along the bay waterline */}
                  <path
                    d="M-160 16 C-110 8 -40 14 20 8 C65 6 110 14 160 8 L160 40 L-160 40Z"
                    fill="url(#rock)"
                    opacity=".95"
                  />
                  {/* Cliff rock striations */}
                  <path
                    d="M-120 22 L-118 36 M-70 20 L-68 34 M0 22 L2 35 M60 20 L62 34 M110 22 L112 33"
                    stroke="#5a2e12"
                    strokeWidth="1.2"
                    strokeOpacity=".4"
                  />
                </g>
                {/* Coastal white surf breakers along the entire base */}
                <path
                  d="M-145 26 C-80 32 -10 36 60 32 C105 28 135 14 154 8"
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                  opacity=".8"
                />
                {/* Sandy cove at snout tip touching the bay */}
                <ellipse cx="148" cy="18" rx="14" ry="4" fill="url(#sand)" />
                {/* Sleeping dinosaur resting eye contour */}
                <path
                  d="M126 -16 q6 4 12 0"
                  stroke="#0a2a16"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Subtle resting nostril dip */}
                <ellipse cx="150" cy="14" rx="3.5" ry="2" fill="#0d3b1e" opacity=".6" />
              </g>

              {/* Piers + anchors */}
              <g id="piers">
                {islands.map((s, i) => {
                  const len = s.ay - s.by;
                  const ys = len > 30 ? [s.by + len * 0.35, s.by + len * 0.65] : [s.by + len * 0.5];
                  return (
                    <g
                      key={`pier-${i}`}
                      style={{ cursor: 'pointer' }}
                      pointerEvents="all"
                      onClick={() => goToIsland(i)}
                      stroke="#8a5028"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    >
                      <path d={`M${s.ax} ${s.by - 6} L${s.ax} ${s.ay}`} />
                      {ys.map((y, yi) => (
                        <path
                          key={`pegs-${i}-${yi}`}
                          d={`M${s.ax - 6} ${y} L${s.ax + 6} ${y}`}
                          strokeWidth="2.4"
                        />
                      ))}
                    </g>
                  );
                })}
              </g>

              {/* Rings */}
              <g id="rings">
                {islands.map((s, i) => {
                  const on = i === activeIndex;
                  return (
                    <g
                      key={`ring-${i}`}
                      style={{ cursor: 'pointer' }}
                      pointerEvents="all"
                      onClick={() => goToIsland(i)}
                    >
                      <circle
                        cx={s.ax}
                        cy={s.ay}
                        r="11"
                        fill="#0b1c3e"
                        fillOpacity=".55"
                        stroke="#7fb2ff"
                        strokeOpacity=".5"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={s.ax}
                        cy={s.ay}
                        r="4"
                        fill={on ? '#f5b82e' : '#5aa8ff'}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Boat with outrigger floats, colorful sail, bobbing and wake */}
              <g
                id="boat"
                pointerEvents="none"
                transform={`translate(${boatPos.x.toFixed(1)},${boatPos.y.toFixed(1)})`}
              >
                <g transform={heading === 'west' ? 'scale(-1, 1)' : undefined}>
                  {Math.abs(currentDist - (STATIC_CUM_LENGTHS[activeIndex] ?? 0)) > 0.5 && (
                    <g transform="translate(-24, 5)">
                      <path className="davao_wake" d="M0 0 Q-12 -5 -34 -5 M0 0 Q-12 5 -34 5"
                        fill="none" stroke="#bfe3ff" strokeWidth="1.4" strokeLinecap="round" />
                    </g>
                  )}
                  <IslandBoat />
                </g>
              </g>
            </svg>

            {/* Labels */}
            <div id="labels">
              {islands.map((s, i) => {
                const on = i === activeIndex;
                return (
                  <button
                    key={`lbl-${s.id}`}
                    type="button"
                    className="davao-map-lbl"
                    aria-pressed={on}
                    style={{ left: `${s.lx / 12}%`, top: `${s.ly / 4.8}%` }}
                    onClick={() => goToIsland(i)}
                    aria-label={`${s.name}, ${s.place}`}
                  >
                    {s.label}
                    {s.badgeText && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white/20">
                        {s.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Caption in the open water */}
            <div className="davao-map-caption" aria-live="polite">
              <strong>
                {activeIsland.name} · {activeIsland.place}
              </strong>
              <span>{activeIsland.note}</span>
            </div>
          </div>
        </div>

        {/* Cards along bottom */}
        {showCards && (
          <div className="davao-map-cards">
            {islands.map((s, i) => {
              const on = i === activeIndex;
              return (
                <button
                  key={`card-${s.id}`}
                  type="button"
                  className="davao-map-card"
                  aria-pressed={on}
                  onClick={() => goToIsland(i)}
                >
                  <span className="tag flex items-center justify-between">
                    <span>{s.tag}</span>
                    {s.badgeText && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          s.badgeType === 'warning'
                            ? 'bg-amber-400/20 text-amber-300'
                            : s.badgeType === 'success'
                            ? 'bg-emerald-400/20 text-emerald-300'
                            : 'bg-sky-400/20 text-sky-300'
                        }`}
                      >
                        {s.badgeText}
                      </span>
                    )}
                  </span>
                  <span className="name">{s.name}</span>
                  <span className="place">{s.place}</span>
                  <span className="dot" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
