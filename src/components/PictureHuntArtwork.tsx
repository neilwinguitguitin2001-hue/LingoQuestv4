import React from 'react';
import { PictureSceneId } from '../types/lingoquest';

interface PictureHuntArtworkProps {
  sceneId: PictureSceneId;
  className?: string;
}

export const PictureHuntArtwork: React.FC<PictureHuntArtworkProps> = ({
  sceneId,
  className = 'w-full h-36',
}) => {
  switch (sceneId) {
    case 'lighthouse_storm':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Cape San Agustin Lighthouse guiding ships in a storm">
          <rect width="240" height="140" fill="#0F172A" />
          <polygon points="105,36 240,5 240,68" fill="#FDE047" opacity="0.35" />
          <polygon points="105,36 240,18 240,54" fill="#FEF08A" opacity="0.5" />
          <path d="M0 105 Q30 92 60 105 T120 105 T180 105 T240 105 L240 140 L0 140 Z" fill="#0369A1" />
          <path d="M0 118 Q40 106 80 118 T160 118 T240 118 L240 140 L0 140 Z" fill="#0284C7" />
          <polygon points="45,115 72,82 128,85 145,118" fill="#475569" />
          <polygon points="88,85 93,38 109,38 114,85" fill="#F8FAFC" />
          <polygon points="90,68 92,52 110,52 112,68" fill="#EF4444" />
          <rect x="91" y="28" width="20" height="10" rx="2" fill="#FACC15" />
          <polygon points="88,28 101,18 114,28" fill="#DC2626" />
          <polyline points="38,14 26,38 39,38 28,62" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'bamboo_bridge':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Restored golden bamboo bridge spanning a river">
          <rect width="240" height="140" fill="#E0F2FE" />
          <circle cx="195" cy="32" r="16" fill="#FBBF24" />
          <path d="M0 95 L240 95 L240 140 L0 140 Z" fill="#0EA5E9" />
          <path d="M0 78 Q35 76 58 98 L0 105 Z" fill="#16A34A" />
          <path d="M240 78 Q205 76 182 98 L240 105 Z" fill="#16A34A" />
          <path d="M40 50 Q120 82 200 50" fill="none" stroke="#92400E" strokeWidth="2.5" />
          <path d="M40 82 Q120 66 200 82" fill="none" stroke="#B45309" strokeWidth="6" />
          {[60, 80, 100, 120, 140, 160, 180].map((x) => (
            <g key={x}>
              <line x1={x} y1="62" x2={x} y2="76" stroke="#B45309" strokeWidth="1.5" />
              <rect x={x - 5} y="73" width="10" height="5" rx="1" fill="#F59E0B" />
            </g>
          ))}
          <rect x="36" y="45" width="8" height="44" rx="2" fill="#78350F" />
          <rect x="196" y="45" width="8" height="44" rx="2" fill="#78350F" />
        </svg>
      );

    case 'ancient_scroll':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Unrolled literary scroll with feather quill">
          <rect width="240" height="140" fill="#FEF3C7" />
          <rect x="52" y="24" width="136" height="92" rx="6" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          <rect x="44" y="20" width="14" height="100" rx="6" fill="#B45309" />
          <rect x="182" y="20" width="14" height="100" rx="6" fill="#B45309" />
          <line x1="74" y1="45" x2="155" y2="45" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <line x1="74" y1="62" x2="165" y2="62" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="74" y1="78" x2="148" y2="78" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="74" y1="94" x2="132" y2="94" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M145 98 Q172 60 198 28 Q185 68 156 92 Z" fill="#0284C7" />
          <line x1="138" y1="106" x2="195" y2="31" stroke="#F8FAFC" strokeWidth="2" />
        </svg>
      );

    case 'philippine_eagle':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Majestic Philippine Eagle soaring over Mount Hamiguitan">
          <rect width="240" height="140" fill="#DCFCE7" />
          <polygon points="0,140 65,65 135,140" fill="#15803D" />
          <polygon points="90,140 170,52 240,140" fill="#166534" />
          <path d="M55 52 Q92 26 120 48 Q148 26 185 52 Q152 64 120 56 Q88 64 55 52 Z" fill="#78350F" />
          <circle cx="120" cy="46" r="10" fill="#FDE68A" />
          <polygon points="117,48 123,48 120,55" fill="#F59E0B" />
          <path d="M112 38 L108 30 M120 36 L120 27 M128 38 L132 30" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'festival_dancers':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Colorful cultural festival celebration with banners">
          <rect width="240" height="140" fill="#FFF1F2" />
          <path d="M0 18 Q120 42 240 18" fill="none" stroke="#64748B" strokeWidth="1.5" />
          {[30, 65, 100, 135, 170, 205].map((x, i) => (
            <polygon
              key={x}
              points={`${x - 10},22 ${x + 10},22 ${x},42`}
              fill={['#EF4444', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899'][i % 6]}
            />
          ))}
          <circle cx="85" cy="68" r="11" fill="#F59E0B" />
          <path d="M68 118 L85 80 L102 118 Z" fill="#E11D48" />
          <path d="M62 88 Q85 72 108 88" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
          <circle cx="155" cy="68" r="11" fill="#0EA5E9" />
          <path d="M138 118 L155 80 L172 118 Z" fill="#0284C7" />
          <path d="M132 88 Q155 72 178 88" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'library_scholar':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Open encyclopedia books with reading glasses">
          <rect width="240" height="140" fill="#F1F5F9" />
          <rect x="42" y="88" width="156" height="18" rx="3" fill="#0284C7" />
          <rect x="48" y="92" width="144" height="10" rx="1" fill="#F8FAFC" />
          <path d="M55 84 Q88 72 120 84 Q152 72 185 84 L185 38 Q152 28 120 40 Q88 28 55 38 Z" fill="#FFFFFF" stroke="#475569" strokeWidth="2.5" />
          <line x1="120" y1="40" x2="120" y2="84" stroke="#64748B" strokeWidth="2" />
          <circle cx="98" cy="58" r="12" fill="none" stroke="#D97706" strokeWidth="3" />
          <circle cx="142" cy="58" r="12" fill="none" stroke="#D97706" strokeWidth="3" />
          <line x1="110" y1="58" x2="130" y2="58" stroke="#D97706" strokeWidth="3" />
        </svg>
      );

    case 'planting_mangroves':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Coastal mangrove saplings growing in Pujada Bay">
          <rect width="240" height="140" fill="#ECFEFF" />
          <rect x="0" y="96" width="240" height="44" fill="#0891B2" />
          <path d="M80 78 Q65 95 60 112 M80 78 Q80 96 80 112 M80 78 Q95 95 100 112" fill="none" stroke="#78350F" strokeWidth="3" />
          <path d="M160 78 Q145 95 140 112 M160 78 Q160 96 160 112 M160 78 Q175 95 180 112" fill="none" stroke="#78350F" strokeWidth="3" />
          <circle cx="80" cy="56" r="24" fill="#16A34A" />
          <circle cx="68" cy="62" r="16" fill="#22C55E" />
          <circle cx="160" cy="56" r="24" fill="#15803D" />
          <circle cx="172" cy="62" r="16" fill="#22C55E" />
        </svg>
      );

    case 'mountain_campfire':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Warm storytelling campfire under starry skies">
          <rect width="240" height="140" fill="#1E1B4B" />
          <circle cx="45" cy="28" r="2" fill="#FEF08A" />
          <circle cx="95" cy="18" r="2.5" fill="#FEF08A" />
          <circle cx="165" cy="24" r="2" fill="#FEF08A" />
          <circle cx="202" cy="38" r="1.8" fill="#FEF08A" />
          <rect x="85" y="102" width="70" height="10" rx="4" transform="rotate(-12 120 107)" fill="#78350F" />
          <rect x="85" y="102" width="70" height="10" rx="4" transform="rotate(12 120 107)" fill="#92400E" />
          <path d="M120 36 Q148 70 136 98 Q120 106 104 98 Q92 70 120 36 Z" fill="#F97316" />
          <path d="M120 52 Q138 76 128 96 Q120 102 112 96 Q102 76 120 52 Z" fill="#FACC15" />
        </svg>
      );

    case 'fishing_vinta':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Colorful Mindanao vinta sailboat on calm ocean waters">
          <rect width="240" height="140" fill="#E0F2FE" />
          <rect x="0" y="98" width="240" height="42" fill="#0284C7" />
          <polygon points="120,20 172,82 72,82" fill="#F59E0B" />
          <polygon points="120,34 156,82 86,82" fill="#EF4444" />
          <polygon points="120,50 140,82 100,82" fill="#10B981" />
          <path d="M68 86 L172 86 L156 102 L84 102 Z" fill="#78350F" />
        </svg>
      );

    case 'science_microscope':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Laboratory microscope and research flask">
          <rect width="240" height="140" fill="#F0FDFA" />
          <rect x="65" y="108" width="110" height="10" rx="3" fill="#334155" />
          <path d="M105 108 L105 52 Q135 52 135 80" fill="none" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          <rect x="92" y="30" width="16" height="36" rx="3" transform="rotate(20 100 48)" fill="#0EA5E9" />
          <polygon points="160,65 170,65 184,106 146,106" fill="#34D399" opacity="0.85" />
          <rect x="161" y="52" width="8" height="15" fill="#64748B" />
        </svg>
      );

    case 'handshake_harmony':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Two hands clasping in cooperative agreement">
          <rect width="240" height="140" fill="#FEFCE8" />
          <circle cx="120" cy="70" r="44" fill="#FEF08A" stroke="#F59E0B" strokeWidth="2" />
          <path d="M40 72 L95 72 Q115 62 128 72 L115 86 L40 86 Z" fill="#0284C7" />
          <path d="M200 72 L145 72 Q125 62 112 72 L125 86 L200 86 Z" fill="#059669" />
          <circle cx="120" cy="76" r="14" fill="#FBBF24" />
        </svg>
      );

    case 'hourglass_time':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Golden hourglass measuring passing time">
          <rect width="240" height="140" fill="#F8FAFC" />
          <rect x="82" y="22" width="76" height="8" rx="3" fill="#B45309" />
          <rect x="82" y="110" width="76" height="8" rx="3" fill="#B45309" />
          <polygon points="90,30 150,30 120,70" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
          <polygon points="120,70 150,110 90,110" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
          <polygon points="100,48 140,48 120,68" fill="#F59E0B" />
          <polygon points="120,88 142,108 98,108" fill="#F59E0B" />
        </svg>
      );

    case 'magnifying_clue':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Magnifying glass inspecting context clues in text">
          <rect width="240" height="140" fill="#EFF6FF" />
          <rect x="52" y="26" width="115" height="88" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="68" y1="46" x2="148" y2="46" stroke="#94A3B8" strokeWidth="3" />
          <line x1="68" y1="64" x2="148" y2="64" stroke="#0284C7" strokeWidth="4" />
          <line x1="68" y1="82" x2="130" y2="82" stroke="#94A3B8" strokeWidth="3" />
          <circle cx="135" cy="68" r="24" fill="#E0F2FE" fillOpacity="0.7" stroke="#0369A1" strokeWidth="5" />
          <line x1="153" y1="85" x2="178" y2="110" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );

    case 'scales_justice':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Balanced golden scales representing parallel structure and fairness">
          <rect width="240" height="140" fill="#F8FAFC" />
          <rect x="95" y="112" width="50" height="8" rx="3" fill="#475569" />
          <line x1="120" y1="28" x2="120" y2="112" stroke="#475569" strokeWidth="5" />
          <line x1="68" y1="46" x2="172" y2="46" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="72" y1="46" x2="60" y2="82" stroke="#94A3B8" strokeWidth="2" />
          <line x1="72" y1="46" x2="84" y2="82" stroke="#94A3B8" strokeWidth="2" />
          <path d="M54 82 Q72 94 90 82 Z" fill="#F59E0B" />
          <line x1="168" y1="46" x2="156" y2="82" stroke="#94A3B8" strokeWidth="2" />
          <line x1="168" y1="46" x2="180" y2="82" stroke="#94A3B8" strokeWidth="2" />
          <path d="M150 82 Q168 94 186 82 Z" fill="#F59E0B" />
        </svg>
      );

    case 'megaphone_speech':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Public speaker megaphone projecting persuasive voice">
          <rect width="240" height="140" fill="#FFF7ED" />
          <polygon points="68,62 146,34 146,104 68,78" fill="#EA580C" />
          <rect x="54" y="60" width="16" height="20" rx="3" fill="#334155" />
          <rect x="74" y="78" width="12" height="26" rx="3" transform="rotate(15 80 90)" fill="#475569" />
          <path d="M164 52 Q178 69 164 86" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
          <path d="M180 40 Q200 69 180 98" fill="none" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'opposites_contrast':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Contrasting day and night opposites symbolizing Antonyms">
          <rect width="120" height="140" fill="#38BDF8" />
          <rect x="120" width="120" height="140" fill="#0F172A" />
          {/* Day side: radiant sun over calm sea */}
          <circle cx="60" cy="55" r="24" fill="#FACC15" />
          <path d="M0 105 Q30 98 60 105 T120 105 L120 140 L0 140 Z" fill="#0284C7" />
          {/* Night side: crescent moon and glowing stars */}
          <path d="M185 36 A20 20 0 1 0 185 72 A15 15 0 0 1 185 36 Z" fill="#FEF08A" />
          <circle cx="140" cy="30" r="2" fill="#FFFFFF" />
          <circle cx="210" cy="45" r="1.8" fill="#FFFFFF" />
          <circle cx="155" cy="85" r="1.5" fill="#FFFFFF" />
          <path d="M120 105 Q150 98 180 105 T240 105 L240 140 L120 140 Z" fill="#1E293B" />
          {/* Center contrast line */}
          <line x1="120" y1="0" x2="120" y2="140" stroke="#F8FAFC" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      );

    case 'cause_effect_rain':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Heavy monsoon rain leading to blooming flora symbolizing Cause and Effect">
          <rect width="240" height="140" fill="#F0FDF4" />
          {/* Cause: Rain cloud */}
          <path d="M40 45 Q30 35 45 25 Q60 15 75 25 Q90 18 100 30 Q112 35 105 48 Z" fill="#94A3B8" />
          <path d="M45 52 L38 68 M60 52 L53 68 M75 52 L68 68 M90 52 L83 68" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Arrow indicating cause leads to effect */}
          <path d="M110 55 L138 55 M132 48 L142 55 L132 62" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Effect: Green ground and blooming tropical flower */}
          <path d="M130 115 Q180 95 240 115 L240 140 L130 140 Z" fill="#15803D" />
          <line x1="185" y1="115" x2="185" y2="75" stroke="#166534" strokeWidth="3" />
          <path d="M185 92 Q200 88 198 98 Q192 102 185 96" fill="#22C55E" />
          {/* Flower petals */}
          <circle cx="185" cy="72" r="8" fill="#F59E0B" />
          <circle cx="185" cy="58" r="7" fill="#E11D48" />
          <circle cx="199" cy="72" r="7" fill="#E11D48" />
          <circle cx="185" cy="86" r="7" fill="#E11D48" />
          <circle cx="171" cy="72" r="7" fill="#E11D48" />
        </svg>
      );

    case 'part_whole_puzzle':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Puzzle piece snapping into whole puzzle symbolizing Part to Whole">
          <rect width="240" height="140" fill="#FEF3C7" />
          {/* Main puzzle board representing the WHOLE */}
          <rect x="35" y="25" width="170" height="90" rx="8" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          {/* Existing fitted sections */}
          <rect x="45" y="35" width="70" height="70" rx="4" fill="#F59E0B" opacity="0.3" stroke="#B45309" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* The PART fitting into place */}
          <g transform="translate(125, 35)">
            <rect width="70" height="70" rx="6" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <circle cx="35" cy="0" r="10" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <circle cx="0" cy="35" r="8" fill="#FDE68A" stroke="#0369A1" strokeWidth="2" />
            <text x="35" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">PART</text>
          </g>
          <text x="80" y="75" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="bold" fontFamily="sans-serif">WHOLE</text>
        </svg>
      );

    case 'location_habitat':
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Eagle perched at Mount Hamiguitan symbolizing Location and Habitat">
          <rect width="240" height="140" fill="#ECFDF5" />
          {/* Mountain Hamiguitan ridge in background */}
          <polygon points="0,140 70,55 140,140" fill="#047857" />
          <polygon points="80,140 170,40 240,140" fill="#065F46" />
          {/* Ancient bonsai tree branch habitat */}
          <path d="M0 120 Q60 110 110 85 Q160 65 240 75" fill="none" stroke="#78350F" strokeWidth="9" strokeLinecap="round" />
          <path d="M120 80 Q140 60 160 62" fill="none" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          {/* Eagle in its natural location */}
          <circle cx="160" cy="48" r="10" fill="#FDE68A" />
          <polygon points="152,48 168,48 160,56" fill="#F59E0B" />
          <path d="M148 58 Q160 52 172 58 L168 76 L152 76 Z" fill="#78350F" />
          <circle cx="156" cy="46" r="1.5" fill="#0F172A" />
          <circle cx="164" cy="46" r="1.5" fill="#0F172A" />
          {/* Location pin badge */}
          <circle cx="45" cy="35" r="14" fill="#EF4444" />
          <circle cx="45" cy="32" r="5" fill="#FFFFFF" />
          <polygon points="36,40 54,40 45,55" fill="#EF4444" />
        </svg>
      );

    case 'compass_voyage':
    default:
      return (
        <svg viewBox="0 0 240 140" className={`${className} rounded-lg overflow-hidden`} role="img" aria-label="Explorer compass rose pointing across the archipelago">
          <rect width="240" height="140" fill="#F0F9FF" />
          <circle cx="120" cy="70" r="46" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
          <circle cx="120" cy="70" r="38" fill="none" stroke="#BAE6FD" strokeWidth="1.5" strokeDasharray="4 4" />
          <polygon points="120,28 130,70 110,70" fill="#EF4444" />
          <polygon points="120,112 130,70 110,70" fill="#475569" />
          <polygon points="78,70 120,60 120,80" fill="#CBD5E1" />
          <polygon points="162,70 120,60 120,80" fill="#CBD5E1" />
          <circle cx="120" cy="70" r="5" fill="#F59E0B" />
        </svg>
      );
  }
};
