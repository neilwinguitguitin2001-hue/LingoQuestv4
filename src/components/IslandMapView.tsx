import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Grid3X3,
  HelpCircle,
  Layers,
  ListChecks,
  Lock,
  Play,
  Search,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import {
  GradeLevel,
  Module,
  QuarterNumber,
  QuizGameType,
  StudentAccount,
  DAVAO_ORIENTAL_QUARTER_ISLANDS,
  getDavaoOrientalIsland,
} from '../types/lingoquest';
import { isStudentModuleUnlocked, isModuleFullyCompleted } from '../utils/progression';
import { soundFX } from '../utils/soundEffects';
import { InteractiveIslandMap } from './InteractiveIslandMap';
import { InabelStrip } from './InabelStrip';

interface IslandMapViewProps {
  student: StudentAccount;
  modules: Module[];
  activeBrowseGrade: GradeLevel;
  isPersonalizationMode: boolean;
  onTogglePersonalization: (enabled: boolean, targetGrade?: GradeLevel) => void;
  onSelectModule: (module: Module, startDirectlyInQuiz?: boolean) => void;
  isPreviewMode?: boolean;
  previewRole?: 'teacher' | 'admin' | null;
  onSelectGrade?: (grade: GradeLevel) => void;
  onReturnToDashboard?: () => void;
}

export const IslandMapView: React.FC<IslandMapViewProps> = ({
  student,
  modules,
  activeBrowseGrade,
  onSelectModule,
  isPreviewMode = false,
  previewRole = null,
  onSelectGrade,
  onReturnToDashboard,
}) => {
  const [previewGrade, setPreviewGrade] = useState<GradeLevel>(
    activeBrowseGrade || student.gradeLevel || 8
  );

  useEffect(() => {
    if (activeBrowseGrade) {
      setPreviewGrade(activeBrowseGrade);
    }
  }, [activeBrowseGrade]);

  const activeGrade: GradeLevel = isPreviewMode ? previewGrade : student.gradeLevel;

  const handleGradeChange = (grade: GradeLevel) => {
    soundFX.playClick();
    setPreviewGrade(grade);
    onSelectGrade?.(grade);
  };

  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<QuarterNumber | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lockedNoticeModule, setLockedNoticeModule] = useState<Module | null>(null);

  // Inspector modal state for faculty/admin quick review
  const [inspectingModule, setInspectingModule] = useState<Module | null>(null);
  const [inspectingGameFilter, setInspectingGameFilter] = useState<QuizGameType | 'all'>('all');

  // Filter modules strictly according to the active / previewed grade level
  const gradeModules = modules
    .filter((m) => m.gradeLevel === activeGrade)
    .sort((a, b) => a.moduleNumber - b.moduleNumber);

  const isModuleUnlocked = (mod: Module): boolean => {
    if (isPreviewMode) return true;
    return isStudentModuleUnlocked(mod, student, modules);
  };

  const isBridgeRestoredForModule = (mod: Module): boolean => {
    return isModuleFullyCompleted(mod, student);
  };

  const currentQuestModule =
    gradeModules.find((m) => isModuleUnlocked(m) && !isBridgeRestoredForModule(m)) ||
    gradeModules[gradeModules.length - 1];

  const restoredBridgesCount = gradeModules.filter((m) => isBridgeRestoredForModule(m)).length;

  const quarters: QuarterNumber[] = [1, 2, 3, 4];
  const visibleQuarters =
    selectedQuarterFilter === 'all' ? quarters : [selectedQuarterFilter];

  const handleModuleClick = (mod: Module, startInQuiz = false) => {
    soundFX.playClick();
    if (mod.gradeLevel !== activeGrade) return;
    if (!isPreviewMode && !isModuleUnlocked(mod)) {
      soundFX.playIncorrect();
      setLockedNoticeModule(mod);
      return;
    }
    setLockedNoticeModule(null);
    onSelectModule(mod, startInQuiz);
  };

  const getGameLabel = (type: QuizGameType) => {
    switch (type) {
      case 'analogyMaster':
        return 'Analogy Master';
      case 'missingPiece':
        return 'Missing Piece';
      case 'crosswordGame':
        return 'Crossword Game';
      case 'pictureHunt':
        return 'Picture Hunt';
      case 'typeHunter':
        return 'Word Hunter';
      default:
        return type;
    }
  };

  const activeMapIslandId =
    selectedQuarterFilter === 1
      ? 'q1-san-victor'
      : selectedQuarterFilter === 2
      ? 'q2-oak'
      : selectedQuarterFilter === 3
      ? 'q3-waniban'
      : selectedQuarterFilter === 4
      ? 'q4-pujada'
      : currentQuestModule
      ? `q${currentQuestModule.quarter}-${
          currentQuestModule.quarter === 1
            ? 'san-victor'
            : currentQuestModule.quarter === 2
            ? 'oak'
            : currentQuestModule.quarter === 3
            ? 'waniban'
            : 'pujada'
        }`
      : 'q1-san-victor';

  const handleMapSelectIsland = (station: { id: string }) => {
    soundFX.playClick();
    if (station.id === 'q1-san-victor') setSelectedQuarterFilter(1);
    else if (station.id === 'q2-oak') setSelectedQuarterFilter(2);
    else if (station.id === 'q3-waniban') setSelectedQuarterFilter(3);
    else if (station.id === 'q4-pujada') setSelectedQuarterFilter(4);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner when in Faculty or Administrator Preview Mode */}
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-5 rounded-2xl border border-sky-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Compass className="w-6 h-6 text-slate-950" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  {previewRole === 'teacher' ? 'Faculty Preview Mode' : 'Division Admin Preview Mode'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-sky-200 border border-white/20">
                  Curriculum Inspection · Grades 7 to 10
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                DepEd Davao Oriental Archipelago Map & Quiz Explorer
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                You can preview and test all lessons, view island bridges, and check all five-question quiz sets across all four grade levels (7, 8, 9, and 10). Sequential progression locks are bypassed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onReturnToDashboard();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{previewRole === 'teacher' ? 'Return to Classroom Portal' : 'Return to Admin Console'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grade Level Selector for Faculty & Admin Preview */}
      {isPreviewMode && (
        <div className="bg-white border-2 border-[#231F20] linocut-card rounded-3xl overflow-hidden">
          <InabelStrip variant="amber" label="Curriculum Archipelago Selector • Grades 7–10" />
          <div className="p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Select Grade Level Archipelago to Preview:
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click any grade level to inspect island modules, lessons, and five-question quiz suites
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { grade: 7 as GradeLevel, title: 'Grade 7 Archipelago', desc: 'Analogy & Philippine Lit' },
              { grade: 8 as GradeLevel, title: 'Grade 8 Archipelago', desc: 'Afro-Asian & Context Clues' },
              { grade: 9 as GradeLevel, title: 'Grade 9 Archipelago', desc: 'Anglo-American & Modals' },
              { grade: 10 as GradeLevel, title: 'Grade 10 Archipelago', desc: 'World Lit & Argumentation' },
            ].map(({ grade: g, title, desc }) => {
              const isSelected = activeGrade === g;
              const count = modules.filter((m) => m.gradeLevel === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGradeChange(g)}
                  className={`p-3 rounded-2xl text-left transition flex flex-col justify-between gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md border-blue-600 ring-2 ring-blue-500/30'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-tight">{title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-blue-800 text-sky-200' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count} Mods
                    </span>
                  </div>
                  <span className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      )}

      <section className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden">
        <InabelStrip
          variant="royal"
          label={`Grade ${activeGrade} English Archipelago Map • Davao Oriental`}
          rightText={`${restoredBridgesCount} / ${gradeModules.length} Bridges Restored`}
        />
        <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-sky-800">Grade {activeGrade} Curriculum</span>
              <span aria-hidden="true">·</span>
              <span>
                {isPreviewMode
                  ? `Inspector: ${student.name} (${previewRole === 'teacher' ? 'Teacher' : 'Administrator'})`
                  : `Learner: ${student.name}${student.schoolName ? ` • ${student.schoolName}` : student.section ? ` (${student.section})` : ''}`}
              </span>
              <span aria-hidden="true">·</span>
              <span>LRN {student.learnerId}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-semibold text-sky-700">
                {isPreviewMode ? 'Inspection Mode (All Unlocked)' : `${restoredBridgesCount} / ${gradeModules.length} Bridges Restored`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1.5 flex items-center gap-3">
              <span>Grade {activeGrade} English Archipelago Map</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                {gradeModules.length} Modules Total
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {isPreviewMode
                ? `Exploring all modules and five-question quizzes for Grade ${activeGrade} aligned with DepEd MELCs. Select any module to preview the interactive lesson or launch the quiz simulation.`
                : `Complete each module’s interactive lesson and pass the gamified quiz (75%+) to restore the broken bridge and unlock the next destination on your Grade ${activeGrade} journey.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-900 shadow-xs">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>{isPreviewMode ? `Previewing Grade Level: Grade ${activeGrade}` : `Enrolled Grade Level: Grade ${activeGrade}`}</span>
              {student.section && (
                <span className="text-sky-700 font-semibold">• {student.section}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {currentQuestModule && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">
                  Next Recommended Quest · Quarter {currentQuestModule.quarter} ({getDavaoOrientalIsland(currentQuestModule.quarter)?.name || currentQuestModule.islandName})
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  Module {currentQuestModule.moduleNumber}: {currentQuestModule.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleModuleClick(currentQuestModule, false)}
                className="ml-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Continue Quest</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Search Input for fast module discovery */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules or competencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 w-48 sm:w-60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSelectedQuarterFilter('all');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedQuarterFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 4 Islands ({gradeModules.length} Modules)
              </button>
              {quarters.map((q) => {
                const qIsland = getDavaoOrientalIsland(q);
                const qModsCount = gradeModules.filter((m) => m.quarter === q).length;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedQuarterFilter(q);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      selectedQuarterFilter === q
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={`${qIsland.name} (${qIsland.municipality}) · ${qModsCount} Modules`}
                  >
                    Q{q}: {qIsland.name.replace(' Island', '')} ({qModsCount} {qModsCount === 1 ? 'Mod' : 'Mods'})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Interactive Davao Oriental Archipelago Map with Morning Sky & Ocean Waves */}
      <div className="bg-slate-900/95 rounded-3xl border-2 border-[#231F20] linocut-card overflow-hidden animate-fade-in">
        <InabelStrip
          variant="amber"
          label={`Davao Oriental Archipelago Map • Grade ${activeGrade}`}
          rightText="Interactive Island Selector"
        />
        <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 text-xs border-b border-sky-950/80 mb-3">
          <div className="flex items-center gap-2 text-white">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Davao Oriental Archipelago Map • Grade {activeGrade}
            </span>
          </div>
          <span className="text-[11px] text-slate-300">
            Click any island to filter its modules and bridge restoration quest
          </span>
        </div>
        <InteractiveIslandMap
          activeIslandId={activeMapIslandId}
          onSelectIsland={handleMapSelectIsland}
          interactive={true}
          mode={isPreviewMode ? 'admin' : 'student'}
        />
        </div>
      </div>

      {lockedNoticeModule && (
        <div
          role="alert"
          className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-amber-300">
                Module {lockedNoticeModule.moduleNumber} ({lockedNoticeModule.title}) is currently locked!
              </span>{' '}
              To restore the bridge and unlock this module, finish the interactive lesson and pass the quiz (75%+) for{' '}
              <span className="underline font-bold">
                Module {lockedNoticeModule.moduleNumber - 1}
              </span>{' '}
              first.
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentQuestModule && (
              <button
                type="button"
                onClick={() => handleModuleClick(currentQuestModule, false)}
                className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                Go to Module {currentQuestModule.moduleNumber}
              </button>
            )}
            <button
              type="button"
              onClick={() => setLockedNoticeModule(null)}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {visibleQuarters.map((quarterNum) => {
          const rawQuarterModules = gradeModules.filter((m) => m.quarter === quarterNum);
          if (rawQuarterModules.length === 0) return null;

          const quarterModules = rawQuarterModules.filter((m) =>
            searchQuery.trim()
              ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.lessonContent.melcCompetency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(m.moduleNumber).includes(searchQuery.trim())
              : true
          );
          if (quarterModules.length === 0 && searchQuery.trim()) return null;

          const islandInfo = getDavaoOrientalIsland(quarterNum);
          const islandName = islandInfo?.name || rawQuarterModules[0].islandName;
          const restoredInQuarter = rawQuarterModules.filter((m) =>
            isBridgeRestoredForModule(m)
          ).length;
          const isIslandUnlocked = isModuleUnlocked(rawQuarterModules[0]);
          const isIslandCompleted =
            rawQuarterModules.length > 0 && restoredInQuarter === rawQuarterModules.length;

          return (
            <section
              key={quarterNum}
              className={`bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden transition-colors ${
                isIslandUnlocked ? '' : 'opacity-85'
              }`}
            >
              <InabelStrip
                variant={quarterNum === 1 ? 'royal' : quarterNum === 2 ? 'amber' : quarterNum === 3 ? 'emerald' : 'indigo'}
                label={`Quarter ${quarterNum} Island • ${islandInfo?.municipality}`}
                rightText={`${restoredInQuarter}/${rawQuarterModules.length} Modules Passed`}
              />
              <div className="relative bg-gradient-to-r from-sky-900 via-sky-800 to-teal-900 text-white p-6">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200">
                      <span className="font-bold text-white uppercase tracking-wider">Quarter {quarterNum} Island</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-sky-300 font-semibold">{islandInfo?.municipality}</span>
                      <span aria-hidden="true">·</span>
                      <span>Grade {activeGrade}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold">
                        {isIslandCompleted
                          ? `✓ ALL ${rawQuarterModules.length} BRIDGES RESTORED`
                          : isIslandUnlocked
                          ? `● ISLAND UNLOCKED (${rawQuarterModules.length} MODULES)`
                          : '🔒 LOCKED ISLAND'}
                      </span>
                      {activeGrade === 7 && quarterNum === 1 && (
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          All 10 Modules Active
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
                        <span>{islandName}</span>
                        {isIslandCompleted && (
                          <Trophy className="w-5 h-5 text-amber-300 inline" />
                        )}
                      </h2>
                      {islandInfo?.tagline && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/20 font-medium">
                          {islandInfo.tagline}
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-700/80 text-white font-bold border border-sky-500/40">
                        {rawQuarterModules.length} Modules in Quarter {quarterNum}
                      </span>
                    </div>
                    {islandInfo?.description && (
                      <p className="text-xs text-sky-100/80 mt-1.5 max-w-2xl font-light leading-relaxed">
                        {islandInfo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/40 px-4 py-2.5 rounded-lg border border-white/10">
                    <div>
                      <div className="text-xs text-sky-200">Island Bridges Restored</div>
                      <div className="text-sm font-semibold font-mono tabular-nums">
                        {restoredInQuarter} / {rawQuarterModules.length} Modules Passed
                      </div>
                    </div>
                    <div className="w-24 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{
                          width: `${rawQuarterModules.length > 0 ? (restoredInQuarter / rawQuarterModules.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-b from-sky-50/50 to-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
                  {quarterModules.map((mod, idx) => {
                    const unlocked = isModuleUnlocked(mod);
                    const bridgeRestored = isBridgeRestoredForModule(mod);
                    const modProg = student.progressByModule[mod.id];
                    const bestScore = modProg?.bestScorePercent ?? 0;
                    const lessonDone = Boolean(modProg?.lessonCompleted || bridgeRestored);
                    const isCurrentQuest = currentQuestModule?.id === mod.id;

                    return (
                      <div key={mod.id} className="flex flex-col justify-between relative">
                        <div
                          className={`flex-1 flex flex-col justify-between rounded-xl border-2 border-[#231F20] linocut-card overflow-hidden transition-all ${
                            bridgeRestored
                              ? 'bg-white'
                              : isCurrentQuest
                              ? 'bg-white ring-2 ring-sky-500/30'
                              : unlocked
                              ? 'bg-white hover:-translate-y-0.5'
                              : 'bg-slate-50'
                          }`}
                        >
                          <InabelStrip
                            variant={
                              bridgeRestored
                                ? 'emerald'
                                : isCurrentQuest
                                ? 'amber'
                                : unlocked
                                ? 'royal'
                                : 'dark'
                            }
                            label={`${mod.pdfLesson?.sourceLabel || `Module ${mod.moduleNumber}`} • ${mod.topicType.replace('-', ' ')}`}
                            rightText={bridgeRestored ? `${bestScore}%` : `Pass ${mod.requiredPassingScore}%`}
                          />
                          <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-mono font-semibold text-slate-600">
                                {(mod.pdfLesson?.sourceLabel || `Module ${mod.moduleNumber}`).toUpperCase()}
                              </span>
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  isPreviewMode
                                    ? 'text-blue-700'
                                    : bridgeRestored
                                    ? 'text-emerald-700'
                                    : unlocked
                                    ? 'text-sky-700'
                                    : 'text-slate-400'
                                }`}
                              >
                                {isPreviewMode ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="font-bold text-blue-700">Inspection Ready</span>
                                  </>
                                ) : bridgeRestored ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Passed ({bestScore}%)</span>
                                  </>
                                ) : unlocked ? (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Unlocked</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Locked</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {mod.title}
                            </h3>
                            <div className="text-xs text-slate-500 mt-1.5">
                              <span className="capitalize">{mod.topicType.replace('-', ' ')}</span>
                              <span aria-hidden="true"> · </span>
                              <span className="tabular-nums">Pass: {mod.requiredPassingScore}%</span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>1. Interactive Lesson</span>
                                <span className="font-mono font-semibold">
                                  {lessonDone ? '✓ Studied' : 'Pending'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>2. Module Quiz Quest</span>
                                <span className="font-mono font-semibold tabular-nums">
                                  {bestScore > 0 ? `Best: ${bestScore}%` : 'Not Attempted'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-slate-500 font-medium">
                                {idx < quarterModules.length - 1
                                  ? `Bridge to Module ${mod.moduleNumber + 1}`
                                  : quarterNum < 4
                                  ? `Strait Bridge to Q${quarterNum + 1}`
                                  : 'Archipelago Summit Bridge'}
                              </span>
                              <span
                                className={`font-mono text-[11px] font-semibold ${
                                  bridgeRestored ? 'text-amber-700' : 'text-slate-400'
                                }`}
                              >
                                {bridgeRestored ? '✓ RESTORED' : '✕ BROKEN'}
                              </span>
                            </div>

                            <div className="w-full h-11 rounded-lg bg-sky-100/80 border border-sky-200/70 overflow-hidden flex items-center justify-center">
                              {bridgeRestored ? (
                                <svg
                                  viewBox="0 0 200 40"
                                  className="w-full h-full animate-bridge-pulse"
                                  aria-label="Restored golden bridge"
                                >
                                  <rect width="200" height="40" fill="#E0F2FE" />
                                  <path d="M0 32 L200 32 L200 40 L0 40 Z" fill="#0284C7" />
                                  <path
                                    d="M12 12 Q100 26 188 12"
                                    fill="none"
                                    stroke="#B45309"
                                    strokeWidth="2"
                                  />
                                  <line
                                    x1="12"
                                    y1="24"
                                    x2="188"
                                    y2="24"
                                    stroke="#D97706"
                                    strokeWidth="4"
                                  />
                                  {[30, 55, 80, 105, 130, 155, 175].map((x) => (
                                    <rect
                                      key={x}
                                      x={x - 6}
                                      y="21"
                                      width="12"
                                      height="6"
                                      rx="1"
                                      fill="#F59E0B"
                                    />
                                  ))}
                                  <rect x="8" y="8" width="6" height="26" fill="#78350F" />
                                  <rect x="186" y="8" width="6" height="26" fill="#78350F" />
                                </svg>
                              ) : (
                                <svg
                                  viewBox="0 0 200 40"
                                  className="w-full h-full"
                                  aria-label="Broken bridge awaiting quiz completion"
                                >
                                  <rect width="200" height="40" fill="#F1F5F9" />
                                  <path d="M0 32 L200 32 L200 40 L0 40 Z" fill="#64748B" />
                                  <line
                                    x1="12"
                                    y1="22"
                                    x2="72"
                                    y2="28"
                                    stroke="#94A3B8"
                                    strokeWidth="3"
                                  />
                                  <line
                                    x1="128"
                                    y1="28"
                                    x2="188"
                                    y2="22"
                                    stroke="#94A3B8"
                                    strokeWidth="3"
                                  />
                                  <text
                                    x="100"
                                    y="24"
                                    textAnchor="middle"
                                    fill="#64748B"
                                    fontSize="9"
                                    fontWeight="bold"
                                  >
                                    GAP
                                  </text>
                                  <rect x="8" y="10" width="5" height="24" fill="#64748B" />
                                  <rect x="187" y="10" width="5" height="24" fill="#64748B" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleModuleClick(mod, false)}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                                unlocked
                                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {unlocked ? (
                                <>
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>{isPreviewMode ? 'Preview Lesson' : 'Lesson'}</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Locked</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleModuleClick(mod, true)}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                                unlocked
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                            >
                              <Play className={`w-3.5 h-3.5 ${isPreviewMode ? 'text-amber-600' : ''}`} />
                              <span>{isPreviewMode ? 'Preview Quiz' : 'Start Quiz'}</span>
                            </button>
                          </div>

                          {isPreviewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setInspectingModule(mod);
                                setInspectingGameFilter('all');
                              }}
                              className="mt-2.5 w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              title="Quick inspect all verified source questions, answers, and MELC competency"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>Quick Check Answers & Questions ({mod.quizQuestions?.length || 0} Qs)</span>
                            </button>
                          )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Quick Quiz & Answer Key Inspection Modal */}
      {inspectingModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden linocut-card border-2 border-[#231F20] flex flex-col animate-scale-up">
            <InabelStrip
              variant="amber"
              label={`Curriculum Inspector • Grade ${inspectingModule.gradeLevel} Module ${inspectingModule.moduleNumber}`}
              rightText={`${inspectingModule.quizQuestions?.length || 0} Questions`}
            />
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    Grade {inspectingModule.gradeLevel} · Quarter {inspectingModule.quarter} Module {inspectingModule.moduleNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-sky-200 border border-white/20">
                    {inspectingModule.islandName || getDavaoOrientalIsland(inspectingModule.quarter)?.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Passing: {inspectingModule.requiredPassingScore}%
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                  {inspectingModule.title}
                </h3>
                <p className="text-xs text-sky-200">
                  DepEd MELC: <strong>{inspectingModule.lessonContent.melcCompetency}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectingModule(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: `All Questions (${inspectingModule.quizQuestions?.length || 0})` },
                    { id: 'analogyMaster', label: 'Analogy Master (5)' },
                    { id: 'missingPiece', label: 'Missing Piece (5)' },
                    { id: 'crosswordGame', label: 'Crossword Game (5)' },
                    { id: 'pictureHunt', label: 'Picture Hunt (5)' },
                    { id: 'typeHunter', label: 'Word Hunter (5)' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setInspectingGameFilter(f.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      inspectingGameFilter === f.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const mod = inspectingModule;
                    setInspectingModule(null);
                    handleModuleClick(mod, false);
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Preview Lesson</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const mod = inspectingModule;
                    setInspectingModule(null);
                    handleModuleClick(mod, true);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Quiz</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(inspectingModule.quizQuestions || [])
                .filter((q) => (inspectingGameFilter === 'all' ? true : q.type === inspectingGameFilter))
                .map((q, idx) => {
                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {getGameLabel(q.type)}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          Time Limit: {q.timeLimitSeconds}s · Difficulty: {q.difficulty}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {q.prompt}
                      </p>

                      {(q.hint || q.contextSentence) && (
                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Context / Clue: {q.contextSentence || q.hint}</span>
                        </div>
                      )}

                      {/* Options & Correct Answer */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Options & Verified Key:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, oIdx) => {
                            const isCorrect =
                              opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400/40'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                  <span>{opt}</span>
                                </span>
                                {isCorrect && (
                                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    ✓ Key
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pedagogical Explanation */}
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                        <strong className="text-amber-900 font-bold">Answer Explanation & Rationale: </strong>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                DepEd Davao Oriental Curriculum Inspector · Verified PDF Question Bank
              </span>
              <button
                type="button"
                onClick={() => setInspectingModule(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
