import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Compass,
  GraduationCap,
  Key,
  Lock,
  School,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BADGE_DEFINITIONS } from '../data/seedData';
import { BadgeDefinition, StudentAccount } from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';
import { BadgeIcon } from './BadgeIcon';
import { InabelHeaderStrip } from './InabelHeaderStrip';

interface ProfileBadgesViewProps {
  badgesOnly?: boolean;
  student: StudentAccount;
  onBackToMap: () => void;
  onNavigateToDashboard?: () => void;
}

export const ProfileBadgesView: React.FC<ProfileBadgesViewProps> = ({
  student,
  badgesOnly = false,
  onBackToMap,
  onNavigateToDashboard,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [isMuted, setIsMuted] = useState(() => soundFX.isMuted());

  const unlockedBadgeCount = student.badges.length;

  const toggleSound = () => {
    const nextState = !isMuted;
    soundFX.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) {
      soundFX.playClick();
    }
  };

  const handleSelectBadge = (badge: BadgeDefinition) => {
    soundFX.playClick();
    setSelectedBadge(badge);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {!badgesOnly && <>
      {/* Profile Header Card in Deep Navy Theme */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] rounded-3xl text-white linocut-card relative overflow-hidden border-2 border-[#231F20]">
        <InabelHeaderStrip variant="amber" label="DepEd Learner Profile & Badges" patternId="profile-hero-inabel" />
        <div className="p-6 sm:p-8 relative">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner overflow-hidden shrink-0">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GraduationCap className="w-10 h-10 text-sky-300" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-950/60 px-3 py-0.5 rounded-full text-sky-200 border border-blue-800/60">
                  Learner Profile
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  DepEd Davao Oriental
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                {student.name}
              </h1>
              <p className="text-sky-100 text-xs sm:text-sm font-mono">
                LRN: {student.learnerId} • Grade {student.gradeLevel}{student.schoolName ? ` • ${student.schoolName}` : student.section ? ` - ${student.section}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToDashboard && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateToDashboard();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs shadow hover:bg-amber-300 transition cursor-pointer"
                title="Modify credentials, name, password, or picture"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            )}

            <button
              onClick={toggleSound}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/20 cursor-pointer"
              title="Toggle sound effects"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-sky-300" />}
              {isMuted ? 'Audio Muted' : 'Audio On'}
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onBackToMap();
              }}
              className="px-5 py-2.5 rounded-2xl bg-white text-blue-950 font-bold text-xs shadow hover:bg-sky-50 transition cursor-pointer"
            >
              Back to Island Map
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Account Details & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Learner Info */}
        <div className="bg-white rounded-3xl border-2 border-[#231F20] linocut-card overflow-hidden">
          <InabelHeaderStrip variant="royal" label="Registration Details" patternId="profile-reg-inabel" />
          <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-600" />
            Registration Details
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Username:</span>
              <span className="font-mono font-bold text-slate-800">@{student.username}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Learner Reference No.:</span>
              <span className="font-mono font-bold text-slate-800">{student.learnerId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Enrolled Grade:</span>
              <span className="font-bold text-slate-800">Grade {student.gradeLevel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">School / Section:</span>
              <span className="font-bold text-slate-800 truncate max-w-[180px]" title={student.schoolName || student.section}>
                {student.schoolName || student.section || 'DepEd Davao Oriental'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Account Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Student
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* Quest Summary */}
        <div className="bg-white rounded-3xl border-2 border-[#231F20] linocut-card overflow-hidden">
          <InabelHeaderStrip variant="indigo" label="Island Achievements" patternId="profile-achieve-inabel" />
          <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            Island Achievements
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Accumulated Points:</span>
              <span className="font-mono font-bold text-amber-600">
                {student.points.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Bridges Restored:</span>
              <span className="font-bold text-emerald-600">
                {student.completedModules.length} restored
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">AI Writing Submissions:</span>
              <span className="font-bold text-slate-800">
                {student.writingSubmissions?.length || 0} reviews
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Enrolled Grade Level:</span>
              <span className="font-bold text-sky-700">
                Grade {student.gradeLevel}
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* Classroom & Enrollment Details */}
        <div className="bg-white rounded-3xl border-2 border-[#231F20] linocut-card overflow-hidden">
          <InabelHeaderStrip variant="emerald" label="Classroom Enrollment" patternId="profile-class-inabel" />
          <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <School className="w-4 h-4 text-blue-600" />
            Classroom Enrollment
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Learner Ref (LRN):</span>
              <span className="font-mono font-bold text-slate-800">
                {student.lrn || student.learnerId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Teacher Class Code:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {student.classCode || 'LQ-ENG-8492'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">School Division:</span>
              <span className="font-bold text-slate-700">Davao Oriental</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Registration Date:</span>
              <span className="font-bold text-slate-700">{student.joinedDate}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      </>}
      {badgesOnly && <div><h1 className="text-2xl font-display font-bold">Your Badges</h1><p className="mt-2 text-slate-600">Celebrate your own learning milestones. Your badges are private from other students.</p></div>}
      {/* Badge Cabinet Showcase */}
      <div className="bg-white rounded-3xl border-2 border-[#231F20] linocut-card overflow-hidden">
        <InabelHeaderStrip variant="amber" label="Achievement Badge Cabinet" patternId="profile-badges-inabel" />
        <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Achievement Showcase
            </span>
            <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2 mt-0.5">
              <Award className="w-5 h-5 text-purple-600" />
              Badge Cabinet ({unlockedBadgeCount} / {BADGE_DEFINITIONS.length} Collected)
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Click any badge to view unlocking criteria
          </span>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = student.badges.includes(badge.id);
            const isSelected = selectedBadge?.id === badge.id;

            return (
              <button
                key={badge.id}
                onClick={() => handleSelectBadge(badge)}
                className={`p-4 rounded-3xl border text-center transition flex flex-col items-center justify-center space-y-2 relative group cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/80 shadow-md ring-2 ring-purple-400/30'
                    : isUnlocked
                    ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-300'
                    : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-90'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
                    isUnlocked
                      ? 'bg-amber-100 text-amber-900 group-hover:scale-105 shadow-sm'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <BadgeIcon iconType={badge.iconType} className="w-7 h-7" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{badge.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-amber-600 block">
                    +{badge.pointsBonus} pts
                  </span>
                </div>

                {isUnlocked ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Badge Detail Modal / Callout */}
        {selectedBadge && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <BadgeIcon iconType={selectedBadge.iconType} className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold font-display text-slate-900">
                    {selectedBadge.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    +{selectedBadge.pointsBonus} Bonus Points
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{selectedBadge.description}</p>
                <div className="text-[11px] text-purple-700 font-semibold mt-1 capitalize">
                  Category: {selectedBadge.category} • Status:{' '}
                  {student.badges.includes(selectedBadge.id) ? 'Claimed' : 'In Progress'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="px-4 py-2 text-xs font-semibold text-purple-700 bg-white rounded-xl shadow-xs hover:bg-purple-100 transition"
            >
              Close Detail
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
