import { PdfLessonView } from './PdfLessonView';
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Edit,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MapPin,
  Plus,
  Printer,
  Search,
  Sparkles,
  Trash2,
  X,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  Compass,
} from 'lucide-react';
import {
  GradeLevel,
  Module,
  QuizGameType,
  QuizQuestion,
  TopicType,
  DAVAO_ORIENTAL_QUARTER_ISLANDS,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';

export interface ComprehensiveCurriculumViewProps {
  modules: Module[];
  userRole: 'admin' | 'teacher';
  onCreateModule?: () => void;
  onEditModule?: (module: Module) => void;
  onDeleteModule?: (module: Module) => void;
  teacherAssignedGrades?: GradeLevel[]; // Grade levels assigned to this teacher
  currentTeacherName?: string;
  onPreviewIslandMap?: (grade?: GradeLevel) => void;
}

export const ComprehensiveCurriculumView: React.FC<ComprehensiveCurriculumViewProps> = ({
  modules,
  userRole,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  teacherAssignedGrades = [7],
  currentTeacherName,
  onPreviewIslandMap,
}) => {
  const isAdmin = userRole === 'admin';

  // For teachers, default to their first assigned grade level or 'assigned'
  const assignedList = useMemo(() => {
    if (teacherAssignedGrades && teacherAssignedGrades.length > 0) {
      return teacherAssignedGrades;
    }
    return [7 as GradeLevel];
  }, [teacherAssignedGrades]);

  // Selected Grade: If teacher, default to their assigned grade; if admin, default to 'all'
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all' | 'assigned'>(
    isAdmin ? 'all' : assignedList[0] || 7
  );
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<TopicType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'master_answers' | 'table'>('cards');
  const [showAnswersOnCards, setShowAnswersOnCards] = useState(true);

  // Detail Modal state
  const [activeModuleDetail, setActiveModuleDetail] = useState<Module | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'quiz_answers' | 'lesson_content' | 'printable_sheet'>('quiz_answers');
  const [quizTypeFilter, setQuizTypeFilter] = useState<QuizGameType | 'all'>('all');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Compute filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      // Grade filter
      if (selectedGrade === 'assigned') {
        if (!assignedList.includes(mod.gradeLevel)) return false;
      } else if (selectedGrade !== 'all') {
        if (mod.gradeLevel !== selectedGrade) return false;
      }

      // Quarter filter
      if (selectedQuarter !== 'all' && mod.quarter !== selectedQuarter) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'all' && mod.topicType !== selectedTopic) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = mod.title?.toLowerCase().includes(q);
        const matchesIsland = mod.islandName?.toLowerCase().includes(q);
        const matchesMelc = mod.lessonContent?.melcCompetency?.toLowerCase().includes(q);
        const matchesOverview = mod.lessonContent?.overview?.toLowerCase().includes(q);
        const matchesQuestions = mod.quizQuestions?.some(
          (qu) =>
            qu.prompt?.toLowerCase().includes(q) ||
            qu.answer?.toLowerCase().includes(q) ||
            qu.explanation?.toLowerCase().includes(q)
        );
        const matchesGlossary = mod.lessonContent?.vocabularyGlossary?.some(
          (g) => g.term?.toLowerCase().includes(q) || g.definition?.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesIsland && !matchesMelc && !matchesOverview && !matchesQuestions && !matchesGlossary) {
          return false;
        }
      }
      return true;
    });
  }, [modules, selectedGrade, selectedQuarter, selectedTopic, searchQuery, assignedList]);

  // Overall Statistics
  const totalQuestions = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.quizQuestions?.length || 0), 0);
  }, [modules]);

  const filteredQuestionsCount = useMemo(() => {
    return filteredModules.reduce((acc, m) => acc + (m.quizQuestions?.length || 0), 0);
  }, [filteredModules]);

  // Copy full answer key to clipboard
  const handleCopyAnswerKey = (mod: Module) => {
    if (mod.pdfLesson) {
      const pdf = mod.pdfLesson;
      const text = [pdf.source.fileName, pdf.source.url,
        ...pdf.selfCheck.map((e) => `PDF p. ${e.page}: ${e.text}`),
        ...pdf.answerKey.map((e) => `Checking guide · PDF p. ${e.page}: ${e.text}`),
      ].join('\n\n');
      navigator.clipboard?.writeText(text).then(() => setCopyFeedback(mod.id)).catch(() => setCopyFeedback(null));
      return;
    }

    soundFX.playClick();
    const islandInfo = DAVAO_ORIENTAL_QUARTER_ISLANDS[mod.quarter];
    let text = `=========================================\n`;
    text += `DEPED DIVISION OF DAVAO ORIENTAL - SECONDARY ENGLISH\n`;
    text += `CURRICULUM MODULE & MASTER QUIZ ANSWER KEY\n`;
    text += `=========================================\n`;
    text += `Module: Grade ${mod.gradeLevel} - Quarter ${mod.quarter} (Module #${mod.moduleNumber})\n`;
    text += `Title: ${mod.title}\n`;
    text += `Archipelago Island: ${mod.islandName} (${islandInfo?.landmark || ''})\n`;
    text += `MELC Competency: ${mod.lessonContent?.melcCompetency || 'N/A'}\n`;
    text += `Topic Type: ${mod.topicType.toUpperCase()}\n`;
    text += `Required Passing Score: ${mod.requiredPassingScore}%\n`;
    text += `-----------------------------------------\n`;
    text += `MASTER QUIZ QUESTIONS & OFFICIAL ANSWERS:\n`;
    text += `-----------------------------------------\n\n`;

    mod.quizQuestions.forEach((q, idx) => {
      text += `[Q${idx + 1}] (${q.type.toUpperCase()} | ${q.difficulty.toUpperCase()} | ${q.timeLimitSeconds}s)\n`;
      text += `Prompt: ${q.prompt}\n`;
      if (q.contextSentence) text += `Context: "${q.contextSentence}"\n`;
      if (q.options && q.options.length > 0) {
        text += `Choices:\n`;
        q.options.forEach((opt, oIdx) => {
          const isCorrect = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
          text += `  ${String.fromCharCode(65 + oIdx)}. ${opt} ${isCorrect ? ' [★ OFFICIAL ANSWER]' : ''}\n`;
        });
      }
      if (q.analogyPair) {
        text += `Analogy: ${q.analogyPair.firstA} : ${q.analogyPair.firstB} :: ${q.analogyPair.secondC} : [?] (${q.analogyPair.relationshipType})\n`;
      }
      text += `OFFICIAL ANSWER: >>> ${q.answer} <<<\n`;
      if (q.explanation) text += `DepEd Pedagogical Explanation: ${q.explanation}\n`;
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopyFeedback(`Master answer key for "${mod.title}" copied to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* ROLE BANNER & CONTEXT NOTIFICATION */}
      {/* ---------------------------------------------------- */}
      <div
        className={`p-5 rounded-3xl border shadow-xs transition ${
          isAdmin
            ? 'bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white border-blue-700/50'
            : 'bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white border-emerald-700/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                    : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" /> Division Administrator • Full Authoring Authority
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-300" /> DepEd Faculty Access • Master Quiz Answer Key
                  </>
                )}
              </span>
              <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
                DepEd Davao Oriental Secondary English Curriculum
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <BookOpen className={`w-6 h-6 ${isAdmin ? 'text-blue-400' : 'text-emerald-400'}`} />
              {isAdmin
                ? 'Curriculum Modules & Master Quiz Management'
                : 'Modules & Master Quiz Answer Keys Dashboard'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              {isAdmin ? (
                <>
                  Division Administrator Privileges: Full rights to view all lesson guides, inspect master quiz answers, <strong className="text-blue-300">create new modules, edit competencies, modify quiz questions, or delete modules</strong>.
                </>
              ) : (
                <>
                  Teacher View: Inspect all curriculum modules and <strong className="text-emerald-300">PDF lessons and source assessment materials</strong> on your assigned grade level{assignedList.length > 1 ? 's' : ''} (<strong className="text-amber-200">{assignedList.map((g) => `Grade ${g}`).join(', ')}</strong>) to prepare classroom instruction and formative assessments.
                </>
              )}
            </p>

            {!isAdmin && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-emerald-200">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/30 border border-emerald-400/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Your Assigned Grade Level{assignedList.length > 1 ? 's' : ''}:{' '}
                  {assignedList.map((g) => `Grade ${g}`).join(', ')}
                </span>
                <span className="text-[11px] text-slate-300 italic flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Only Division Administrators have permission to modify, add, or change modules and quiz questions.
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onCreateModule && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onCreateModule();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create New Module
              </button>
            )}

            {!isAdmin && (
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-300" />
                <span className="font-semibold text-[11px]">Curriculum Editing Locked to Division Admins</span>
              </div>
            )}
          </div>
        </div>

        {copyFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-scale-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{copyFeedback}</span>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TOP STAT CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{isAdmin ? 'Total Modules' : 'Assigned Modules'}</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {filteredModules.length}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {isAdmin ? `All ${modules.length} secondary modules` : `Grade ${assignedList.join(', ')} curriculum`}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Quiz Items with Answers</span>
            <HelpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-display">
            {filteredQuestionsCount}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> 100% verified answer keys
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Curriculum Islands</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-display">
            4 Quarters
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            Pujada • Waniban • Oak • San Victor
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>DepEd Standard</span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-display">
            75%
          </div>
          <div className="text-[11px] text-slate-500">
            Passing mastery benchmark
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTER & SEARCH TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by module title, island, MELC competency, quiz prompt, answer key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle & Answer Key Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <button
              onClick={() => {
                soundFX.playClick();
                setShowAnswersOnCards(!showAnswersOnCards);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                showAnswersOnCards
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle answers display on cards"
            >
              {showAnswersOnCards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showAnswersOnCards ? 'Answers Visible' : 'Answers Hidden'}
            </button>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setViewMode('cards');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setViewMode('table');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Summary Table
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setViewMode('master_answers');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'master_answers' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Answers Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Grade Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Grade:
            </span>

            {!isAdmin ? (
              // Teacher: Can toggle between their assigned grades or preview any secondary grade (7 to 10)
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedGrade('assigned');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedGrade === 'assigned'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  My Assigned ({assignedList.map((g) => `G${g}`).join(', ')})
                </button>

                {([7, 8, 9, 10] as const).map((g) => {
                  const isCurrent = selectedGrade === g;
                  const isAssigned = assignedList.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedGrade(g);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span>Grade {g}</span>
                      {isAssigned ? (
                        <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                          Assigned
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          Preview
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedGrade('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    selectedGrade === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  All Grades (7–10 Preview)
                </button>
              </div>
            ) : (
              // Admin: Can view all grades or filter to specific grade
              (['all', 7, 8, 9, 10] as const).map((g) => {
                const isCurrent = selectedGrade === g;

                return (
                  <button
                    key={g}
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedGrade(g);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g === 'all' ? 'All Grades' : `Grade ${g}`}
                  </button>
                );
              })
            )}
          </div>

          {/* Quarter Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Quarter:
            </span>
            {(['all', 1, 2, 3, 4] as const).map((q) => {
              const island = typeof q === 'number' ? DAVAO_ORIENTAL_QUARTER_ISLANDS[q as 1 | 2 | 3 | 4] : null;
              return (
                <button
                  key={q}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedQuarter(q);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    selectedQuarter === q
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={island ? `${island.name} (${island.municipality})` : 'All Quarters'}
                >
                  {q === 'all' ? 'All Quarters' : `Q${q}: ${island?.name.split(' ')[0]}`}
                </button>
              );
            })}
          </div>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Topic:
            </span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                soundFX.playClick();
                setSelectedTopic(e.target.value as TopicType | 'all');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Topics (Grammar, Reading, etc.)</option>
              <option value="grammar">Grammar & Syntax</option>
              <option value="vocabulary">Vocabulary & Semantics</option>
              <option value="reading">Reading Comprehension</option>
              <option value="spelling">Spelling</option>
              <option value="sentence-construction">Sentence Construction</option>
              <option value="literature">Literature</option>
              <option value="viewing">Viewing Genres</option>
              <option value="writing">Writing Lab</option>
              <option value="research">Research & Citing</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* EMPTY STATE */}
      {/* ---------------------------------------------------- */}
      {filteredModules.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No modules match your current search and filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search keyword or clearing the Grade / Quarter / Topic filters to view secondary English modules.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGrade(isAdmin ? 'all' : assignedList[0] || 7);
              setSelectedQuarter('all');
              setSelectedTopic('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 1: CARDS VIEW */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'cards' && filteredModules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredModules.map((mod) => {
            const islandInfo = DAVAO_ORIENTAL_QUARTER_ISLANDS[mod.quarter];
            const isAssigned = assignedList.includes(mod.gradeLevel);

            return (
              <div
                key={mod.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs transition hover:shadow-md flex flex-col justify-between overflow-hidden group"
              >
                {/* Island Themed Top Banner */}
                <div
                  className="p-4 text-white relative flex flex-col justify-between"
                  style={{
                    backgroundColor: mod.islandThemeColor || islandInfo?.themeColor || '#1e3a8a',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/20">
                        Grade {mod.gradeLevel} • Q{mod.quarter}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/20 text-white/90">
                        Mod #{mod.moduleNumber}
                      </span>
                      {isAssigned && !isAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400 text-slate-900">
                          Your Assigned Grade
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-white/10 text-white/80">
                      {mod.topicType}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-black text-white text-base font-display line-clamp-1 group-hover:text-amber-200 transition">
                      {mod.title}
                    </h3>
                    <div className="text-xs text-white/90 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 opacity-80" />
                      <span>{mod.islandName}</span>
                      <span className="text-white/60 text-[10px]">({islandInfo?.landmark || islandInfo?.municipality})</span>
                    </div>
                  </div>
                </div>

                {/* Module Body */}
                <div className="p-4 sm:p-5 space-y-4 flex-1">
                  {/* DepEd MELC Box */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>DepEd MELC Competency</span>
                      <span className="text-blue-600 font-bold">Pass: {mod.requiredPassingScore}%</span>
                    </div>
                    <div className="text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      {mod.lessonContent?.melcCompetency || 'See the objectives in the source PDF.'}
                    </div>
                  </div>

                  {/* Overview preview */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {mod.lessonContent?.overview}
                  </p>

                  {/* Quick Quiz Questions & Answers Section */}
                  {showAnswersOnCards && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Master Quiz Answer Key ({mod.quizQuestions?.length || 0})
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Official Key
                        </span>
                      </div>

                      {/* Display first 2 questions with highlighted answer */}
                      <div className="space-y-2">
                        {mod.quizQuestions?.slice(0, 2).map((q, qIdx) => (
                          <div
                            key={q.id || qIdx}
                            className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-bold text-slate-700">Q{qIdx + 1} ({q.type})</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-sm font-bold uppercase ${
                                  q.difficulty === 'easy'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : q.difficulty === 'hard'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="text-slate-700 font-medium line-clamp-1">
                              {q.prompt}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 bg-white p-1 rounded-lg border border-emerald-200">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[10px] text-emerald-600 font-black uppercase">Official Answer:</span>
                              <span className="truncate">{q.answer}</span>
                            </div>
                          </div>
                        ))}

                        {mod.quizQuestions?.length > 2 && (
                          <div className="text-[11px] text-slate-500 font-semibold text-center pt-0.5">
                            + {mod.quizQuestions.length - 2} more questions with complete answer keys
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setActiveModuleDetail(mod);
                      setDetailModalTab('quiz_answers');
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> View Details & Answers
                  </button>

                  {onPreviewIslandMap && (
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        onPreviewIslandMap(mod.gradeLevel);
                      }}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition cursor-pointer"
                      title={`Preview Grade ${mod.gradeLevel} Island Map & Quizzes`}
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyAnswerKey(mod)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                    title="Copy Answer Key to Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && onEditModule && (
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        onEditModule(mod);
                      }}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                      title="Edit Module & Questions (Admin Only)"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isAdmin && onDeleteModule && (
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        onDeleteModule(mod);
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                      title="Delete Module (Admin Only)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isAdmin && (
                    <span
                      className="text-[11px] font-semibold text-slate-400 px-2 py-1 rounded-lg bg-white border border-slate-200 inline-flex items-center gap-1"
                      title="Curriculum content is verified by Division Admins (Read-Only)"
                    >
                      <Lock className="w-3 h-3 text-slate-400" /> Read-Only
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 2: SUMMARY TABLE VIEW */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'table' && filteredModules.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Module & Title</th>
                  <th className="py-3.5 px-4">Grade & Quarter</th>
                  <th className="py-3.5 px-4">Island Landmark</th>
                  <th className="py-3.5 px-4">MELC Competency</th>
                  <th className="py-3.5 px-4 text-center">Quiz Items</th>
                  <th className="py-3.5 px-4 text-center">Passing</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{mod.title}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Mod #{mod.moduleNumber} • {mod.topicType.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        Grade {mod.gradeLevel} • Q{mod.quarter}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{mod.islandName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate">
                      {mod.lessonContent?.melcCompetency || 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {mod.quizQuestions?.length || 0} Questions
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {mod.requiredPassingScore}%
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            soundFX.playClick();
                            setActiveModuleDetail(mod);
                            setDetailModalTab('quiz_answers');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs"
                        >
                          View Answers
                        </button>

                        <button
                          onClick={() => handleCopyAnswerKey(mod)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800"
                          title="Copy Answer Key"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && onEditModule && (
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onEditModule(mod);
                            }}
                            className="p-1 rounded-lg text-blue-600 hover:text-blue-800"
                            title="Edit Module (Admin Only)"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isAdmin && onDeleteModule && (
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onDeleteModule(mod);
                            }}
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700"
                            title="Delete Module (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 3: ALL ANSWER KEYS MASTER SHEET */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'master_answers' && filteredModules.length > 0 && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complete Master Answer Key Sheet
              </h4>
              <p className="text-xs text-emerald-700">
                Displaying all questions and official verified answers across {filteredModules.length} filtered modules ({filteredQuestionsCount} quiz challenges).
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Answer Sheet
            </button>
          </div>

          <div className="space-y-6">
            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        Grade {mod.gradeLevel} • Q{mod.quarter}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {mod.pdfLesson?.sourceLabel || `Module ${mod.moduleNumber}`} ({mod.topicType})
                      </span>
                    </div>
                    <h3 className="text-lg font-black font-display text-slate-900 mt-1">
                      {mod.title}
                    </h3>
                    <div className="text-xs text-slate-500">
                      Island: {mod.islandName} • Passing Score: {mod.requiredPassingScore}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAnswerKey(mod)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Answer Key
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setActiveModuleDetail(mod);
                        setDetailModalTab('quiz_answers');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Expand
                    </button>
                  </div>
                </div>

                {/* Questions and Answers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.quizQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-blue-700 flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {q.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">{q.timeLimitSeconds}s</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.difficulty === 'hard'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-800">
                        {q.prompt}
                      </div>

                      {q.contextSentence && (
                        <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                          "{q.contextSentence}"
                        </div>
                      )}

                      {/* Analogy info if available */}
                      {q.analogyPair && (
                        <div className="text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                          Logic: {q.analogyPair.firstA} : {q.analogyPair.firstB} :: {q.analogyPair.secondC} : ? ({q.analogyPair.relationshipType})
                        </div>
                      )}

                      {/* Options with marked answer */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                            return (
                              <div
                                key={oIdx}
                                className={`p-1.5 px-2 rounded-lg text-xs flex items-center gap-1.5 border transition ${
                                  isCorrect
                                    ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <span className="font-mono text-[10px] text-slate-400">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <span className="truncate flex-1">{opt}</span>
                                {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Official Answer Box */}
                      <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 text-xs space-y-1">
                        <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Official DepEd Master Answer:
                        </div>
                        <div className="font-black text-sm text-emerald-900">
                          {q.answer}
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60">
                            <strong>Linguistic Rule:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DEEP-DIVE MODAL FOR SELECTED MODULE */}
      {/* ---------------------------------------------------- */}
      {activeModuleDetail?.pdfLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="PDF curriculum inspector">
          <div className="mx-auto max-w-5xl rounded-2xl bg-slate-50 p-5">
            <PdfLessonView key={activeModuleDetail.id} module={activeModuleDetail} initialSelfCheck onBack={() => setActiveModuleDetail(null)} onComplete={() => {}} />
          </div>
        </div>
      )}
      {activeModuleDetail && !activeModuleDetail.pdfLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scale-in">
            {/* Modal Header */}
            <div
              className="p-5 sm:p-6 text-white relative shrink-0"
              style={{
                backgroundColor: activeModuleDetail.islandThemeColor || '#1e3a8a',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/20">
                      Grade {activeModuleDetail.gradeLevel} • Quarter {activeModuleDetail.quarter}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/20 text-white/90">
                      Module #{activeModuleDetail.moduleNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white/90 text-[10px] font-bold">
                      Topic: {activeModuleDetail.topicType.toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
                    {activeModuleDetail.title}
                  </h2>

                  <div className="text-xs text-white/90 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5" /> {activeModuleDetail.islandName}
                    </span>
                    <span>•</span>
                    <span>Pass Criterion: {activeModuleDetail.requiredPassingScore}%</span>
                    <span>•</span>
                    <span>{activeModuleDetail.quizQuestions.length} Quiz Questions with Verified Answers</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyAnswerKey(activeModuleDetail)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                    title="Copy Answer Key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {isAdmin && onEditModule && (
                    <button
                      onClick={() => {
                        const mod = activeModuleDetail;
                        setActiveModuleDetail(null);
                        onEditModule(mod);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition flex items-center gap-1.5 shadow"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Module
                    </button>
                  )}

                  <button
                    onClick={() => setActiveModuleDetail(null)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-5 border-t border-white/20 pt-3">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setDetailModalTab('quiz_answers');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    detailModalTab === 'quiz_answers'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Master Quiz Answer Keys ({activeModuleDetail.quizQuestions.length})
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setDetailModalTab('lesson_content');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    detailModalTab === 'lesson_content'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Lesson Guide & Rules
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setDetailModalTab('printable_sheet');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    detailModalTab === 'printable_sheet'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Printable Answer Sheet
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: QUIZ QUESTIONS WITH DETAILED ANSWERS */}
              {detailModalTab === 'quiz_answers' && (
                <div className="space-y-6">
                  {/* Sub-filter by game type */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-500">Filter Game Mode:</span>
                      {([
                        { id: 'all', label: 'All 25 Quizzes' },
                        { id: 'analogyMaster', label: 'Master Quiz (5)' },
                        { id: 'missingPiece', label: 'Missing Piece (5)' },
                        { id: 'crosswordGame', label: 'Crossword (5)' },
                        { id: 'pictureHunt', label: 'Picture Hunt (5)' },
                        { id: 'typeHunter', label: 'Word Hunter (5)' },
                      ] as const).map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => {
                            soundFX.playClick();
                            setQuizTypeFilter(id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            quizTypeFilter === id
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">
                      Showing{' '}
                      {
                        activeModuleDetail.quizQuestions.filter(
                          (q) => quizTypeFilter === 'all' || q.type === quizTypeFilter
                        ).length
                      }{' '}
                      questions
                    </span>
                  </div>

                  {/* List of Questions */}
                  <div className="space-y-5">
                    {activeModuleDetail.quizQuestions
                      .filter((q) => quizTypeFilter === 'all' || q.type === quizTypeFilter)
                      .map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs space-y-3.5 relative"
                        >
                          {/* Question Top Bar */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-black uppercase tracking-wider text-blue-700 text-xs">
                                Game Type: {q.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {q.timeLimitSeconds}s
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  q.difficulty === 'easy'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : q.difficulty === 'hard'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {q.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Question Prompt */}
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                              Question Prompt:
                            </div>
                            <div className="text-sm font-bold text-slate-900 leading-snug">
                              {q.prompt}
                            </div>
                            {q.contextSentence && (
                              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                                Context Sentence: "{q.contextSentence}"
                              </div>
                            )}
                          </div>

                          {/* Analogy logic preview */}
                          {q.analogyPair && (
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs space-y-1">
                              <div className="font-black text-[10px] uppercase tracking-wider text-indigo-600">
                                Analogy Relationship ({q.analogyPair.relationshipType}):
                              </div>
                              <div className="font-bold text-sm">
                                {q.analogyPair.firstA} : {q.analogyPair.firstB} :: {q.analogyPair.secondC} : [?]
                              </div>
                            </div>
                          )}

                          {/* Options Breakdown with highlighted official answer */}
                          {q.options && q.options.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Multiple Choice Options:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const isCorrect = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-3 rounded-xl text-xs flex items-center justify-between border-2 transition ${
                                        isCorrect
                                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                                          }`}
                                        >
                                          {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <span>{opt}</span>
                                      </div>
                                      {isCorrect && (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                          <Check className="w-3 h-3" /> Correct Answer
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* MASTER OFFICIAL ANSWER BOX */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500/80 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Official DepEd Answer Key:
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                                Verified Master
                              </span>
                            </div>

                            <div className="text-base sm:text-lg font-black text-emerald-950 font-display">
                              {q.answer}
                            </div>

                            {q.explanation && (
                              <div className="pt-2 border-t border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                                <strong className="text-emerald-950">Pedagogical Explanation:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: LESSON CONTENT & CURRICULUM GUIDE */}
              {detailModalTab === 'lesson_content' && (
                <div className="space-y-6">
                  {/* MELC Competency */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                      DepEd Most Essential Learning Competency (MELC)
                    </div>
                    <div className="text-sm font-bold">
                      {activeModuleDetail.lessonContent?.melcCompetency}
                    </div>
                  </div>

                  {/* Overview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900">Lesson Overview & Core Instruction</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      {activeModuleDetail.lessonContent?.overview}
                    </p>
                  </div>

                  {/* Key Rules */}
                  {activeModuleDetail.lessonContent?.keyRules && activeModuleDetail.lessonContent.keyRules.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Core Linguistic & Grammatical Rules</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeModuleDetail.lessonContent.keyRules.map((rule, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2 shadow-xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {rIdx + 1}
                            </span>
                            <span className="text-xs text-slate-700 font-medium">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Guide Sections */}
                  {activeModuleDetail.lessonContent?.detailedGuideSections &&
                    activeModuleDetail.lessonContent.detailedGuideSections.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-900">Instructional Formulas & Structural Breakdown</h4>
                        <div className="space-y-3">
                          {activeModuleDetail.lessonContent.detailedGuideSections.map((sec, sIdx) => (
                            <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                              <h5 className="font-bold text-xs text-blue-800 uppercase tracking-wide">
                                {sec.heading}
                              </h5>
                              <p className="text-xs text-slate-700 leading-relaxed">{sec.content}</p>
                              {sec.formulaOrStructure && (
                                <div className="p-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-blue-900 font-bold">
                                  Structure: {sec.formulaOrStructure}
                                </div>
                              )}
                              {sec.signalWords && sec.signalWords.length > 0 && (
                                <div className="text-[11px] text-slate-600">
                                  <strong>Signal Words:</strong> {sec.signalWords.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Cultural Connection to Davao Oriental */}
                  {activeModuleDetail.lessonContent?.culturalConnection && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" /> Davao Oriental Regional Heritage Connection
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {activeModuleDetail.lessonContent.culturalConnection}
                      </p>
                    </div>
                  )}

                  {/* Examples */}
                  {activeModuleDetail.lessonContent?.examples && activeModuleDetail.lessonContent.examples.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Curriculum Model Examples & Analyses</h4>
                      <div className="space-y-2.5">
                        {activeModuleDetail.lessonContent.examples.map((ex, eIdx) => (
                          <div key={eIdx} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                            <div className="font-bold text-xs text-slate-900">{ex.title}</div>
                            <div className="text-xs text-blue-700 italic font-mono bg-blue-50/50 p-2 rounded-xl">
                              "{ex.example}"
                            </div>
                            <div className="text-[11px] text-slate-600">
                              <strong>Analysis:</strong> {ex.analysis}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary Glossary */}
                  {activeModuleDetail.lessonContent?.vocabularyGlossary &&
                    activeModuleDetail.lessonContent.vocabularyGlossary.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-900">Vocabulary Glossary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeModuleDetail.lessonContent.vocabularyGlossary.map((g, gIdx) => (
                            <div key={gIdx} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">{g.term}</span>
                                {g.partOfSpeech && (
                                  <span className="text-[10px] text-slate-400 italic font-serif">
                                    {g.partOfSpeech}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600">{g.definition}</p>
                              {g.exampleSentence && (
                                <p className="text-[10px] text-slate-500 italic">"{g.exampleSentence}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* TAB 3: PRINTABLE ANSWER SHEET */}
              {detailModalTab === 'printable_sheet' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-600">
                      Printable master answer key formatted for quick checking and curriculum records.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyAnswerKey(activeModuleDetail)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs border border-slate-300"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </button>
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Sheet
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-300 font-sans space-y-4 text-xs">
                    <div className="text-center border-b pb-3 border-slate-200 space-y-0.5">
                      <div className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                        Department of Education • Division of Davao Oriental
                      </div>
                      <div className="font-black text-slate-900 text-base">
                        LINGOQUEST MASTER QUIZ ANSWER SHEET
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        Grade {activeModuleDetail.gradeLevel} • Quarter {activeModuleDetail.quarter} • Module #{activeModuleDetail.moduleNumber}: {activeModuleDetail.title}
                      </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 text-slate-700 font-bold text-[11px]">
                          <th className="py-2 px-2 w-12 text-center">Item</th>
                          <th className="py-2 px-2 w-28">Game Mode</th>
                          <th className="py-2 px-2">Prompt / Item Description</th>
                          <th className="py-2 px-2 w-48 text-emerald-800 font-black">Official DepEd Answer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {activeModuleDetail.quizQuestions.map((q, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-2 text-center font-bold text-slate-600">
                              #{idx + 1}
                            </td>
                            <td className="py-2.5 px-2 font-mono text-[10px] text-slate-500 uppercase">
                              {q.type}
                            </td>
                            <td className="py-2.5 px-2 text-slate-800">
                              <span className="font-semibold">{q.prompt}</span>
                              {q.explanation && (
                                <span className="block text-[10px] text-slate-500 mt-0.5">
                                  Rule: {q.explanation}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 font-black text-emerald-700 bg-emerald-50/50">
                              {q.answer}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 font-medium">
                DepEd Davao Oriental Curriculum Registry • LingoQuest Archipelago
              </span>
              <div className="flex items-center gap-2">
                {onPreviewIslandMap && activeModuleDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      const targetG = activeModuleDetail.gradeLevel;
                      setActiveModuleDetail(null);
                      onPreviewIslandMap(targetG);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-slate-950" />
                    <span>Preview Grade {activeModuleDetail.gradeLevel} on Island Map</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveModuleDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
