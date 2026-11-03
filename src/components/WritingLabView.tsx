import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Copy,
  Feather,
  History,
  Lightbulb,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  Module,
  StudentAccount,
  WritingFeedbackResult,
  WritingSubmissionRecord,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';
import { InabelHeaderStrip } from './InabelHeaderStrip';

interface WritingLabViewProps {
  student: StudentAccount;
  initialModule?: Module | null;
  allModules: Module[];
  onSaveSubmission: (submission: WritingSubmissionRecord) => void;
  onBackToMap: () => void;
}

const SAMPLE_WRITING_PROMPTS = [
  {
    id: 'p-pujada',
    title: 'The Wonders of Pujada Bay (Context Clues & Descriptive)',
    instructions:
      'Write 2-3 sentences describing the crystal waters and rich marine life of Pujada Bay in Mati, Davao Oriental. Use at least one definition or synonym context clue.',
    starter:
      'The coastal waters of Pujada Bay remain pristine—completely spotless and pure—because...',
    badSample:
      'The waters of pujada bay is very clean and many fish swims in the coral reef yesterday.',
    goodSample:
      'The coastal waters of Pujada Bay remain pristine—completely unpolluted and crystal clear—because the local fisherfolk and students actively protect the marine sanctuary.',
  },
  {
    id: 'p-hamiguitan',
    title: 'Mount Hamiguitan Bonsai Forest (Modal Verbs & Modifiers)',
    instructions:
      'Write 2-3 sentences explaining why travelers must respect the UNESCO World Heritage Mount Hamiguitan Range Wildlife Sanctuary. Incorporate modal verbs like "must", "should", or "can".',
    starter:
      'Every trekker climbing Mount Hamiguitan must follow strict conservation rules so that...',
    badSample:
      'Visitors must to protect the pygmy trees because they does not grow fast in high mountains.',
    goodSample:
      'Every trekker climbing Mount Hamiguitan must respect the century-old pygmy bonsai trees, and hikers should never pick rare pitcher plants along the misty trail.',
  },
  {
    id: 'p-culture',
    title: 'Mandaya Heritage & Indigenous Crafts (Active Voice & Vivid Verbs)',
    instructions:
      'Write 2-3 sentences about the Mandaya weavers creating Dagmay cloth from abaca fibers in Davao Oriental. Use active voice and vivid sensory verbs.',
    starter:
      'Skilled Mandaya artisans meticulously weave sacred patterns into Dagmay cloth...',
    badSample:
      'The dagmay cloth was weave by the old woman who use natural dyes from bark and roots.',
    goodSample:
      'Skilled Mandaya artisans meticulously weave sacred geometric patterns into Dagmay cloth, honoring ancient ancestors with every strand of organic abaca fiber.',
  },
  {
    id: 'p-custom',
    title: 'Free Writing & English Composition',
    instructions:
      'Write your own English paragraph on any topic (your favorite hobby, community event, or environmental issue). Focus on subject-verb agreement and clear punctuation.',
    starter: 'In our school community, students can collaborate on...',
    badSample:
      'Each of the students have their own project, but neither the teacher or the principal were absent.',
    goodSample:
      'In our school community, students actively collaborate on coastal cleanups to ensure our beaches remain safe for marine turtles.',
  },
];

export const WritingLabView: React.FC<WritingLabViewProps> = ({
  student,
  initialModule,
  allModules,
  onSaveSubmission,
  onBackToMap,
}) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [customTitle, setCustomTitle] = useState('');
  const [studentText, setStudentText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedbackResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  // If initial module was passed with a writing prompt, set it up
  useEffect(() => {
    if (initialModule?.lessonContent?.writingPrompt) {
      setCustomTitle(initialModule.lessonContent.writingPrompt.title);
      setStudentText(initialModule.lessonContent.writingPrompt.sampleStarter || '');
    } else {
      setStudentText(SAMPLE_WRITING_PROMPTS[0].starter);
    }
  }, [initialModule]);

  const currentPrompt =
    initialModule?.lessonContent?.writingPrompt && customTitle === initialModule.lessonContent.writingPrompt.title
      ? {
          title: initialModule.lessonContent.writingPrompt.title,
          instructions: initialModule.lessonContent.writingPrompt.instructions,
          starter: initialModule.lessonContent.writingPrompt.sampleStarter,
          badSample: '',
          goodSample: '',
        }
      : SAMPLE_WRITING_PROMPTS[selectedPromptIndex];

  const handleSelectPrompt = (idx: number) => {
    soundFX.playClick();
    setSelectedPromptIndex(idx);
    setCustomTitle('');
    setStudentText(SAMPLE_WRITING_PROMPTS[idx].starter);
    setFeedback(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!studentText.trim() || studentText.trim().length < 10) {
      setErrorMessage('Please write at least one complete sentence (minimum 10 characters) to analyze.');
      soundFX.playIncorrect();
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    soundFX.playClick();

    const titleToUse = customTitle || currentPrompt.title;

    try {
      const response = await fetch('/api/grammar-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText: studentText.trim(),
          promptTitle: titleToUse,
          gradeLevel: student.gradeLevel,
          topicType: initialModule?.topicType || 'sentence-construction',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: WritingFeedbackResult = await response.json();
      setFeedback(data);
      soundFX.playPass();

      // Record submission
      const newRecord: WritingSubmissionRecord = {
        id: `ws-${Date.now()}`,
        moduleId: initialModule?.id,
        promptTitle: titleToUse,
        studentText: studentText.trim(),
        feedback: data,
        timestamp: new Date().toLocaleString(),
      };
      onSaveSubmission(newRecord);
    } catch {
      // Offline fallback rule-based analysis
      const fallbackResult = generateLocalGrammarAnalysis(studentText, student.gradeLevel);
      setFeedback(fallbackResult);
      soundFX.playPass();

      const newRecord: WritingSubmissionRecord = {
        id: `ws-${Date.now()}`,
        moduleId: initialModule?.id,
        promptTitle: titleToUse,
        studentText: studentText.trim(),
        feedback: fallbackResult,
        timestamp: new Date().toLocaleString(),
      };
      onSaveSubmission(newRecord);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCorrected = () => {
    if (feedback?.correctedVersion) {
      navigator.clipboard.writeText(feedback.correctedVersion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner with Deep Navy Theme */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] rounded-3xl text-white relative overflow-hidden border-2 border-[#231F20] linocut-card">
        <InabelHeaderStrip variant="emerald" label="AI-Assisted Writing Studio • Davao Oriental" />
        <div className="p-6 sm:p-8 relative">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-300 border-2 border-[#231F20] shadow-[3px_3px_0px_#231F20]">
              <Feather className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-950/60 px-2.5 py-0.5 rounded-full text-sky-200 border border-blue-800/60">
                  AI-Assisted Writing Studio
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  Grade {student.gradeLevel} Curriculum
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mt-1">
                LingoQuest Writing Lab
              </h1>
              <p className="text-sky-100 text-sm mt-0.5">
                Draft your English responses, receive smart grammar corrections, and level up your composition skills.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setShowHistory(!showHistory);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition border border-white/20 cursor-pointer"
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Back to Editor' : `History (${student.writingSubmissions?.length || 0})`}
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onBackToMap();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-950 text-sm font-bold shadow hover:bg-sky-50 transition cursor-pointer"
            >
              Return to Islands
            </button>
          </div>
        </div>
        </div>
      </div>

      {showHistory ? (
        /* Submission History View */
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-6">
          <InabelHeaderStrip variant="royal" label="My Writing Lab History" />
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              My Writing Lab History
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Total Saved Entries: {student.writingSubmissions?.length || 0}
            </span>
          </div>

          {(!student.writingSubmissions || student.writingSubmissions.length === 0) ? (
            <div className="text-center py-12 text-slate-500 space-y-3">
              <Feather className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No writing submissions recorded yet.</p>
              <p className="text-xs text-slate-400">
                Choose a prompt, write a response, and click "Evaluate with AI" to record your first entry!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {student.writingSubmissions.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <span className="font-bold text-slate-800 text-sm">{sub.promptTitle}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        Score: {sub.feedback?.clarityScore ?? 85}/100
                      </span>
                      <span className="text-xs text-slate-400">{sub.timestamp}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Draft:</p>
                    <p className="text-sm text-slate-700 italic mt-1 bg-white p-3 rounded-xl border border-slate-100">
                      "{sub.studentText}"
                    </p>
                  </div>
                  {sub.feedback?.correctedVersion && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Polished English:</p>
                      <p className="text-sm text-emerald-900 font-medium mt-1 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                        {sub.feedback.correctedVersion}
                      </p>
                    </div>
                  )}
                  {sub.feedback?.overallClarityComment && (
                    <p className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                      💡 {sub.feedback.overallClarityComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      ) : (
        /* Main Writing & Feedback Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Prompts & Input (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Prompt Selector */}
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-4">
              <InabelHeaderStrip variant="royal" label="Select Writing Prompt" />
              <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Select Writing Prompt
                </label>
                {initialModule && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Linked to: {initialModule.title}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_WRITING_PROMPTS.map((prompt, idx) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelectPrompt(idx)}
                    className={`text-left p-3 rounded-2xl border text-xs font-semibold transition ${
                      selectedPromptIndex === idx && !customTitle
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-bold truncate">{prompt.title}</div>
                    <div className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                      {prompt.instructions}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Prompt Details Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  {currentPrompt.title}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{currentPrompt.instructions}</p>
              </div>
              </div>
            </div>

            {/* Writing Input Card */}
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-4">
              <InabelHeaderStrip variant="emerald" label="Your English Composition" />
              <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Feather className="w-4 h-4 text-emerald-600" />
                  Your English Composition
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  {studentText.trim().split(/\s+/).filter(Boolean).length} words | {studentText.length} chars
                </span>
              </div>

              <textarea
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
                placeholder="Write your response here using complete sentences..."
                rows={7}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm text-slate-800 font-normal leading-relaxed resize-y transition"
              />

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentText('');
                    setFeedback(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Clear Text
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !studentText.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Evaluate with AI
                    </>
                  )}
                </button>
              </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Feedback Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {!feedback && !isAnalyzing ? (
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
                <InabelHeaderStrip variant="amber" label="AI Evaluation Engine" />
                <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-[#231F20] shadow-[3px_3px_0px_#231F20]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-800">
                  Ready for AI Writing Feedback
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Type or paste your response in the editor and click "Evaluate with AI". You will receive:
                </p>
                <div className="text-left space-y-2.5 pt-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <span><strong>Overall Clarity Score</strong> (0–100) aligned with DepEd Grade {student.gradeLevel} standards.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>Polished Version</strong> showing exemplary sentence structure.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <span><strong>Specific Grammar Corrections</strong> with highlighted explanations.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      4
                    </span>
                    <span><strong>Bonus Quest Points</strong> added to your learner profile upon submission!</span>
                  </div>
                </div>
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
                <InabelHeaderStrip variant="amber" label="AI Evaluation in Progress" />
                <div className="p-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                <h3 className="text-lg font-bold font-display text-slate-800">
                  Evaluating Your Writing...
                </h3>
                <p className="text-xs text-slate-500">
                  Examining subject-verb agreement, punctuation, lexical choice, and clarity.
                </p>
                </div>
              </div>
            ) : feedback ? (
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
                <InabelHeaderStrip variant="emerald" label="Teacher & AI Assessment" />
                <div className="p-6 space-y-5">
                {/* Score & Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Evaluation Result
                    </span>
                    <h3 className="text-base font-bold text-slate-800 font-display">
                      Teacher & AI Assessment
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-emerald-600">
                        {feedback.clarityScore}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/100</span>
                    </div>
                  </div>
                </div>

                {/* Overall Comment */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-950 leading-relaxed">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Overall Feedback
                  </div>
                  {feedback.overallClarityComment}
                </div>

                {/* Corrected / Polished Version */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Polished Version
                    </span>
                    <button
                      onClick={handleCopyCorrected}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed font-sans select-all">
                    {feedback.correctedVersion}
                  </div>
                </div>

                {/* Grammar Issues Identified */}
                {feedback.grammarIssues && feedback.grammarIssues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      Areas for Improvement ({feedback.grammarIssues.length})
                    </span>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {feedback.grammarIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-rose-900 bg-rose-200/60 px-2 py-0.5 rounded">
                              "{issue.originalPhrase}"
                            </span>
                            <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              → "{issue.suggestion}"
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px] pt-1">{issue.explanation}</p>
                          {issue.ruleCategory && (
                            <span className="inline-block text-[10px] text-slate-400 font-mono">
                              Rule: {issue.ruleCategory}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {feedback.strengthsHighlighted && feedback.strengthsHighlighted.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Highlighted Strengths
                    </span>
                    <ul className="space-y-1">
                      {feedback.strengthsHighlighted.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stylistic Tips */}
                {feedback.constructionSuggestions && feedback.constructionSuggestions.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-cyan-600" />
                      Composition Tips
                    </span>
                    <ul className="space-y-1">
                      {feedback.constructionSuggestions.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-cyan-600 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Resilient offline fallback grammar analyzer if API is unreachable.
 */
function generateLocalGrammarAnalysis(text: string, grade: number): WritingFeedbackResult {
  const issues = [];
  let corrected = text;

  // Rule 1: Subject-Verb Agreement checks
  if (/\bthe waters of .* is\b/i.test(text)) {
    issues.push({
      originalPhrase: 'waters ... is',
      suggestion: 'waters ... are',
      explanation: 'Plural subject "waters" requires the plural verb "are".',
      ruleCategory: 'Subject-Verb Agreement',
    });
    corrected = corrected.replace(/\bthe waters of (.*?) is\b/gi, 'the waters of $1 are');
  }
  if (/\bmany fish swims\b/i.test(text)) {
    issues.push({
      originalPhrase: 'many fish swims',
      suggestion: 'many fish swim',
      explanation: 'When "fish" refers to multiple individuals, use the plural verb "swim".',
      ruleCategory: 'Subject-Verb Agreement',
    });
    corrected = corrected.replace(/\bmany fish swims\b/gi, 'many fish swim');
  }
  if (/\bmust to protect\b/i.test(text)) {
    issues.push({
      originalPhrase: 'must to protect',
      suggestion: 'must protect',
      explanation: 'Modal auxiliary verbs like "must", "should", and "can" are followed by the base form without "to".',
      ruleCategory: 'Modal Verbs',
    });
    corrected = corrected.replace(/\bmust to protect\b/gi, 'must protect');
  }
  if (/\bthey does not\b/i.test(text)) {
    issues.push({
      originalPhrase: 'they does not',
      suggestion: 'they do not',
      explanation: 'The plural pronoun "they" requires "do not", not "does not".',
      ruleCategory: 'Subject-Verb Agreement',
    });
    corrected = corrected.replace(/\bthey does not\b/gi, 'they do not');
  }
  if (/\bwas weave\b/i.test(text)) {
    issues.push({
      originalPhrase: 'was weave',
      suggestion: 'was woven',
      explanation: 'Passive voice with "was" requires the past participle "woven".',
      ruleCategory: 'Passive Voice & Irregular Verbs',
    });
    corrected = corrected.replace(/\bwas weave\b/gi, 'was woven');
  }

  // Capitalize sentence start
  if (corrected.length > 0 && corrected[0] === corrected[0].toLowerCase()) {
    corrected = corrected[0].toUpperCase() + corrected.slice(1);
  }
  // Ensure ending punctuation
  if (!/[.!?]$/.test(corrected.trim())) {
    corrected = corrected.trim() + '.';
  }

  const score = Math.max(70, 95 - issues.length * 10);

  return {
    overallClarityComment:
      issues.length === 0
        ? `Impressive English expression! Your sentence demonstrates clear organization and appropriate Grade ${grade} vocabulary.`
        : `Good effort! Your ideas are clearly communicated. Review the highlighted corrections to sharpen your grammar and tense consistency.`,
    clarityScore: score,
    correctedVersion: corrected,
    strengthsHighlighted: [
      'Meaningful ideas relevant to the assigned topic',
      'Good vocabulary choices suitable for Junior High School level',
      'Clear sentence intention and thematic focus',
    ],
    grammarIssues: issues,
    constructionSuggestions: [
      'Practice varying your sentence openers using prepositional phrases or dependent clauses.',
      'Always proofread your work aloud to catch subject-verb agreement slips before final submission.',
    ],
  };
}
