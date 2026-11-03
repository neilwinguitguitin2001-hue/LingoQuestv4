import React, { useEffect, useState } from 'react';
import {
  Anchor,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface IslandStation {
  id: string;
  quarterLabel: string;
  name: string;
  municipality: string;
  tagline: string;
  realLifeGeography: string;
  curriculumFocus: string;
  depEdCompetencies: string[];
  landmark: string;
  dockX: number;
  dockY: number;
  approachAngle: number;
}

const ARCHIPELAGO_STATIONS: IslandStation[] = [
  {
    id: 'q1-san-victor',
    quarterLabel: 'Quarter 1',
    name: 'San Victor Island',
    municipality: 'Baganga, Davao Oriental',
    tagline: 'Pacific Gem & Giant Clam Sanctuary',
    realLifeGeography:
      'A 3-hectare lush tropical islet off Baganga facing the Pacific Ocean, famous for towering palms, powdery coral sand, and a marine reserve preserving living Giant Clams (Taklobo).',
    curriculumFocus: 'Grammar Foundations, Viewing Genres, Voice & Tenses (10 Comprehensive Modules)',
    depEdCompetencies: [
      'Analogies, Synonyms, Antonyms, and Relational Logic',
      'Genres of Viewing: Documentaries, News, Internet, Movie Clips',
      'Active and Passive Voice transformations in historical texts',
      'Simple Past & Past Perfect Tenses in regional folk narratives',
      'Direct vs. Reported Speech in local oral and cultural traditions',
      'Using Phrases, Clauses, Sentences & Reading Styles appropriately',
    ],
    landmark: 'San Victor Marine Reserve (Baganga Coast)',
    dockX: 135,
    dockY: 260,
    approachAngle: 12,
  },
  {
    id: 'q2-oak',
    quarterLabel: 'Quarter 2',
    name: 'Oak Island',
    municipality: 'Mati City, Davao Oriental',
    tagline: 'The Legendary Vanishing Sandbar',
    realLifeGeography:
      'A true tidal wonder in Pujada Bay that submerges beneath high tide and emerges at low tide as a sweeping, pure-white sandbar with rippled tidal flats and crystal clear waters.',
    curriculumFocus: 'Modals, Syntax & Expository Texts',
    depEdCompetencies: [
      'Modal verbs of ability, obligation, and necessity',
      'Transition markers and sentence connectors in expository prose',
      'Fact vs. opinion in marine conservation essays',
      'Restoring the living coral reef knowledge bridge',
    ],
    landmark: 'Pujada Bay Shifting Sandbar',
    dockX: 295,
    dockY: 175,
    approachAngle: -18,
  },
  {
    id: 'q3-waniban',
    quarterLabel: 'Quarter 3',
    name: 'Waniban Island',
    municipality: 'Mati City, Davao Oriental',
    tagline: '4-Hectare Coral White-Sand Cay',
    realLifeGeography:
      'A low-lying coral cay featuring a dense central copse of coconut palms and a sweeping white coralline sandbar reaching out into radiant, crystal-clear aqua waters.',
    curriculumFocus: 'Literary Devices, Sensory Imagery & Modifiers',
    depEdCompetencies: [
      'Identifying metaphor, personification & sensory imagery',
      'Adverbial clauses and participial modifiers in descriptive texts',
      'Tone and mood analysis in Philippine poetry',
      'Securing the tide-shifted golden walkway bridge',
    ],
    landmark: 'Outer Pujada Bay Marine Sanctuary',
    dockX: 475,
    dockY: 285,
    approachAngle: 22,
  },
  {
    id: 'q4-pujada',
    quarterLabel: 'Quarter 4',
    name: 'Pujada Island',
    municipality: 'Mati City, Davao Oriental',
    tagline: '156-Hectare Gem of Pujada Bay',
    realLifeGeography:
      'An expansive, elongated emerald island with rolling forested ridges, pristine white sand coastlines, and a famous curving sand spit surrounded by turquoise lagoon shallows.',
    curriculumFocus: 'Persuasive Rhetoric, Debate & Research Synthesis',
    depEdCompetencies: [
      'Formulating claims of fact, value, and policy',
      'Evaluating author bias, credibility & source validity',
      'Synthesizing evidence across multi-genre research texts',
      'Completing the grand Pacific arching division bridge',
    ],
    landmark: 'Pujada Bay Protected Seascape',
    dockX: 645,
    dockY: 170,
    approachAngle: -14,
  },
  {
    id: 'milestone-dinosaur',
    quarterLabel: 'Discovery',
    name: 'Sleeping Dinosaur',
    municipality: 'Badas, Mati City Peninsula',
    tagline: 'Iconic Coastline Promontory of Pujada Bay',
    realLifeGeography:
      'A world-renowned natural peninsula in Badas that mirrors the exact silhouette of a giant sleeping dinosaur lying across the azure bay with head, curved neck, and ridged back.',
    curriculumFocus: 'Diagnostic Vocabulary & Picture Quests',
    depEdCompetencies: [
      'Contextual vocabulary picture identification',
      'Idiomatic expressions & regional word etymology',
      'Fast-paced antonym/synonym challenge bridges',
      'Mastering the ancient dinosaur ridge discovery challenge',
    ],
    landmark: 'Badas Coastal Mountain Formation',
    dockX: 810,
    dockY: 285,
    approachAngle: 16,
  },
];

export const CurriculumArchipelagoSection: React.FC = () => {
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0);
  const [isAutoCruising, setIsAutoCruising] = useState<boolean>(true);
  const [boatPosition, setBoatPosition] = useState<{ x: number; y: number; angle: number }>({
    x: ARCHIPELAGO_STATIONS[0].dockX,
    y: ARCHIPELAGO_STATIONS[0].dockY,
    angle: ARCHIPELAGO_STATIONS[0].approachAngle,
  });
  const [isSailing, setIsSailing] = useState<boolean>(false);
  const activeStation = ARCHIPELAGO_STATIONS[selectedStationIndex];

  // Auto-cruising: cruise to next island station every 7.5 seconds
  useEffect(() => {
    if (!isAutoCruising) return;
    const interval = setInterval(() => {
      setSelectedStationIndex((prev) => (prev + 1) % ARCHIPELAGO_STATIONS.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [isAutoCruising]);

  // Smoothly sail boat when station changes
  useEffect(() => {
    setIsSailing(true);
    const target = ARCHIPELAGO_STATIONS[selectedStationIndex];

    const timer = setTimeout(() => {
      setBoatPosition({
        x: target.dockX,
        y: target.dockY,
        angle: target.approachAngle,
      });

      const arrivalTimer = setTimeout(() => {
        setIsSailing(false);
      }, 1600);
      return () => clearTimeout(arrivalTimer);
    }, 40);

    return () => clearTimeout(timer);
  }, [selectedStationIndex]);

  const handleSelectStation = (index: number) => {
    soundFX.playClick();
    setSelectedStationIndex(index);
  };

  const handleNextStation = () => {
    soundFX.playClick();
    setSelectedStationIndex((prev) => (prev + 1) % ARCHIPELAGO_STATIONS.length);
  };

  const handlePrevStation = () => {
    soundFX.playClick();
    setSelectedStationIndex((prev) =>
      prev === 0 ? ARCHIPELAGO_STATIONS.length - 1 : prev - 1
    );
  };

  return (
    <section className="relative z-10 w-full border-t border-[#123158] bg-gradient-to-b from-[#051326] via-[#061833] to-[#040E1D] py-10 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Subtle Nautical Chart Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E4976_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Section Header: Clean unboxed typography per design constitution */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>DepEd Schools Division of Davao Oriental</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                6 Authentic Coastal Landmarks
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              The Davao Oriental Curriculum Archipelago
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore true-to-life geographic depictions of Davao Oriental&apos;s famous islands—from the lush rolling hills of Pujada Bay and the vanishing sandbars of Oak Island to the Sleeping Dinosaur peninsula and San Victor&apos;s Pacific marine sanctuary.
            </p>
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrevStation}
              title="Sail to Previous Island"
              className="p-2.5 rounded-xl bg-[#08203E] hover:bg-[#0D2D56] border border-[#1A4172] text-slate-300 hover:text-white transition shadow-sm"
              aria-label="Previous Island"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setIsAutoCruising(!isAutoCruising);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition shadow-sm ${
                isAutoCruising
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/40 hover:bg-sky-500/30'
                  : 'bg-[#08203E] text-slate-300 border-[#1A4172] hover:bg-[#0D2D56]'
              }`}
            >
              {isAutoCruising ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-sky-400" />
                  <span>Auto-Cruise: Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Cruise: Paused</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNextStation}
              title="Sail to Next Island"
              className="p-2.5 rounded-xl bg-[#08203E] hover:bg-[#0D2D56] border border-[#1A4172] text-slate-300 hover:text-white transition shadow-sm"
              aria-label="Next Island"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Realistic Archipelago Canvas */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#082142] via-[#051A36] to-[#031024] border border-[#183E6C] shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Subtle Coastal Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-teal-400 to-amber-400 opacity-70" />

          {/* Canvas SVG Container */}
          <div className="relative w-full aspect-[21/9] min-h-[350px] max-h-[500px]">
            <svg
              viewBox="0 0 1040 390"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Realistic topographical map of Davao Oriental Curriculum Archipelago"
            >
              <defs>
                {/* 1. Deep Pacific Ocean & Pujada Bay Depth Gradient */}
                <linearGradient id="realOceanGradient" x1="0" y1="0" x2="0" y2="390" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0b548b" />
                  <stop offset="22%" stopColor="#084270" />
                  <stop offset="50%" stopColor="#062e52" />
                  <stop offset="80%" stopColor="#041f39" />
                  <stop offset="100%" stopColor="#021120" />
                </linearGradient>

                {/* Morning Sky Atmosphere Gradient */}
                <linearGradient id="morningSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e5cb3" />
                  <stop offset="30%" stopColor="#3b82f6" />
                  <stop offset="60%" stopColor="#60a5fa" />
                  <stop offset="82%" stopColor="#93c5fd" />
                  <stop offset="94%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>

                {/* Morning Horizon Mist */}
                <linearGradient id="morningHorizonMist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0" />
                  <stop offset="45%" stopColor="#fed7aa" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#fef08a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>

                {/* Morning Sun Radial Corona in the Eastern Sky */}
                <radialGradient id="morningSunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
                  <stop offset="25%" stopColor="#FEF08A" stopOpacity="0.9" />
                  <stop offset="55%" stopColor="#FDE047" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#FBBF24" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>

                {/* Morning Sun Specular Ocean Glitter Trail */}
                <linearGradient id="morningGlitterGrad" x1="880" y1="100" x2="840" y2="390" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
                  <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
                </linearGradient>

                {/* 2. Shallow Coral Reef Aqua Halo */}
                <radialGradient id="coralLagoonHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#0284C7" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
                </radialGradient>

                {/* 3. Pure White/Gold Sand Gradient for authentic Philippine beaches */}
                <linearGradient id="phBeachSand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="60%" stopColor="#FEF3C7" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>

                {/* 4. Realistic Forest & Mountain Ridge Gradient */}
                <linearGradient id="islandJungleRidge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="25%" stopColor="#22C55E" />
                  <stop offset="65%" stopColor="#15803D" />
                  <stop offset="100%" stopColor="#14532D" />
                </linearGradient>

                {/* 5. Rocky Limestone Cliffs Gradient */}
                <linearGradient id="limestoneCliff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="40%" stopColor="#64748B" />
                  <stop offset="85%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>

                {/* 6. Soft Volumetric Morning Cloud Radial Gradient with Golden Underside Tint */}
                <radialGradient id="cloudPuffGrad" cx="50%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#FEF9C3" stopOpacity="0.75" />
                  <stop offset="75%" stopColor="#FED7AA" stopOpacity="0.45" />
                  <stop offset="90%" stopColor="#BAE6FD" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                </radialGradient>

                {/* 7. Caustic Water Shimmer Pattern */}
                <pattern id="causticPattern" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M0 10 Q10 5 20 10 T40 10"
                    fill="none"
                    stroke="#7DD3FC"
                    strokeWidth="0.9"
                    opacity="0.38"
                  />
                  <path
                    d="M10 15 Q20 8 30 15 T50 15"
                    fill="none"
                    stroke="#FEF08A"
                    strokeWidth="0.7"
                    opacity="0.25"
                  />
                </pattern>

                {/* 8. Nautical Course Gradient */}
                <linearGradient id="nauticalGoldenRoute" x1="0" y1="0" x2="1040" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="20%" stopColor="#2DD4BF" />
                  <stop offset="45%" stopColor="#FBBF24" />
                  <stop offset="70%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>

                {/* 9. Soft Glow for Boat & Anchors */}
                <filter id="softGlow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Radiant Morning Sky (y: 0 to 110) */}
              <rect width="1040" height="110" fill="url(#morningSkyGrad)" />

              {/* 2. Morning Sun in Eastern Sky (Pacific Ocean horizon, near x=880, y=38) */}
              <g className="animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}>
                <circle cx="880" cy="38" r="62" fill="url(#morningSunGlow)" />
                <circle cx="880" cy="38" r="30" fill="url(#morningSunGlow)" opacity="0.9" />
                <circle cx="880" cy="38" r="14" fill="#fffbeb" />
              </g>

              {/* Subtle Morning Sunbeams */}
              <g opacity="0.2" pointerEvents="none">
                <polygon points="880,38 760,110 810,110" fill="url(#morningSunGlow)" />
                <polygon points="880,38 850,110 910,110" fill="url(#morningSunGlow)" />
                <polygon points="880,38 950,110 1010,110" fill="url(#morningSunGlow)" />
              </g>

              {/* 3. Base Ocean Waters (y: 100 to 390) */}
              <rect y="100" width="1040" height="290" fill="url(#realOceanGradient)" />

              {/* 4. Golden Morning Sun Glitter Path across water */}
              <polygon
                points="850,100 910,100 970,390 800,390"
                fill="url(#morningGlitterGrad)"
                className="animate-pulse pointer-events-none"
                style={{ animationDuration: '6s' }}
              />

              {/* 5. Golden Horizon Atmospheric Mist */}
              <rect y="92" width="1040" height="24" fill="url(#morningHorizonMist)" pointerEvents="none" />

              {/* ======================================================== */}
              {/* REALISTIC ATMOSPHERIC CLOUDS (Multi-layered parallax)    */}
              {/* ======================================================== */}
              {/* Layer 1: High Wispy Atmospheric Clouds with Golden Highlights (Slow, 75s) */}
              <g className="animate-cloud-layer-1 pointer-events-none">
                <g opacity="0.75">
                  <ellipse cx="60" cy="38" rx="80" ry="20" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="100" cy="32" rx="55" ry="18" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="140" cy="40" rx="70" ry="22" fill="url(#cloudPuffGrad)" />
                </g>
                <g opacity="0.7">
                  <ellipse cx="580" cy="30" rx="90" ry="22" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="630" cy="24" rx="65" ry="19" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="680" cy="34" rx="75" ry="21" fill="url(#cloudPuffGrad)" />
                </g>
              </g>

              {/* Layer 2: Mid-Level Coastal Sea-Breeze Cumulus (50s) */}
              <g className="animate-cloud-layer-2 pointer-events-none">
                <g opacity="0.6">
                  <ellipse cx="320" cy="48" rx="65" ry="16" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="360" cy="42" rx="45" ry="15" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="400" cy="50" rx="55" ry="17" fill="url(#cloudPuffGrad)" />
                </g>
                <g opacity="0.62">
                  <ellipse cx="880" cy="44" rx="75" ry="18" fill="url(#cloudPuffGrad)" />
                  <ellipse cx="930" cy="38" rx="50" ry="16" fill="url(#cloudPuffGrad)" />
                </g>
              </g>

              {/* ======================================================== */}
              {/* REALISTIC OCEAN WATER SWELLS & CAUSTICS                  */}
              {/* Multi-layered organic swells with translucent crests     */}
              {/* ======================================================== */}
              {/* Deep Water Caustic Layer (simulates sun refraction on bay floor) */}
              <rect
                x="0"
                y="90"
                width="1040"
                height="300"
                fill="url(#causticPattern)"
                className="animate-caustic-shimmer pointer-events-none"
              />

              {/* Swell Layer 1: Background Deep Ocean Swell */}
              <g className="animate-ocean-swell pointer-events-none" opacity="0.38">
                <path
                  d="M0 160 C 90 148, 180 168, 270 156 C 360 144, 450 166, 540 154 C 630 142, 720 164, 810 152 C 900 140, 990 162, 1080 150 L 1080 175 C 990 185, 900 165, 810 178 C 720 190, 630 168, 540 180 C 450 192, 360 170, 270 182 C 180 194, 90 172, 0 185 Z"
                  fill="#0369A1"
                />
              </g>

              {/* Swell Layer 2: Mid-Level Wave Ribbons with Translucent Highlights */}
              <g className="animate-ocean-swell pointer-events-none" style={{ animationDuration: '11s', animationDirection: 'reverse' }} opacity="0.32">
                <path
                  d="M0 270 C 80 258, 160 276, 240 264 C 320 252, 400 274, 480 262 C 560 250, 640 272, 720 260 C 800 248, 880 270, 960 258 C 1000 252, 1040 266, 1080 260 L 1080 272 C 1040 278, 1000 265, 960 270 C 880 282, 800 260, 720 272 C 640 284, 560 262, 480 274 C 400 286, 320 264, 240 276 C 160 288, 80 270, 0 282 Z"
                  fill="#0284C7"
                />
                <path
                  d="M0 269 C 80 257, 160 275, 240 263 C 320 251, 400 273, 480 261 C 560 249, 640 271, 720 259 C 800 247, 880 269, 960 257 C 1000 251, 1040 265, 1080 259"
                  fill="none"
                  stroke="#E0F2FE"
                  strokeWidth="1.2"
                  opacity="0.45"
                />
              </g>

              {/* Golden Nautical Navigation Course */}
              {/* Foundation Shadow */}
              <path
                d="M 135,260 C 205,242 225,182 295,175 C 375,168 390,290 475,285 C 550,280 580,174 645,170 C 710,165 740,300 810,285 C 865,275 895,175 935,165"
                fill="none"
                stroke="#0284C7"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.25"
              />
              {/* Glowing Dashed Course */}
              <path
                d="M 135,260 C 205,242 225,182 295,175 C 375,168 390,290 475,285 C 550,280 580,174 645,170 C 710,165 740,300 810,285 C 865,275 895,175 935,165"
                fill="none"
                stroke="url(#nauticalGoldenRoute)"
                strokeWidth="3.5"
                strokeDasharray="9 7"
                strokeLinecap="round"
                className="animate-route-flow"
              />

              {/* Island Dock Anchorage Points */}
              {ARCHIPELAGO_STATIONS.map((st, i) => (
                <g key={`anchor-${st.id}`} className="pointer-events-none">
                  <circle
                    cx={st.dockX}
                    cy={st.dockY}
                    r={selectedStationIndex === i ? 6 : 4}
                    fill={selectedStationIndex === i ? '#F59E0B' : '#38BDF8'}
                    opacity={selectedStationIndex === i ? '1' : '0.65'}
                  />
                  <circle
                    cx={st.dockX}
                    cy={st.dockY}
                    r={10}
                    fill="none"
                    stroke={selectedStationIndex === i ? '#F59E0B' : '#38BDF8'}
                    strokeWidth="1.2"
                    opacity={selectedStationIndex === i ? '0.7' : '0.25'}
                  />
                </g>
              ))}

              {/* ======================================================== */}
              {/* 1. PUJADA ISLAND (Q1 - Mati City)                        */}
              {/* True-to-life: 156-hectare elongated lush island in bay,  */}
              {/* rolling emerald forested hills, white sand coastline,    */}
              {/* and signature curving sand spit into turquoise shallows  */}
              {/* ======================================================== */}
              {/* ======================================================== */}
              {/* 1. SAN VICTOR ISLAND (Q1 - Baganga Pacific Sanctuary)    */}
              {/* True-to-life: Pristine teardrop coral cay, giant clams,  */}
              {/* white beach, and dense canopy with tall coconut palm     */}
              {/* ======================================================== */}
              <g
                className="cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
                onClick={() => handleSelectStation(0)}
                role="button"
                tabIndex={0}
                aria-label="Quarter 1: San Victor Island"
              >
                {/* Pacific Coral Reef Shelf Halo */}
                <ellipse cx="135" cy="205" rx="64" ry="30" fill="url(#coralLagoonHalo)" />
                {/* Pacific Shoreline Wash */}
                <ellipse cx="135" cy="205" rx="54" ry="24" fill="#22D3EE" opacity="0.3" className="animate-shore-wash" />

                {/* Submerged Giant Clams (Taklobo) in the Marine Sanctuary */}
                <g transform="translate(105, 218) scale(0.65)">
                  <path d="M 0,0 Q 6,-8 12,0 Q 18,-8 24,0 Q 12,12 0,0 Z" fill="#0D9488" stroke="#5EEAD4" strokeWidth="1" />
                  <circle cx="12" cy="0" r="2" fill="#6EE7B7" />
                </g>
                <g transform="translate(158, 216) scale(0.55)">
                  <path d="M 0,0 Q 5,-7 10,0 Q 15,-7 20,0 Q 10,10 0,0 Z" fill="#7C3AED" stroke="#C084FC" strokeWidth="1" />
                </g>

                {/* White Coral Sand Coastline */}
                <path
                  d="M 102,205 C 110,187 145,183 168,195 C 180,203 182,213 174,221 C 155,227 120,225 105,217 C 98,213 98,209 102,205 Z"
                  fill="url(#phBeachSand)"
                  stroke="#FCD34D"
                  strokeWidth="0.8"
                />

                {/* Dense Baganga Jungle Canopy */}
                <path
                  d="M 108,203 C 115,177 145,173 164,187 C 175,195 172,211 162,217 C 145,223 120,221 108,203 Z"
                  fill="url(#islandJungleRidge)"
                />
                <circle cx="136" cy="195" r="14" fill="#15803D" />

                {/* Towering Palms */}
                <path d="M 130,193 C 134,177 136,163 130,153" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <g className="animate-frond-flutter-1" style={{ transformOrigin: '130px 153px' }}>
                  <path d="M 130,153 Q 116,145 108,155" stroke="#16A34A" strokeWidth="1.8" fill="none" />
                  <path d="M 130,153 Q 144,143 152,153" stroke="#22C55E" strokeWidth="1.8" fill="none" />
                </g>

                <path d="M 144,197 C 140,183 138,171 142,161" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <g className="animate-frond-flutter-2" style={{ transformOrigin: '142px 161px' }}>
                  <path d="M 142,161 Q 130,155 124,163" stroke="#15803D" strokeWidth="1.5" fill="none" />
                  <path d="M 142,161 Q 152,153 160,161" stroke="#4ADE80" strokeWidth="1.5" fill="none" />
                </g>

                {/* San Victor Wooden Marine Dock */}
                <line x1="132" y1="215" x2="135" y2="258" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="128" y1="228" x2="138" y2="228" stroke="#B45309" strokeWidth="1.5" />
                <line x1="130" y1="242" x2="140" y2="242" stroke="#B45309" strokeWidth="1.5" />

                {/* Island Label Marker */}
                <g transform="translate(135, 126)">
                  <rect
                    x="-50"
                    y="-13"
                    width="100"
                    height="26"
                    rx="13"
                    fill={selectedStationIndex === 0 ? '#0284C7' : '#071F3C'}
                    stroke={selectedStationIndex === 0 ? '#38BDF8' : '#1E4976'}
                    strokeWidth="1.5"
                    className="shadow-lg transition-colors"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">
                    Q1 · San Victor
                  </text>
                </g>
              </g>

              {/* ======================================================== */}
              {/* 2. OAK ISLAND (Q2 - The Vanishing Sandbar)               */}
              {/* True-to-life: Emergent shifting sandbar in Pujada Bay,   */}
              {/* pure coral sand, ripples, completely free of vegetation  */}
              {/* ======================================================== */}
              <g
                className="cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
                onClick={() => handleSelectStation(1)}
                role="button"
                tabIndex={0}
                aria-label="Quarter 2: Oak Island"
              >
                {/* Expansive Shallow Water Sandflat */}
                <ellipse cx="295" cy="125" rx="60" ry="24" fill="url(#coralLagoonHalo)" />
                <ellipse cx="295" cy="125" rx="54" ry="20" fill="#22D3EE" opacity="0.3" className="animate-shore-wash" />

                {/* The Vanishing Sandbar (Sweeping Crescent Shape) */}
                <path
                  d="M 255,130 C 270,112 305,108 340,120 C 352,126 345,134 325,138 C 298,142 270,140 255,130 Z"
                  fill="url(#phBeachSand)"
                  stroke="#FDE047"
                  strokeWidth="0.8"
                />
                {/* Sculpted Sandbar Dunes & Tidal Ripple Grooves */}
                <path d="M 278,122 Q 298,118 318,124" stroke="#EAB308" strokeWidth="0.9" fill="none" opacity="0.7" />
                <path d="M 285,128 Q 305,124 325,130" stroke="#EAB308" strokeWidth="0.9" fill="none" opacity="0.7" />

                {/* Pier Walkway to Anchorage */}
                <line x1="292" y1="130" x2="295" y2="173" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <line x1="288" y1="145" x2="298" y2="145" stroke="#B45309" strokeWidth="1.5" />
                <line x1="290" y1="160" x2="300" y2="160" stroke="#B45309" strokeWidth="1.5" />

                {/* Island Label Marker */}
                <g transform="translate(295, 52)">
                  <rect
                    x="-42"
                    y="-13"
                    width="84"
                    height="26"
                    rx="13"
                    fill={selectedStationIndex === 1 ? '#059669' : '#071F3C'}
                    stroke={selectedStationIndex === 1 ? '#34D399' : '#1E4976'}
                    strokeWidth="1.5"
                    className="shadow-lg transition-colors"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">
                    Q2 · Oak
                  </text>
                </g>
              </g>

              {/* ======================================================== */}
              {/* 3. WANIBAN ISLAND (Q3 - Outer Pujada Bay Cay)            */}
              {/* True-to-life: 4-hectare coral cay with flat coralline    */}
              {/* sand, central lush palm cluster, and brilliant sandbar   */}
              {/* ======================================================== */}
              <g
                className="cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
                onClick={() => handleSelectStation(2)}
                role="button"
                tabIndex={0}
                aria-label="Quarter 3: Waniban Island"
              >
                {/* Broad Coral Lagoon Reef Flats */}
                <ellipse cx="475" cy="211" rx="60" ry="24" fill="url(#coralLagoonHalo)" />
                <ellipse cx="500" cy="216" rx="14" ry="7" fill="#0D9488" opacity="0.35" />

                {/* White Sandbar Point Extending toward Bay */}
                <path
                  d="M 445,208 C 455,194 485,190 505,200 C 518,208 522,218 515,224 C 495,228 465,226 445,218 C 435,214 438,211 445,208 Z"
                  fill="url(#phBeachSand)"
                  stroke="#FCD34D"
                  strokeWidth="0.8"
                />
                <path
                  d="M 510,212 Q 535,218 545,224 Q 525,226 508,222 Z"
                  fill="url(#phBeachSand)"
                />

                {/* Dense Central Palm Copse */}
                <ellipse cx="475" cy="206" rx="26" ry="12" fill="url(#islandJungleRidge)" />
                <ellipse cx="472" cy="204" rx="20" ry="8" fill="#15803D" />

                {/* Waniban Coconut Palms Cluster */}
                <path d="M 470,204 C 473,188 475,174 470,162" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <g className="animate-frond-flutter-1" style={{ transformOrigin: '470px 162px' }}>
                  <path d="M 470,162 Q 455,154 448,164" stroke="#16A34A" strokeWidth="1.8" fill="none" />
                  <path d="M 470,162 Q 484,154 492,163" stroke="#22C55E" strokeWidth="1.8" fill="none" />
                </g>

                <path d="M 485,206 C 482,192 480,180 485,170" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <g className="animate-frond-flutter-2" style={{ transformOrigin: '485px 170px' }}>
                  <path d="M 485,170 Q 474,162 468,171" stroke="#15803D" strokeWidth="1.6" fill="none" />
                  <path d="M 485,170 Q 496,161 504,170" stroke="#4ADE80" strokeWidth="1.6" fill="none" />
                </g>

                {/* Dock to Anchorage */}
                <line x1="472" y1="216" x2="475" y2="283" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <line x1="467" y1="236" x2="477" y2="236" stroke="#B45309" strokeWidth="1.5" />
                <line x1="467" y1="258" x2="477" y2="258" stroke="#B45309" strokeWidth="1.5" />

                {/* Island Label Marker */}
                <g transform="translate(475, 138)">
                  <rect
                    x="-46"
                    y="-13"
                    width="92"
                    height="26"
                    rx="13"
                    fill={selectedStationIndex === 2 ? '#D97706' : '#071F3C'}
                    stroke={selectedStationIndex === 2 ? '#FBBF24' : '#1E4976'}
                    strokeWidth="1.5"
                    className="shadow-lg transition-colors"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">
                    Q3 · Waniban
                  </text>
                </g>
              </g>

              {/* ======================================================== */}
              {/* 4. PUJADA ISLAND (Q4 - 156-Hectare Queen of the Bay)     */}
              {/* True-to-life: Big forested rolling hills, curving white  */}
              {/* coral beach, elongated ridges facing the Pacific         */}
              {/* ======================================================== */}
              <g
                className="cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
                onClick={() => handleSelectStation(3)}
                role="button"
                tabIndex={0}
                aria-label="Quarter 4: Pujada Island"
              >
                {/* Turquoise Coral Lagoon Halo */}
                <ellipse cx="645" cy="120" rx="66" ry="30" fill="url(#coralLagoonHalo)" />
                <path
                  d="M595 122 Q635 106 680 114 Q698 126 676 132 Q635 136 595 122 Z"
                  fill="#67E8F9"
                  opacity="0.3"
                  className="animate-shore-wash"
                />

                {/* Powdery White Sand Perimeter & Elongated Sand Spit */}
                <path
                  d="M 598,120 C 603,105 630,102 660,105 C 682,107 696,114 698,122 C 699,128 689,134 672,136 C 652,138 620,139 602,133 C 596,130 594,125 598,120 Z"
                  fill="url(#phBeachSand)"
                  stroke="#FCD34D"
                  strokeWidth="0.8"
                />
                <path
                  d="M 688,118 Q 705,122 710,128 Q 698,128 685,125 Z"
                  fill="url(#phBeachSand)"
                />

                {/* Elongated Forested Mountain Ridge (156 hectares elevation) */}
                <path
                  d="M 605,121 C 613,92 645,84 668,96 C 685,103 688,119 678,126 C 665,131 625,133 605,121 Z"
                  fill="url(#islandJungleRidge)"
                />
                <path
                  d="M 622,114 C 630,90 650,86 664,95 C 672,103 670,115 659,118 C 647,121 630,121 622,114 Z"
                  fill="#166534"
                  opacity="0.85"
                />
                <path
                  d="M 628,105 Q 642,88 656,93 Q 662,100 651,105 Z"
                  fill="#4ADE80"
                  opacity="0.5"
                />

                {/* Coastal Coconut Palms */}
                <path d="M 636,106 C 633,91 630,76 636,66" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <g className="animate-frond-flutter-1" style={{ transformOrigin: '636px 66px' }}>
                  <path d="M 636,66 Q 622,58 614,70" stroke="#16A34A" strokeWidth="1.8" fill="none" />
                  <path d="M 636,66 Q 649,56 659,66" stroke="#22C55E" strokeWidth="1.8" fill="none" />
                </g>

                <path d="M 656,110 C 658,98 661,86 657,74" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <g className="animate-frond-flutter-2" style={{ transformOrigin: '657px 74px' }}>
                  <path d="M 657,74 Q 645,67 640,77" stroke="#16A34A" strokeWidth="1.6" fill="none" />
                  <path d="M 657,74 Q 668,66 675,74" stroke="#22C55E" strokeWidth="1.6" fill="none" />
                </g>

                {/* Wooden Landing Pier to Anchorage */}
                <line x1="642" y1="126" x2="645" y2="168" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <line x1="638" y1="140" x2="648" y2="140" stroke="#B45309" strokeWidth="1.5" />
                <line x1="640" y1="155" x2="650" y2="155" stroke="#B45309" strokeWidth="1.5" />

                {/* Island Label Marker */}
                <g transform="translate(645, 46)">
                  <rect
                    x="-46"
                    y="-13"
                    width="92"
                    height="26"
                    rx="13"
                    fill={selectedStationIndex === 3 ? '#7C3AED' : '#071F3C'}
                    stroke={selectedStationIndex === 3 ? '#A855F7' : '#1E4976'}
                    strokeWidth="1.5"
                    className="shadow-lg transition-colors"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">
                    Q4 · Pujada
                  </text>
                </g>
              </g>

              {/* ======================================================== */}
              {/* 5. SLEEPING DINOSAUR (Discovery - Mati City Peninsula)   */}
              {/* True-to-life: The exact famous silhouette of a dinosaur  */}
              {/* sleeping along the bay: snout, curved neck, arched back  */}
              {/* ======================================================== */}
              <g
                className="cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
                onClick={() => handleSelectStation(4)}
                role="button"
                tabIndex={0}
                aria-label="Discovery: Sleeping Dinosaur"
              >
                {/* Coastal Bay Shallows */}
                <ellipse cx="810" cy="205" rx="64" ry="24" fill="url(#coralLagoonHalo)" />

                {/* THE SLEEPING DINOSAUR TOPOGRAPHY (Authentic Silhouette, Scaled & Repositioned to Prevent Route Collision) */}
                {/* Tail leading from mainland (left), arched body/back, dipping neck, sleeping snout on water (right) */}
                <g transform="translate(810, 195) scale(0.8) translate(-810, -215)">
                  {/* Base Mountain Mass */}
                  <path
                    d="M 740,240 C 755,225 770,195 795,190 C 820,186 838,202 850,218 C 860,222 875,224 880,230 C 885,236 878,242 865,244 C 840,246 790,248 740,240 Z"
                    fill="url(#islandJungleRidge)"
                  />
                  {/* Snout Resting on Bay Water */}
                  <path
                    d="M 865,226 C 876,222 885,226 886,232 C 884,236 874,238 865,234 Z"
                    fill="#15803D"
                    stroke="#FDE68A"
                    strokeWidth="0.5"
                  />
                  {/* Dinosaur Curved Neck Dip */}
                  <path
                    d="M 835,208 C 845,212 856,222 862,228 C 852,232 842,225 835,218 Z"
                    fill="#166534"
                  />
                  {/* Arched Dinosaur Spine Ridge (Grasslands & Forest) */}
                  <path
                    d="M 780,198 C 795,188 815,188 830,202 C 815,208 795,208 780,198 Z"
                    fill="#4ADE80"
                    opacity="0.6"
                  />
                </g>

                {/* Dock to Anchorage in Bay Waters */}
                <line x1="808" y1="220" x2="810" y2="283" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <line x1="804" y1="242" x2="814" y2="242" stroke="#B45309" strokeWidth="1.5" />
                <line x1="804" y1="264" x2="814" y2="264" stroke="#B45309" strokeWidth="1.5" />

                {/* Island Label Marker */}
                <g transform="translate(810, 134)">
                  <rect
                    x="-58"
                    y="-13"
                    width="116"
                    height="26"
                    rx="13"
                    fill={selectedStationIndex === 4 ? '#4F46E5' : '#071F3C'}
                    stroke={selectedStationIndex === 4 ? '#818CF8' : '#1E4976'}
                    strokeWidth="1.5"
                    className="shadow-lg transition-colors"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">
                    Sleeping Dinosaur
                  </text>
                </g>
              </g>


              {/* ======================================================== */}
              {/* THE REALISTIC PHILIPPINE BANGKA / VINTA                  */}
              {/* Authentic outrigger physics: bamboo katig, woven sail,   */}
              {/* curved wooden hull, bow spray, and expanding wake wash   */}
              {/* ======================================================== */}
              <g
                style={{
                  transform: `translate(${boatPosition.x}px, ${boatPosition.y}px) rotate(${boatPosition.angle}deg)`,
                  transition: 'transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)',
                  transformOrigin: '0px 0px',
                }}
                className="pointer-events-none"
              >
                {/* Hydrodynamic Stern Wake Wash (Expanding V-shape) */}
                <g className={isSailing ? 'animate-boat-wake-wash' : 'opacity-40'}>
                  <path
                    d="M -16,0 L -38,-10 L -32,0 L -38,10 Z"
                    fill="#38BDF8"
                    opacity="0.3"
                  />
                  <ellipse cx="-24" cy="0" rx="16" ry="6" fill="none" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.6" />
                </g>

                {/* The Buoyant Floating Vessel with Compound Pitch & Roll */}
                <g className="animate-boat-realistic" filter="url(#softGlow)">
                  {/* Port Outrigger (Bamboo Float + Curved Crossbeams) */}
                  <line x1="-16" y1="-14" x2="18" y2="-14" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M -8,0 C -8,-8 -6,-12 -8,-14" stroke="#78350F" strokeWidth="1.8" fill="none" />
                  <path d="M 8,0 C 8,-8 10,-12 8,-14" stroke="#78350F" strokeWidth="1.8" fill="none" />

                  {/* Starboard Outrigger (Bamboo Float + Curved Crossbeams) */}
                  <line x1="-16" y1="14" x2="18" y2="14" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M -8,0 C -8,8 -6,12 -8,14" stroke="#78350F" strokeWidth="1.8" fill="none" />
                  <path d="M 8,0 C 8,8 10,12 8,14" stroke="#78350F" strokeWidth="1.8" fill="none" />

                  {/* Handcrafted Wooden Dugout Keel (Bangka Hull) */}
                  {/* Upswept curved prow (proa) and stern */}
                  <path
                    d="M -22,0 C -15,-6 15,-6 24,-1 C 26,0 24,1 24,1 C 15,6 -15,6 -22,0 Z"
                    fill="#78350F"
                    stroke="#B45309"
                    strokeWidth="1.2"
                  />
                  {/* Wooden Deck Interior Plank */}
                  <ellipse cx="2" cy="0" rx="16" ry="3.5" fill="#D97706" />

                  {/* Tall Hardwood Mast & Rigging Stays */}
                  <line x1="2" y1="0" x2="2" y2="-30" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Rigging Stays to Bow & Stern */}
                  <line x1="2" y1="-28" x2="20" y2="0" stroke="#CBD5E1" strokeWidth="0.7" opacity="0.6" />
                  <line x1="2" y1="-28" x2="-18" y2="0" stroke="#CBD5E1" strokeWidth="0.7" opacity="0.6" />

                  {/* Woven Billowing Vinta Sail with Traditional Geometric Weave */}
                  {/* Curved aerodynamic profile showing wind catch */}
                  <path
                    d="M 2,-28 Q 14,-22 20,-18 L 18,-6 Q 10,-8 2,-10 Z"
                    fill="#EF4444"
                  />
                  {/* Vibrant Weave Stripes (Saffron, Ocean Teal, Emerald) */}
                  <path
                    d="M 2,-28 Q 12,-22 17,-19 L 14,-13 Q 8,-16 2,-20 Z"
                    fill="#F59E0B"
                  />
                  <path
                    d="M 2,-20 Q 9,-15 14,-13 L 12,-7 Q 7,-10 2,-13 Z"
                    fill="#0EA5E9"
                  />
                  <path
                    d="M 2,-13 Q 7,-10 12,-7 L 11,-4 Q 6,-7 2,-9 Z"
                    fill="#10B981"
                  />

                  {/* Scholar Navigator / Captain at Helm */}
                  <circle cx="8" cy="-1" r="2.8" fill="#FDE047" />
                  {/* Traditional Salakot / Hat */}
                  <polygon points="5,-4 11,-4 8,-6" fill="#A16207" />

                  {/* Warm Glowing Bow Lantern */}
                  <circle cx="22" cy="0" r="1.8" fill="#FDE047" />

                  {/* Fluttering Golden Masthead Pennant */}
                  <polygon points="2,-30 8,-32 2,-34" fill="#FBBF24" />

                  {/* Bow Spray when moving */}
                  {isSailing && (
                    <ellipse cx="23" cy="0" rx="4" ry="2" fill="#FFFFFF" opacity="0.7" />
                  )}
                </g>
              </g>
            </svg>
          </div>

          {/* Quick Island Segmented Selector (Anti-slop clean design) */}
          <div className="border-t border-[#143560] bg-[#041327]/90 backdrop-blur-md p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {ARCHIPELAGO_STATIONS.map((station, index) => {
                const isSelected = selectedStationIndex === index;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => handleSelectStation(index)}
                    className={`relative p-2.5 rounded-2xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400/50 shadow-md ring-1 ring-sky-400/30'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {station.quarterLabel}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {station.name}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      {station.municipality.split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Island Deep Narrative & DepEd Curriculum Inspector */}
        <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#092242]/90 via-[#0B2A50]/80 to-[#071C38]/90 border border-[#1B4476] shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Island Real-Life Geography & Narrative */}
            <div className="lg:col-span-7 space-y-3">
              {/* Clean unboxed metadata row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-extrabold uppercase tracking-wider text-sky-300">
                  {activeStation.quarterLabel} Destination
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {activeStation.municipality}
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-amber-300">
                  {activeStation.landmark}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                  {activeStation.name}{' '}
                  <span className="text-sm font-semibold text-sky-300 font-sans">
                    — {activeStation.tagline}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {activeStation.realLifeGeography}
                </p>
                <p className="text-xs text-slate-300 mt-1.5">
                  Curriculum Focus: <strong className="text-white font-semibold">{activeStation.curriculumFocus}</strong>
                </p>
              </div>

              {/* DepEd Competencies Grid */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>DepEd Secondary English Competencies & Island Bridge Quests</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeStation.depEdCompetencies.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-xl bg-black/25 border border-white/5 text-slate-300"
                    >
                      <span className="text-sky-400 font-bold shrink-0 mt-0.5">✦</span>
                      <span className="leading-snug">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Anchorage Status & Restorable Knowledge Bridge */}
            <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#05162D]/85 border border-[#143969] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Anchorage Berth</div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      Anchored at {activeStation.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStation}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Sail Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress & Bridge restoration indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Island Bridge Quest Pillars:</span>
                  <span className="font-bold text-amber-300">Restorable Knowledge Bridges</span>
                </div>
                {/* Dynamic/Adaptive Pillar Mini Blocks */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  <div className="h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                  <div className="h-2 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
                  <div className="h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                  <div className="h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <div className="h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                  <div className="h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Each completed lesson quiz and grammar practice restores a golden plank on the island bridge across all quarter modules, unlocking division badges for secondary learners.
                </p>
              </div>

              {/* DepEd Davao Oriental Division Note */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
                <span className="truncate">DepEd Schools Division of Davao Oriental</span>
                <span className="text-sky-300 font-semibold shrink-0">Grades 7 — 10</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default CurriculumArchipelagoSection;
