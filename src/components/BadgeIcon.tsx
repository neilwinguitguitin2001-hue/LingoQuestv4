import React from 'react';
import {
  Award,
  BookOpen,
  Compass,
  Crown,
  Feather,
  Globe,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { BadgeDefinition } from '../types/lingoquest';

interface BadgeIconProps {
  iconType: BadgeDefinition['iconType'];
  unlocked?: boolean;
  className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  iconType,
  unlocked = true,
  className = 'w-6 h-6',
}) => {
  const colorClass = unlocked ? 'text-amber-600' : 'text-slate-400';

  switch (iconType) {
    case 'scroll':
      return <BookOpen className={`${className} ${colorClass}`} />;
    case 'compass':
      return <Compass className={`${className} ${colorClass}`} />;
    case 'bridge':
      return <Award className={`${className} ${colorClass}`} />;
    case 'crown':
      return <Crown className={`${className} ${colorClass}`} />;
    case 'lightning':
      return <Zap className={`${className} ${colorClass}`} />;
    case 'star':
      return <Sparkles className={`${className} ${colorClass}`} />;
    case 'trophy':
      return <Trophy className={`${className} ${colorClass}`} />;
    case 'feather':
      return <Feather className={`${className} ${colorClass}`} />;
    case 'globe':
      return <Globe className={`${className} ${colorClass}`} />;
    case 'shield':
    default:
      return <Shield className={`${className} ${colorClass}`} />;
  }
};
