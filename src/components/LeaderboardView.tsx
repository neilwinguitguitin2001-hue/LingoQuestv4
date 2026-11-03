import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Crown,
  Flame,
  Medal,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { GradeLevel, LeaderboardEntry, StudentAccount } from '../types/lingoquest';
import {
  FirestoreLeaderboardDoc,
  getPublicLeaderboardFromFirestore,
} from '../services/firebaseProgressService';
import { soundFX } from '../utils/soundEffects';
import { InabelHeaderStrip } from './InabelHeaderStrip';

interface LeaderboardViewProps {
  currentStudent: StudentAccount | null;
  allStudents: StudentAccount[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentStudent,
  allStudents,
}) => {
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [firestoreEntries, setFirestoreEntries] = useState<FirestoreLeaderboardDoc[]>([]);

  useEffect(() => {
    let active = true;
    getPublicLeaderboardFromFirestore().then((remote) => {
      if (active && Array.isArray(remote)) {
        setFirestoreEntries(remote);
      }
    });
    return () => {
      active = false;
    };
  }, [currentStudent?.points]);

  // Transform students into LeaderboardEntry with calculated metrics
  const localMap = new Map<string, LeaderboardEntry>();

  allStudents
    .filter((s) => s.isActive)
    .forEach((s) => {
      const scores = Object.values(s.progressByModule)
        .map((p) => p.bestScorePercent)
        .filter((sc) => sc > 0);
      const avgScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const bridgesCount = Object.values(s.progressByModule).filter(
        (p) => p.isBridgeRestored
      ).length;

      localMap.set(s.id, {
        studentId: s.id,
        name: s.name,
        learnerId: s.learnerId,
        gradeLevel: s.gradeLevel,
        schoolName: s.schoolName || '',
        section: s.section || '',
        totalPoints: s.points,
        completedModulesCount: s.completedModules.length,
        bridgesRestoredCount: bridgesCount,
        averageScore: avgScore,
        rank: 0,
      });
    });

  // Merge Firestore public `leaderboard/{uid}` entries
  firestoreEntries.forEach((rem) => {
    const id = rem.uid || rem.displayName;
    if (!id) return;
    const existing = localMap.get(id);
    if (existing) {
      existing.totalPoints = Math.max(existing.totalPoints, rem.xp || 0);
    } else {
      localMap.set(id, {
        studentId: id,
        name: rem.displayName,
        learnerId: 'FIREBASE',
        gradeLevel: (rem.gradeLevel as GradeLevel) || 8,
        schoolName: rem.school || 'DepEd Davao Oriental',
        section: rem.section || `Level ${rem.level || 1}`,
        totalPoints: rem.xp || 0,
        completedModulesCount: rem.completedQuestsCount || 0,
        bridgesRestoredCount: rem.bridgesRestoredCount || 0,
        averageScore: 85,
        rank: 0,
      });
    }
  });

  const entries: LeaderboardEntry[] = Array.from(localMap.values());

  // Filter by grade
  const filtered = entries.filter((e) => {
    const matchesGrade = gradeFilter === 'all' || e.gradeLevel === gradeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.schoolName && e.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.section && e.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.learnerId.includes(searchQuery);
    return matchesGrade && matchesSearch;
  });

  // Sort by points descending, then bridges restored, then avg score
  filtered.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.bridgesRestoredCount !== a.bridgesRestoredCount)
      return b.bridgesRestoredCount - a.bridgesRestoredCount;
    return b.averageScore - a.averageScore;
  });

  // Assign ranks
  filtered.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  const top3 = filtered.slice(0, 3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center shadow-md shadow-amber-400/30">
          <Crown className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center shadow-sm">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center shadow-sm">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    return (
      <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner in Royal Navy Theme */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] rounded-3xl text-white linocut-card relative overflow-hidden border-2 border-[#231F20]">
        <InabelHeaderStrip variant="amber" label="Division of Davao Oriental • Honor Roll" patternId="leaderboard-hero-inabel" />
        <div className="p-6 sm:p-8 relative">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-950/60 text-xs font-bold uppercase tracking-wider text-sky-200 border border-blue-800/60 backdrop-blur-md">
                Division of Davao Oriental
              </span>
              <span className="text-xs font-semibold text-sky-300">
                Honor Roll & Quest Ranks
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-300" />
              LingoQuest Hall of Fame
            </h1>
            <p className="text-sky-100 text-sm max-w-lg">
              Recognizing outstanding student scholars across all 4 Grade Levels for mastering English competencies and restoring island bridges.
            </p>
          </div>

          {currentStudent && (
            <div className="bg-blue-950/60 backdrop-blur-md rounded-2xl p-4 border border-blue-800/60 text-right">
              <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                Your Current Status
              </div>
              <div className="text-lg font-black font-display text-white mt-0.5">
                {currentStudent.name}
              </div>
              <div className="text-xs text-sky-200 font-mono mt-0.5">
                {currentStudent.points.toLocaleString()} Points • Grade {currentStudent.gradeLevel}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {top3.length >= 3 && gradeFilter === 'all' && !searchQuery && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 pb-2 items-end max-w-3xl mx-auto">
          {/* Rank 2 */}
          <div className="bg-white rounded-3xl border-2 border-[#231F20] linocut-card text-center relative flex flex-col items-center overflow-hidden">
            <div className="w-full inabel-header-strip" />
            <div className="p-4 sm:p-5 flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-lg mb-2 shadow-inner">
              🥈 2nd
            </div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
              {top3[1].name}
            </h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px]" title={top3[1].schoolName || top3[1].section}>
              Gr. {top3[1].gradeLevel} • {top3[1].schoolName || top3[1].section || 'DepEd Davao Oriental'}
            </p>
            <div className="mt-2 text-base sm:text-lg font-black font-mono text-slate-700">
              {top3[1].totalPoints.toLocaleString()}
              <span className="text-[10px] font-sans font-normal text-slate-400 block">pts</span>
            </div>
            </div>
          </div>

          {/* Rank 1 (Tallest) */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-[#231F20] linocut-card text-center relative flex flex-col items-center -mt-4 overflow-hidden">
            <div className="w-full inabel-header-strip" />
            <div className="p-5 sm:p-6 flex flex-col items-center w-full">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl mb-2 shadow-md shadow-amber-300">
              👑 1st
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
              {top3[0].name}
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold truncate max-w-[200px]" title={top3[0].schoolName || top3[0].section}>
              Gr. {top3[0].gradeLevel} • {top3[0].schoolName || top3[0].section || 'DepEd Davao Oriental'}
            </p>
            <div className="mt-2 text-lg sm:text-2xl font-black font-mono text-amber-600">
              {top3[0].totalPoints.toLocaleString()}
              <span className="text-[10px] font-sans font-normal text-amber-800/60 block">pts</span>
            </div>
            <span className="mt-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {top3[0].bridgesRestoredCount} Bridges Restored
            </span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="bg-white rounded-3xl border-2 border-[#231F20] linocut-card text-center relative flex flex-col items-center overflow-hidden">
            <div className="w-full inabel-header-strip" />
            <div className="p-4 sm:p-5 flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg mb-2 shadow-inner">
              🥉 3rd
            </div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
              {top3[2].name}
            </h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px]" title={top3[2].schoolName || top3[2].section}>
              Gr. {top3[2].gradeLevel} • {top3[2].schoolName || top3[2].section || 'DepEd Davao Oriental'}
            </p>
            <div className="mt-2 text-base sm:text-lg font-black font-mono text-slate-700">
              {top3[2].totalPoints.toLocaleString()}
              <span className="text-[10px] font-sans font-normal text-slate-400 block">pts</span>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Table & Filter Controls */}
      <div className="bg-white rounded-3xl linocut-card border-2 border-[#231F20] overflow-hidden">
        <InabelHeaderStrip variant="royal" label="Scholar Rankings & Bridge Restoration Roster" patternId="leaderboard-table-inabel" />
        <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Grade Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {(['all', 7, 8, 9, 10] as const).map((g) => (
              <button
                key={g}
                onClick={() => {
                  soundFX.playClick();
                  setGradeFilter(g);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  gradeFilter === g
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 'all' ? 'All Grades' : `Grade ${g}`}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Grade & Section</th>
                <th className="py-3 px-3">Bridges Restored</th>
                <th className="py-3 px-3">Quiz Average</th>
                <th className="py-3 px-3 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => {
                const isMe = currentStudent?.id === item.studentId;

                return (
                  <tr
                    key={item.studentId}
                    className={`transition ${
                      isMe
                        ? 'bg-amber-50/80 font-bold border-l-4 border-amber-500'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-3">{getRankBadge(item.rank)}</td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 text-xs">
                          {item.name}
                          {isMe && (
                            <span className="ml-2 text-[10px] uppercase font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        LRN: {item.learnerId}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-slate-700 font-semibold">Grade {item.gradeLevel}</span>
                      <span className="text-slate-400 text-[11px] block truncate max-w-[170px]" title={item.schoolName || item.section}>
                        {item.schoolName || item.section || 'DepEd Davao Oriental'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {item.bridgesRestoredCount} Restored
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      {item.averageScore > 0 ? (
                        <span
                          className={
                            item.averageScore >= 75 ? 'text-emerald-600 font-bold' : 'text-slate-600'
                          }
                        >
                          {item.averageScore}%
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="font-mono font-black text-amber-600 text-sm">
                        {item.totalPoints.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans ml-1">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};
