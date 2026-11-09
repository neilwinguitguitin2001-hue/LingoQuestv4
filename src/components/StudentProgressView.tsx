import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flame,
  Globe,
  GraduationCap,
  Key,
  Lock,
  Play,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react';
import { BADGE_DEFINITIONS } from '../data/seedData';
import {
  DifficultyLevel,
  GradeLevel,
  Module,
  QuarterNumber,
  QuizAttemptRecord,
  StudentAccount,
  DAVAO_ORIENTAL_QUARTER_ISLANDS,
  getDavaoOrientalIsland,
} from '../types/lingoquest';
import { isStudentModuleUnlocked, isModuleFullyCompleted } from '../utils/progression';
import { soundFX } from '../utils/soundEffects';
import { BadgeIcon } from './BadgeIcon';
import { InabelHeaderStrip } from './InabelHeaderStrip';

interface StudentProgressViewProps {
  student: StudentAccount;
  allModules: Module[];
  onSelectModule: (module: Module, startDirectlyInQuiz?: boolean) => void;
  onNavigateTab: (tab: 'map' | 'writing' | 'leaderboard' | 'profile' | 'dashboard') => void;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  student,
  allModules,
  onSelectModule,
  onNavigateTab,
}) => {
  // Strictly provide only what year level the student is enrolled/assigned to
  const selectedGrade: GradeLevel = student.gradeLevel;
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterNumber | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'modules' | 'attempts'>('modules');

  const gradeModules = allModules
    .filter((m) => m.gradeLevel === selectedGrade)
    .sort((a, b) => a.moduleNumber - b.moduleNumber);

  const completedCount = gradeModules.filter(
    (m) => student.progressByModule[m.id]?.isBridgeRestored || student.completedModules.includes(m.id)
  ).length;

  const totalGradeModules = gradeModules.length > 0 ? gradeModules.length : 16;
  const overallPercentage = Math.round((completedCount / totalGradeModules) * 100);

  // Compute average quiz score across completed modules
  const scores = Object.values(student.progressByModule)
    .map((p) => p.bestScorePercent)
    .filter((s) => s > 0);
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Flatten all quiz attempts
  const allAttempts: QuizAttemptRecord[] = [];
  Object.values(student.progressByModule).forEach((prog) => {
    if (prog.quizHistory && prog.quizHistory.length > 0) {
      allAttempts.push(...prog.quizHistory);
    }
  });
  allAttempts.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

  // Quarters summary with dynamic module counts per quarter
  const quarters: {
    quarter: QuarterNumber;
    islandName: string;
    title: string;
    municipality: string;
    tagline: string;
    count: number;
    completed: number;
  }[] = ([1, 2, 3, 4] as QuarterNumber[]).map((qNum) => {
    const island = DAVAO_ORIENTAL_QUARTER_ISLANDS[qNum];
    const qMods = gradeModules.filter((m) => m.quarter === qNum);
    return {
      quarter: qNum,
      islandName: island.name,
      title: `${island.name} Quests`,
      municipality: island.municipality,
      tagline: island.tagline,
      count: qMods.length > 0 ? qMods.length : 4,
      completed: 0,
    };
  });

  quarters.forEach((q) => {
    const qMods = gradeModules.filter((m) => m.quarter === q.quarter);
    q.count = qMods.length > 0 ? qMods.length : q.count;
    q.completed = qMods.filter(
      (m) => student.progressByModule[m.id]?.isBridgeRestored || student.completedModules.includes(m.id)
    ).length;
  });

  const filteredModules = gradeModules.filter((m) =>
    selectedQuarter === 'all' ? true : m.quarter === selectedQuarter
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">Your scores and learning progress are private to you and authorized staff. Other students cannot open your individual performance records. Your optional grade activity board shows only an alias and activity-completion points.</p>
      {/* Top Banner with Deep Navy Theme */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] rounded-3xl text-white relative overflow-hidden border-2 border-[#231F20] linocut-card">
        <InabelHeaderStrip variant="royal" label="DepEd Davao Oriental • Learner Progress Analytics" />
        <div className="p-6 sm:p-8 relative">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-950/60 text-xs font-bold tracking-wider uppercase text-sky-200 border border-blue-800/60 backdrop-blur-md">
                Learner Analytics
              </span>
              <span className="text-xs font-semibold text-sky-300">
                Grade {student.gradeLevel}{student.schoolName ? ` • ${student.schoolName}` : student.section ? ` - ${student.section}` : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              {student.name}'s Learning Journey
            </h1>
            <p className="text-sky-100 text-sm max-w-xl">
              Track your unlocked island bridges, high scores, mastery difficulties, and DepEd Davao Oriental milestone badges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateTab('dashboard');
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-400 text-slate-950 font-bold text-sm shadow hover:bg-amber-300 transition cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Student Dashboard</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateTab('map');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-950 font-bold text-sm shadow hover:bg-sky-50 transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Continue Quest</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed Modules */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bridges Restored
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-800">{completedCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalGradeModules} Modules</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Quest Points */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quest Points
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600">
              {student.points.toLocaleString()}
            </span>
            <span className="text-xs text-amber-800/60 font-medium">pts</span>
          </div>
          <p className="text-[11px] text-slate-400">Earned across quizzes, bridges & AI writing</p>
        </div>

        {/* Card 3: Average Quiz Score */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quiz Average
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-sky-600">
              {averageScore > 0 ? `${averageScore}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-medium">accuracy</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {completedCount > 0 ? `${completedCount} modules attempted` : 'Ready for your first quiz'}
          </p>
        </div>

        {/* Card 4: Badges Earned */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Badges Unlocked
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-purple-600">
              {student.badges.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {BADGE_DEFINITIONS.length} Badges</span>
          </div>
          <p className="text-[11px] text-slate-400">
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-purple-600 font-bold hover:underline"
            >
              View Badge Cabinet →
            </button>
          </p>
        </div>
      </div>

      {/* Quarter Completion Cards */}
      <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-4">
        <InabelHeaderStrip variant="emerald" label={`Quarterly Island Progression • Grade ${selectedGrade}`} />
        <div className="px-6 pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span>Quarterly Island Progression (Grade {selectedGrade})</span>
          </h2>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-900 shadow-xs self-start sm:self-auto">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>Enrolled Grade Level: Grade {selectedGrade}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarters.map((q) => {
            const pct = Math.round((q.completed / q.count) * 100);
            const isCompleted = q.completed === q.count;
            return (
              <div
                key={q.quarter}
                className={`p-4 rounded-2xl border transition ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : q.completed > 0
                    ? 'bg-sky-50/60 border-sky-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Quarter {q.quarter} Island
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Mastered
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{q.islandName}</h4>
                <p className="text-[11px] text-sky-700 font-semibold truncate mt-0.5">{q.municipality}</p>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 font-medium">{q.completed} of {q.count} Bridges</span>
                  <span className="font-bold font-mono text-slate-700">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Tabs: Modules Table vs Attempts Log vs Personalization History */}
      <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-6">
        <InabelHeaderStrip variant="indigo" label="Modules & Quiz Attempt History" />
        <div className="px-6 pb-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('modules');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'modules'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Modules & Bridge Status ({gradeModules.length})
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('attempts');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'attempts'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Quiz Attempt History ({allAttempts.length})
            </button>
          </div>

          {activeTab === 'modules' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Quarter:</span>
              {(['all', 1, 2, 3, 4] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                    selectedQuarter === q
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {q === 'all' ? 'All' : `Q${q}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Modules Roster */}
        {activeTab === 'modules' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">Topic & Skill</th>
                  <th className="py-3 px-3">Lesson Status</th>
                  <th className="py-3 px-3">Bridge Status</th>
                  <th className="py-3 px-3">Best Score</th>
                  <th className="py-3 px-3">Difficulties Beaten</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredModules.map((mod) => {
                  const prog = student.progressByModule[mod.id];
                  const isRestored = Boolean(
                    prog?.isBridgeRestored || student.completedModules.includes(mod.id)
                  );
                  const isLessonDone = Boolean(prog?.lessonCompleted);

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">
                            {mod.quarterModuleIndex}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{mod.title}</div>
                            <div className="text-[11px] text-slate-400">
                              Q{mod.quarter} • {getDavaoOrientalIsland(mod.quarter)?.name || mod.islandName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {mod.topicType.replace('-', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-col items-start gap-1">
                          {isLessonDone ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Not studied</span>
                          )}
                          {prog?.visualInteractionsCompleted && prog.visualInteractionsCompleted.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              ★ {prog.visualInteractionsCompleted.length}/9 Visuals
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {isRestored ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Restored
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            <Lock className="w-3 h-3" /> Needs 75%
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold">
                        {prog?.bestScorePercent ? (
                          <span
                            className={
                              prog.bestScorePercent >= 75 ? 'text-emerald-600' : 'text-amber-600'
                            }
                          >
                            {prog.bestScorePercent}%
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {prog?.completedDifficulties && prog.completedDifficulties.length > 0 ? (
                          <div className="flex gap-1">
                            {prog.completedDifficulties.map((d) => (
                              <span
                                key={d}
                                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  d === 'hard'
                                    ? 'bg-rose-100 text-rose-800'
                                    : d === 'moderate'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {isStudentModuleUnlocked(mod, student, allModules) ? (
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onSelectModule(mod);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            {isModuleFullyCompleted(mod, student) ? 'Review' : 'Play Quest'}
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-semibold cursor-not-allowed"
                            title={`Finish Module ${mod.moduleNumber - 1} lesson and quizzes to unlock`}
                          >
                            <Lock className="w-3 h-3 text-slate-400" /> Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Attempts Log */}
        {activeTab === 'attempts' && (
          <div>
            {allAttempts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Compass className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600 text-sm">No quiz attempts recorded yet.</p>
                <p className="text-xs text-slate-400">
                  Head over to the Island Map, complete a lesson, and take your first gamified quiz!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Module</th>
                      <th className="py-3 px-3">Difficulty</th>
                      <th className="py-3 px-3">Mode</th>
                      <th className="py-3 px-3">Score</th>
                      <th className="py-3 px-3">Result</th>
                      <th className="py-3 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {allAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                          {att.timestamp}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-800">{att.moduleTitle}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            (Grade {att.gradeLevel} Q{att.quarter})
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              att.difficulty === 'hard'
                                ? 'bg-rose-100 text-rose-800'
                                : att.difficulty === 'moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {att.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 capitalize text-slate-600">
                          {att.gameModeFilter === 'all' ? 'All 4 Game Types' : att.gameModeFilter}
                        </td>
                        <td className="py-3.5 px-3 font-mono">
                          {att.score}/{att.totalQuestions} ({att.percentage}%)
                        </td>
                        <td className="py-3.5 px-3">
                          {att.passed ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                              PASSED (Bridge Restored)
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                              FAILED (Below 75%)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-600">
                          +{att.pointsEarned} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
