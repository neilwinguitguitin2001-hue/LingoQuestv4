import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Filter,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { GradeLevel, Module, QuarterNumber, StudentAccount } from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';

interface CurriculumBottlenecksViewProps {
  students: StudentAccount[];
  modules: Module[];
  onSelectModuleForReview?: (module: Module) => void;
}

export interface ModuleBottleneckMetric {
  moduleId: string;
  moduleCode: string;
  moduleNumber: number;
  gradeLevel: GradeLevel;
  quarter: QuarterNumber;
  title: string;
  competencyCode?: string;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  passRate: number; // 0 to 100
  failRate: number; // 0 to 100
  avgScore: number;
  status: 'critical_bottleneck' | 'moderate_bottleneck' | 'proficient' | 'mastered';
  identifiedIssue: string;
  recommendedIntervention: string;
  isSimulatedBaseline: boolean;
}

// Curriculum bottleneck baseline heuristics for DepEd Davao Oriental English
const PIE_COLORS: Record<string, string> = {
  mastered: '#10b981', // Emerald
  proficient: '#0ea5e9', // Sky
  moderate_bottleneck: '#f59e0b', // Amber
  critical_bottleneck: '#f43f5e', // Rose
};

export const CurriculumBottlenecksView: React.FC<CurriculumBottlenecksViewProps> = ({
  students,
  modules,
  onSelectModuleForReview,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterNumber | 'all'>('all');
  const [bottleneckFilter, setBottleneckFilter] = useState<
    'all' | 'critical' | 'moderate' | 'passing'
  >('all');
  const [sortBy, setSortBy] = useState<'bottleneck_asc' | 'pass_desc' | 'attempts_desc' | 'grade_asc'>('bottleneck_asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartViewMode, setChartViewMode] = useState<'rates' | 'counts'>('rates');

  // Compute metrics for every module
  const moduleMetrics: ModuleBottleneckMetric[] = useMemo(() => {
    return modules.map((mod) => {
      // Gather real student attempts
      let passedAttempts = 0;
      let failedAttempts = 0;
      let totalAttempts = 0;
      let totalScoreSum = 0;

      students.forEach((student) => {
        const prog = student.progressByModule?.[mod.id];
        if (prog) {
          if (prog.quizHistory && prog.quizHistory.length > 0) {
            prog.quizHistory.forEach((att) => {
              totalAttempts++;
              totalScoreSum += att.percentage || 0;
              if (att.passed || att.percentage >= 75) {
                passedAttempts++;
              } else {
                failedAttempts++;
              }
            });
          } else if (prog.attemptsCount > 0) {
            const count = prog.attemptsCount;
            totalAttempts += count;
            const isPass = prog.isBridgeRestored || prog.bestScorePercent >= 75;
            if (isPass) {
              const passedCount = Math.max(1, count > 1 ? count - 1 : 1);
              passedAttempts += passedCount;
              failedAttempts += count - passedCount;
              totalScoreSum += prog.bestScorePercent * count;
            } else {
              failedAttempts += count;
              totalScoreSum += (prog.bestScorePercent || 50) * count;
            }
          }
        } else if (student.completedModules && student.completedModules.includes(mod.id)) {
          totalAttempts++;
          passedAttempts++;
          totalScoreSum += 85;
        }
      });

      // Check if we need to supplement with division baseline diagnostics
      
      let passRate: number;
      let failRate: number;
      let avgScore: number;
      let isSimulatedBaseline = false;

      if (totalAttempts >= 5) {
        // Sufficient empirical student attempts
        passRate = Math.round((passedAttempts / totalAttempts) * 100);
        failRate = 100 - passRate;
        avgScore = Math.round(totalScoreSum / totalAttempts);
      } else {
        // Keep modules with no learner submissions visible, but do not invent outcomes.
        passRate = 0;
        failRate = 0;
        avgScore = 0;
      }

      // Determine status
      let status: ModuleBottleneckMetric['status'];
      if (passRate >= 85) {
        status = 'mastered';
      } else if (passRate >= 75) {
        status = 'proficient';
      } else if (passRate >= 60) {
        status = 'moderate_bottleneck';
      } else {
        status = 'critical_bottleneck';
      }

      const issue = 'Review the recorded learner attempts for this PDF module.';
      const review = mod.pdfLesson?.guidedAnalysis[0];
      const intervention = review ? `PDF p. ${review.page}: ${review.text}` : 'Source review needed.';

      return {
        moduleId: mod.id,
        moduleCode: `G${mod.gradeLevel}-M${mod.moduleNumber}`,
        moduleNumber: mod.moduleNumber,
        gradeLevel: mod.gradeLevel,
        quarter: mod.quarter,
        title: mod.title,
        competencyCode: mod.lessonContent?.melcCompetency,
        totalAttempts,
        passedAttempts,
        failedAttempts,
        passRate,
        failRate,
        avgScore,
        status,
        identifiedIssue: issue,
        recommendedIntervention: intervention,
        isSimulatedBaseline,
      };
    });
  }, [students, modules]);

  // Filtered and sorted data
  const filteredMetrics = useMemo(() => {
    return moduleMetrics
      .filter((m) => {
        if (selectedGrade !== 'all' && m.gradeLevel !== selectedGrade) return false;
        if (selectedQuarter !== 'all' && m.quarter !== selectedQuarter) return false;
        if (bottleneckFilter === 'critical' && m.status !== 'critical_bottleneck') return false;
        if (bottleneckFilter === 'moderate' && m.status !== 'moderate_bottleneck') return false;
        if (bottleneckFilter === 'passing' && m.status !== 'proficient' && m.status !== 'mastered') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchCode = m.moduleCode.toLowerCase().includes(q);
          const matchComp = m.competencyCode?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchCode && !matchComp) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'bottleneck_asc') return a.passRate - b.passRate; // lowest pass rate first
        if (sortBy === 'pass_desc') return b.passRate - a.passRate; // highest pass rate first
        if (sortBy === 'attempts_desc') return b.totalAttempts - a.totalAttempts;
        // grade_asc
        if (a.gradeLevel !== b.gradeLevel) return a.gradeLevel - b.gradeLevel;
        return a.moduleNumber - b.moduleNumber;
      });
  }, [moduleMetrics, selectedGrade, selectedQuarter, bottleneckFilter, sortBy, searchQuery]);

  // Overall KPI statistics
  const overallKPIs = useMemo(() => {
    const totalModules = moduleMetrics.length;
    const criticalCount = moduleMetrics.filter((m) => m.status === 'critical_bottleneck').length;
    const moderateCount = moduleMetrics.filter((m) => m.status === 'moderate_bottleneck').length;
    const bottleneckCount = criticalCount + moderateCount;
    const totalPassed = moduleMetrics.reduce((sum, m) => sum + m.passedAttempts, 0);
    const totalAttempts = moduleMetrics.reduce((sum, m) => sum + m.totalAttempts, 0);
    const overallPassRate = totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0;

    // Worst bottleneck module
    const worstBottleneck = [...moduleMetrics].sort((a, b) => a.passRate - b.passRate)[0] || null;

    // Grade breakdown
    const gradeBreakdown = ([7, 8, 9, 10] as GradeLevel[]).map((g) => {
      const gMods = moduleMetrics.filter((m) => m.gradeLevel === g);
      const gPassed = gMods.reduce((s, m) => s + m.passedAttempts, 0);
      const gTotal = gMods.reduce((s, m) => s + m.totalAttempts, 0);
      const gRate = gTotal > 0 ? Math.round((gPassed / gTotal) * 100) : 0;
      const gBottlenecks = gMods.filter((m) => m.passRate < 75).length;
      return { grade: `Grade ${g}`, passRate: gRate, bottlenecks: gBottlenecks, modulesCount: gMods.length };
    });

    // Health distribution pie data
    const healthDistribution = [
      { name: 'Critical Bottleneck (<60%)', value: criticalCount, status: 'critical_bottleneck' },
      { name: 'Moderate Bottleneck (60-74%)', value: moderateCount, status: 'moderate_bottleneck' },
      {
        name: 'Proficient (75-84%)',
        value: moduleMetrics.filter((m) => m.status === 'proficient').length,
        status: 'proficient',
      },
      {
        name: 'Mastered (85%+)',
        value: moduleMetrics.filter((m) => m.status === 'mastered').length,
        status: 'mastered',
      },
    ].filter((item) => item.value > 0);

    return {
      totalModules,
      criticalCount,
      moderateCount,
      bottleneckCount,
      totalAttempts,
      overallPassRate,
      worstBottleneck,
      gradeBreakdown,
      healthDistribution,
    };
  }, [moduleMetrics]);

  // Chart dataset formatted for Recharts
  const chartData = useMemo(() => {
    return filteredMetrics.map((m) => ({
      name: m.moduleCode,
      fullName: m.title,
      grade: `Grade ${m.gradeLevel}`,
      quarter: `Q${m.quarter}`,
      passRate: m.passRate,
      failRate: m.failRate,
      passedAttempts: m.passedAttempts,
      failedAttempts: m.failedAttempts,
      totalAttempts: m.totalAttempts,
      avgScore: m.avgScore,
      status: m.status,
      issue: m.identifiedIssue,
    }));
  }, [filteredMetrics]);

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* HEADER BANNER: Curriculum Bottleneck & Pass/Fail Rate Analytics */}
      {/* ================================================================ */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[11px] font-black uppercase tracking-wider mb-2">
                <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
                Division Curriculum Quality Assurance & Analytics
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2.5">
                Curriculum Bottlenecks & Pass/Fail Rate Analyzer
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1 leading-relaxed">
                Empirical diagnostic analytics across all grade levels (Grades 7–10). Identifies learning competencies where students encounter cognitive bottlenecks below the DepEd 75% mastery standard.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[170px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 block">
                Division Pass Rate
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {overallKPIs.overallPassRate}%
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black mt-1 ${
                  overallKPIs.overallPassRate >= 75
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                {overallKPIs.overallPassRate >= 75 ? 'Meets DepEd Standard (≥75%)' : 'Needs Division Intervention'}
              </span>
            </div>
          </div>

          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-sky-200 flex items-center gap-1.5 font-semibold">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                Total Curriculum Modules
              </span>
              <div className="text-xl font-black text-white mt-1">
                {overallKPIs.totalModules}
              </div>
              <span className="text-[10px] text-slate-300">Across Grades 7, 8, 9 & 10</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-rose-200 flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Bottleneck Modules
              </span>
              <div className="text-xl font-black text-rose-300 mt-1">
                {overallKPIs.bottleneckCount}
                <span className="text-xs font-normal text-rose-200/80 ml-1">
                  ({Math.round((overallKPIs.bottleneckCount / overallKPIs.totalModules) * 100)}%)
                </span>
              </div>
              <span className="text-[10px] text-rose-200/70">
                {overallKPIs.criticalCount} Critical (&lt;60%) • {overallKPIs.moderateCount} Moderate (60-74%)
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-emerald-200 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Total Quiz Assessments
              </span>
              <div className="text-xl font-black text-emerald-300 mt-1">
                {overallKPIs.totalAttempts.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-200/70">Evaluated attempt records</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-amber-200 flex items-center gap-1.5 font-semibold">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                Highest Priority Bottleneck
              </span>
              <div className="text-sm font-bold text-amber-300 mt-1 truncate">
                {overallKPIs.worstBottleneck ? overallKPIs.worstBottleneck.moduleCode : 'None'}
              </div>
              <span className="text-[10px] text-amber-200/70 truncate block">
                {overallKPIs.worstBottleneck
                  ? `${overallKPIs.worstBottleneck.passRate}% Pass Rate — ${overallKPIs.worstBottleneck.title}`
                  : 'All modules performing adequately'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTER & CONTROL TOOLBAR */}
      {/* ================================================================ */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Row: Grade Filter & Chart Mode */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Grade Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Grade:
            </span>
            {[
              { label: 'All Grades (7-10)', value: 'all' },
              { label: 'Grade 7', value: 7 },
              { label: 'Grade 8', value: 8 },
              { label: 'Grade 9', value: 9 },
              { label: 'Grade 10', value: 10 },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSelectedGrade(tab.value as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedGrade === tab.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Display Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setChartViewMode('rates');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                chartViewMode === 'rates'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pass / Fail Rate (%)
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setChartViewMode('counts');
              }}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                chartViewMode === 'counts'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attempts Volume (Count)
            </button>
          </div>
        </div>

        {/* Second Row: Quarter, Bottleneck Filter, Search & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Quarter Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Quarter
            </label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as QuarterNumber))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Quarters (Q1 - Q4)</option>
              <option value="1">Quarter 1</option>
              <option value="2">Quarter 2</option>
              <option value="3">Quarter 3</option>
              <option value="4">Quarter 4</option>
            </select>
          </div>

          {/* Bottleneck Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bottleneck Status
            </label>
            <select
              value={bottleneckFilter}
              onChange={(e) => setBottleneckFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules ({filteredMetrics.length})</option>
              <option value="critical">Critical Bottlenecks (&lt;60% Pass Rate)</option>
              <option value="moderate">Moderate Bottlenecks (60-74% Pass Rate)</option>
              <option value="passing">Proficient &amp; Mastered (≥75% DepEd Standard)</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort Sequence
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bottleneck_asc">Bottlenecks First (Lowest Pass Rate)</option>
              <option value="pass_desc">Highest Pass Rate First</option>
              <option value="grade_asc">Curriculum Order (Grade &amp; Module #)</option>
              <option value="attempts_desc">Most Assessment Attempts</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Competency / Topic
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Analogy, Voice, Modals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* PRIMARY RECHARTS VISUALIZATION: PASS/FAIL RATE PER MODULE */}
      {/* ================================================================ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              {chartViewMode === 'rates'
                ? 'Module Pass Rate vs. Fail Rate (%)'
                : 'Module Assessment Volume: Passed vs. Failed Attempts'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Displays performance across all curriculum modules. The dashed line marks the official DepEd 75% passing standard.
            </p>
          </div>

          {/* Color Legend Badge */}
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Passed Rate (≥75% Target)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Fail / Bottleneck Rate
            </span>
          </div>
        </div>

        {/* Chart Container */}
        {chartData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Filter className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-xs text-slate-600">No modules match current filter settings</p>
            <p className="text-[11px] text-slate-400">Try adjusting the grade or bottleneck filters above.</p>
          </div>
        ) : (
          <div className="w-full h-[380px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'rates' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      const isBottleneck = d.passRate < 75;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 max-w-xs border border-slate-700">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-sky-300 font-mono text-[11px]">
                              {d.name} • {d.grade} ({d.quarter})
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                isBottleneck
                                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {isBottleneck ? 'Bottleneck' : 'Proficient'}
                            </span>
                          </div>
                          <div className="font-bold text-white leading-tight">
                            {d.fullName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-[11px]">
                            <div className="text-emerald-400">
                              Pass Rate: <strong>{d.passRate}%</strong> ({d.passedAttempts})
                            </div>
                            <div className="text-rose-400">
                              Fail Rate: <strong>{d.failRate}%</strong> ({d.failedAttempts})
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                            <strong>Diagnostic:</strong> {d.issue}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 700 }}
                  />
                  <ReferenceLine
                    y={75}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'DepEd 75% Standard',
                      fill: '#2563eb',
                      fontSize: 11,
                      fontWeight: 800,
                      position: 'top',
                    }}
                  />
                  <Bar
                    dataKey="passRate"
                    name="Pass Rate (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.passRate >= 85
                            ? '#10b981' // emerald-500
                            : entry.passRate >= 75
                            ? '#0ea5e9' // sky-500
                            : entry.passRate >= 60
                            ? '#f59e0b' // amber-500
                            : '#f43f5e' // rose-500
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 max-w-xs border border-slate-700">
                          <div className="font-bold text-sky-300 font-mono text-[11px]">
                            {d.name} • {d.fullName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <span className="text-emerald-400">Passed: {d.passedAttempts}</span>
                            <span className="text-rose-400">Failed: {d.failedAttempts}</span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-bold">
                            Total Attempts: {d.totalAttempts} (Pass Rate: {d.passRate}%)
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 700 }}
                  />
                  <Bar
                    dataKey="passedAttempts"
                    name="Passed Attempts"
                    fill="#10b981"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="failedAttempts"
                    name="Failed Attempts"
                    fill="#f43f5e"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SECONDARY ROW: GRADE LEVEL BREAKDOWN & BOTTLENECK CLASSIFICATION */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade-Level Comparison Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Grade-Level Mastery Comparison Across Davao Oriental
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Average curriculum pass rate by grade level compared against the 75% minimum competency benchmark.
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overallKPIs.gradeBreakdown}
                margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% Average Pass Rate (${item.payload.bottlenecks} Bottlenecks in ${item.payload.modulesCount} modules)`,
                    'Performance',
                  ]}
                />
                <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5} />
                <Bar dataKey="passRate" name="Average Pass Rate (%)" radius={[8, 8, 0, 0]}>
                  {overallKPIs.gradeBreakdown.map((entry, index) => (
                    <Cell
                      key={`grade-cell-${index}`}
                      fill={entry.passRate >= 75 ? '#0ea5e9' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
            {overallKPIs.gradeBreakdown.map((g) => (
              <div key={g.grade} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-xs text-slate-700">{g.grade}</span>
                <div
                  className={`text-lg font-black mt-0.5 ${
                    g.passRate >= 75 ? 'text-blue-600' : 'text-rose-600'
                  }`}
                >
                  {g.passRate}%
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {g.bottlenecks} {g.bottlenecks === 1 ? 'bottleneck' : 'bottlenecks'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Curriculum Health Distribution
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of curriculum units by cognitive mastery level.
            </p>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallKPIs.healthDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {overallKPIs.healthDistribution.map((entry, index) => (
                    <Cell
                      key={`pie-${index}`}
                      fill={PIE_COLORS[entry.status] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => [`${value} modules`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Legend */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Critical Bottlenecks (&lt;60%)
              </span>
              <span className="font-black">{overallKPIs.criticalCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Moderate Bottlenecks (60-74%)
              </span>
              <span className="font-black">{overallKPIs.moderateCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-800">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Proficient &amp; Mastered (≥75%)
              </span>
              <span className="font-black">
                {overallKPIs.totalModules - overallKPIs.bottleneckCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ACTIONABLE BOTTLENECK ROSTER & INTERVENTION MATRIX removed */}
      {false && (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Curriculum Remediation &amp; Pedagogical Intervention Matrix
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific diagnostic findings and recommended interventions to resolve student bottlenecks before quarterly assessments.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Showing {filteredMetrics.length} of {moduleMetrics.length} modules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-28">Module Code</th>
                <th className="py-3.5 px-4">Topic / Competency</th>
                <th className="py-3.5 px-3 text-center">Grade &amp; Qtr</th>
                <th className="py-3.5 px-3 text-center">Attempts</th>
                <th className="py-3.5 px-4 w-44">Pass / Fail Ratio</th>
                <th className="py-3.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No curriculum modules found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((m) => {
                  const isBottleneck = m.status === 'critical_bottleneck' || m.status === 'moderate_bottleneck';
                  return (
                    <tr
                      key={m.moduleId}
                      className={`transition ${
                        m.status === 'critical_bottleneck'
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : m.status === 'moderate_bottleneck'
                          ? 'bg-amber-50/30 hover:bg-amber-50/60'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isBottleneck ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <span>{m.moduleCode}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{m.title}</div>
                        {m.competencyCode && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            DepEd Code: {m.competencyCode}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          Grade {m.gradeLevel} • Q{m.quarter}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                        {m.totalAttempts}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={isBottleneck ? 'text-rose-600' : 'text-emerald-600'}>
                              {m.passRate}% Pass
                            </span>
                            <span className="text-slate-400 font-normal">
                              {m.passedAttempts}P / {m.failedAttempts}F
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                            <div
                              style={{ width: `${m.passRate}%` }}
                              className={
                                m.status === 'mastered'
                                  ? 'bg-emerald-500'
                                  : m.status === 'proficient'
                                  ? 'bg-sky-500'
                                  : m.status === 'moderate_bottleneck'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }
                            />
                            <div
                              style={{ width: `${m.failRate}%` }}
                              className="bg-rose-200"
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {m.status === 'critical_bottleneck' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            Critical Bottleneck
                          </span>
                        )}
                        {m.status === 'moderate_bottleneck' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            Moderate Bottleneck
                          </span>
                        )}
                        {m.status === 'proficient' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-300">
                            Proficient (≥75%)
                          </span>
                        )}
                        {m.status === 'mastered' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Mastered (≥85%)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs space-y-1 max-w-sm">
                        <div className="text-slate-700 leading-snug">
                          <strong>Cognitive Issue:</strong> {m.identifiedIssue}
                        </div>
                        <div className="text-blue-700 font-semibold text-[11px] leading-snug bg-blue-50/80 p-1.5 rounded-lg border border-blue-100">
                          💡 <strong>Intervention:</strong> {m.recommendedIntervention}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {onSelectModuleForReview && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = modules.find((mod) => mod.id === m.moduleId);
                              if (found) onSelectModuleForReview(found);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                          >
                            Review Unit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
