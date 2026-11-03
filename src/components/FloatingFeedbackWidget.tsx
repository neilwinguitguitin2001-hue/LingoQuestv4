import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import {
  FeedbackCategory,
  FeedbackPriority,
  GradeLevel,
  StudentAccount,
  SystemFeedbackRecord,
  TeacherAccount,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';

interface FloatingFeedbackWidgetProps {
  currentUser: StudentAccount | TeacherAccount;
  feedbackItems: SystemFeedbackRecord[];
  onSubmitFeedback: (payload: {
    category: FeedbackCategory;
    priority: FeedbackPriority;
    targetArea: string;
    subject: string;
    message: string;
  }) => Promise<SystemFeedbackRecord>;
}

interface FaqItem {
  id: string;
  audience: 'student' | 'teacher' | 'both';
  categoryLabel: string;
  question: string;
  answer: string;
}

const LINGOQUEST_FAQS: FaqItem[] = [
  {
    id: 'faq-stu-1',
    audience: 'student',
    categoryLabel: 'Island Quests & Bridges',
    question: 'How do I restore a broken Island Bridge and unlock the next module?',
    answer:
      'First, complete the Interactive Lesson for your current module (+50 pts). Then launch the 25-Item Gamified Quiz and achieve a score of at least 80% (20 out of 25 correct). Passing with 80% or higher permanently restores the Island Bridge (+120 bonus pts) and unlocks the next module in your quarter!',
  },
  {
    id: 'faq-stu-2',
    audience: 'student',
    categoryLabel: 'Class Code & Enrollment',
    question: 'Why does my account say "Enrollment Awaiting Teacher Review" after signing up?',
    answer:
      'When you register using your English teacher’s Unique Class Code (e.g., LQ-ENG-8492), your teacher verifies your 12-digit DepEd LRN, grade level, and section to keep the official class masterlist accurate. You also receive a Confirmation Email that you can use to log in right away once approved.',
  },
  {
    id: 'faq-stu-3',
    audience: 'student',
    categoryLabel: 'AI Writing Lab',
    question: 'How does the AI Writing Lab help improve my English grammar?',
    answer:
      'In the Writing Lab, select a curriculum prompt for your grade level and write your response. Click "Get AI Coach Feedback" to receive instant, encouraging suggestions on grammar, sentence construction, modal verbs, cohesive devices, and a suggested revision (+100 pts per saved submission).',
  },
  {
    id: 'faq-stu-4',
    audience: 'student',
    categoryLabel: 'Quizzes & Game Modes',
    question: 'Can I retake a quiz if I score below 80%?',
    answer:
      'Yes! You can review the lesson examples and retake the quiz as many times as needed. Each module includes 5 interactive game modes: WordScapes Vocabulary, Picture Hunt, Analogy Quest, Sentence Builder, and Reading Comprehension.',
  },
  {
    id: 'faq-tch-1',
    audience: 'teacher',
    categoryLabel: 'Class Codes & Student Roster',
    question: 'How do students join my class roster on LingoQuest?',
    answer:
      'Share your activated Unique Class Code (displayed at the top of your Teacher Portal and in your Admin Approval Confirmation Email) with your students. When students sign up with your Class Code, they appear in your Pending Enrollment Queue for 1-click verification.',
  },
  {
    id: 'faq-tch-2',
    audience: 'teacher',
    categoryLabel: 'Multi-Grade Class Codes',
    question: 'Can I manage multiple grade levels (e.g., Grade 7 and Grade 8) under my faculty account?',
    answer:
      'Yes! In your Teacher Portal, you can filter your roster by Grade Level and Section, and assign or copy grade-specific Class Codes so learners are automatically organized into their respective grade levels.',
  },
  {
    id: 'faq-tch-3',
    audience: 'teacher',
    categoryLabel: 'Curriculum Bottlenecks',
    question: 'How do I identify which DepEd MELC modules my students are struggling with?',
    answer:
      'Open the "Curriculum Bottlenecks & Analytics" section in your Teacher Dashboard. It highlights modules with high attempt counts or average scores below the 80% mastery threshold so you can conduct targeted classroom remediation.',
  },
  {
    id: 'faq-both-1',
    audience: 'both',
    categoryLabel: 'Account & Email Confirmation',
    question: 'How do I recover my password or use my Confirmation Email to sign in?',
    answer:
      'Click "Forgot Password?" on the Sign-In screen to reset your password using your registered email and LRN/Employee ID, or click "Confirmation Emails" in the top bar to open your DepEd LingoQuest confirmation email and log in with one click.',
  },
];

const TARGET_AREAS_STUDENT = [
  'Island Map & Bridges',
  'Lesson & Quiz Game',
  'AI Writing Lab',
  'Badges & Leaderboard',
  'Class Code & Enrollment',
  'Student Profile & Credentials',
  'General System',
];

const TARGET_AREAS_TEACHER = [
  'Teacher Roster & Analytics',
  'Student Enrollment Verification',
  'Class Code Management',
  'Curriculum Modules & Quizzes',
  'AI Writing Submissions Review',
  'Faculty Profile & Credentials',
  'General System',
];

export const FloatingFeedbackWidget: React.FC<FloatingFeedbackWidgetProps> = ({
  currentUser,
  feedbackItems,
  onSubmitFeedback,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SUBMIT' | 'FAQ' | 'MY_TICKETS'>('SUBMIT');

  // Form states
  const [category, setCategory] = useState<FeedbackCategory>('bug_report');
  const [priority, setPriority] = useState<FeedbackPriority>('medium');
  const [targetArea, setTargetArea] = useState<string>(
    currentUser.role === 'teacher' ? 'Teacher Roster & Analytics' : 'Lesson & Quiz Game'
  );
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<SystemFeedbackRecord | null>(null);
  const [formError, setFormError] = useState('');

  // FAQ states
  const [faqSearch, setFaqSearch] = useState('');
  const [faqFilter, setFaqFilter] = useState<'all' | 'student' | 'teacher'>(
    currentUser.role === 'teacher' ? 'teacher' : 'student'
  );
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(
    currentUser.role === 'teacher' ? 'faq-tch-1' : 'faq-stu-1'
  );

  // User's own submitted feedback records
  const myFeedback = useMemo(() => {
    return feedbackItems.filter((item) => item.userId === currentUser.id);
  }, [feedbackItems, currentUser.id]);

  const repliedTicketsCount = useMemo(() => {
    return myFeedback.filter((item) => Boolean(item.adminResponse)).length;
  }, [myFeedback]);

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    return LINGOQUEST_FAQS.filter((item) => {
      if (faqFilter !== 'all' && item.audience !== 'both' && item.audience !== faqFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [faqSearch, faqFilter]);

  const handleOpenModal = (initialTab: 'SUBMIT' | 'FAQ' | 'MY_TICKETS' = 'SUBMIT') => {
    soundFX.playClick();
    setActiveTab(initialTab);
    setSubmitSuccess(null);
    setFormError('');
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (subject.trim().length < 4) {
      setFormError('Please provide a clear subject or title (at least 4 characters).');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please describe your bug report, feature request, or comment in at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onSubmitFeedback({
        category,
        priority,
        targetArea,
        subject: subject.trim(),
        message: message.trim(),
      });
      soundFX.playPass();
      setSubmitSuccess(created);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit feedback right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTargetAreas =
    currentUser.role === 'teacher' ? TARGET_AREAS_TEACHER : TARGET_AREAS_STUDENT;

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenModal('FAQ')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#0B1E36]/95 hover:bg-[#122C4F] text-sky-200 border border-sky-400/30 shadow-xl text-xs font-bold transition cursor-pointer backdrop-blur-md"
            title="View LingoQuest Help & FAQs"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Help & FAQs</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('SUBMIT')}
            className="group relative inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-900/30 border border-sky-300/40 transition-all cursor-pointer"
            title="Report a Bug, Request a Feature, or Send Feedback to Admin Console"
          >
            <MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 transition-transform group-hover:scale-110" />
            <span>Feedback &amp; Support</span>
            {repliedTicketsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-slate-950">
                {repliedTicketsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Feedback, Bug Report & Help Center Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#07172C] via-[#0E294B] to-[#173D6E] text-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                    <MessageSquarePlus className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                      DepEd Davao Oriental · Direct Admin Support Line
                    </div>
                    <h2 className="text-lg sm:text-xl font-display font-black tracking-tight text-white">
                      Feedback, Bug Reports &amp; Help Center
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Signed in as <strong className="text-white">{currentUser.name}</strong> (
                      {currentUser.role === 'teacher'
                        ? `Teacher · ${currentUser.classCode}`
                        : `Grade ${(currentUser as StudentAccount).gradeLevel} Learner`}
                      )
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
                  aria-label="Close Feedback Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Segmented Navigation Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#061224]/80 border border-white/10 rounded-2xl mt-5">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab('SUBMIT');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'SUBMIT'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Feedback</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab('FAQ');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'FAQ'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>FAQs &amp; Guide</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab('MY_TICKETS');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'MY_TICKETS'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>My Submissions ({myFeedback.length})</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[72vh] overflow-y-auto">
              {/* ========================================================= */}
              {/* TAB 1: SUBMIT BUG REPORT, FEATURE REQUEST OR COMMENT      */}
              {/* ========================================================= */}
              {activeTab === 'SUBMIT' && (
                <div className="space-y-5">
                  {submitSuccess ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Sent Directly to Division Admin Console
                        </div>
                        <h3 className="text-lg font-display font-black text-slate-900">
                          Thank You for Your Feedback!
                        </h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                          Your submission <strong>“{submitSuccess.subject}”</strong> has been logged in the Admin Support Console. You can track official Admin replies anytime under the <strong>My Submissions</strong> tab.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setSubmitSuccess(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                        >
                          Submit Another Report
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setActiveTab('MY_TICKETS');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          View My Submissions ({myFeedback.length})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      {formError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{formError}</span>
                        </div>
                      )}

                      {/* Feedback Type Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          What would you like to send to the Admin Console?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setCategory('bug_report');
                            }}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                              category === 'bug_report'
                                ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Bug
                              className={`w-4 h-4 mb-1.5 ${
                                category === 'bug_report' ? 'text-rose-600' : 'text-slate-400'
                              }`}
                            />
                            <div className="text-xs font-bold">Report a Bug</div>
                            <div className="text-[10px] opacity-75">Glitch or error</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setCategory('feature_request');
                            }}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                              category === 'feature_request'
                                ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Lightbulb
                              className={`w-4 h-4 mb-1.5 ${
                                category === 'feature_request' ? 'text-amber-600' : 'text-slate-400'
                              }`}
                            />
                            <div className="text-xs font-bold">Feature Idea</div>
                            <div className="text-[10px] opacity-75">New tool or mode</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setCategory('general_comment');
                            }}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                              category === 'general_comment'
                                ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <MessageSquare
                              className={`w-4 h-4 mb-1.5 ${
                                category === 'general_comment' ? 'text-sky-600' : 'text-slate-400'
                              }`}
                            />
                            <div className="text-xs font-bold">Comment</div>
                            <div className="text-[10px] opacity-75">System feedback</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setCategory('help_inquiry');
                            }}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                              category === 'help_inquiry'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <HelpCircle
                              className={`w-4 h-4 mb-1.5 ${
                                category === 'help_inquiry' ? 'text-indigo-600' : 'text-slate-400'
                              }`}
                            />
                            <div className="text-xs font-bold">Ask Help</div>
                            <div className="text-[10px] opacity-75">Admin assistance</div>
                          </button>
                        </div>
                      </div>

                      {/* Target System Area & Priority */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Related System Area
                          </label>
                          <select
                            value={targetArea}
                            onChange={(e) => setTargetArea(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white outline-none"
                          >
                            {availableTargetAreas.map((area) => (
                              <option key={area} value={area}>
                                {area}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Priority / Urgency Level
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                            {(['low', 'medium', 'high'] as FeedbackPriority[]).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setPriority(lvl)}
                                className={`py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                                  priority === lvl
                                    ? lvl === 'high'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : lvl === 'medium'
                                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                                      : 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Subject / Short Summary <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={
                            category === 'bug_report'
                              ? 'e.g., Quiz timer froze on Question 14 in Module 2'
                              : category === 'feature_request'
                              ? 'e.g., Add downloadable PDF certificate for completed quarters'
                              : 'e.g., Feedback on Grade 8 Afro-Asian Literature stories'
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:border-blue-500 outline-none"
                        />
                      </div>

                      {/* Detailed Message */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Detailed Description or Comment <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={
                            category === 'bug_report'
                              ? 'Describe what happened, which module or screen you were on, and what you expected to happen...'
                              : category === 'feature_request'
                              ? 'Describe the feature you would like to see and how it would help students or teachers...'
                              : 'Share your comments, suggestions, or questions for the Division Admin team...'
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:border-blue-500 outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          Routed directly to the DepEd Davao Oriental Admin Console
                        </span>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Sending to Admin...' : 'Submit to Admin Console'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: HELP CENTER & FREQUENTLY ASKED QUESTIONS           */}
              {/* ========================================================= */}
              {activeTab === 'FAQ' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={faqSearch}
                        onChange={(e) => setFaqSearch(e.target.value)}
                        placeholder="Search FAQs (e.g., bridge, class code, 80%, writing lab)..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => setFaqFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          faqFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFaqFilter('student')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          faqFilter === 'student'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Students
                      </button>
                      <button
                        type="button"
                        onClick={() => setFaqFilter('teacher')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          faqFilter === 'teacher'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Teachers
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {filteredFaqs.map((faq) => {
                      const isExpanded = expandedFaqId === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setExpandedFaqId(isExpanded ? null : faq.id);
                            }}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-100/80 transition cursor-pointer"
                          >
                            <div className="space-y-1">
                              <div className="text-[11px] font-semibold text-blue-700">
                                {faq.categoryLabel}
                                <span aria-hidden="true"> · </span>
                                <span className="text-slate-500 capitalize">
                                  {faq.audience === 'both' ? 'All Users' : `${faq.audience} Guide`}
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900">
                                {faq.question}
                              </div>
                            </div>
                            <div className="text-slate-400 shrink-0 mt-1">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-sky-950">
                      <strong>Didn’t find what you were looking for?</strong> Send a question or comment directly to the Division Administrator.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setCategory('help_inquiry');
                        setActiveTab('SUBMIT');
                      }}
                      className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Ask Admin Support
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: MY SUBMITTED TICKETS & ADMIN RESPONSES             */}
              {/* ========================================================= */}
              {activeTab === 'MY_TICKETS' && (
                <div className="space-y-3">
                  {myFeedback.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-sm font-bold text-slate-700">
                        No Submitted Feedback Yet
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        When you report a bug, request a feature, or send a system comment, it will appear here along with official responses from the Division Admin.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('SUBMIT')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Create First Submission
                      </button>
                    </div>
                  ) : (
                    myFeedback.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <div>
                            <span className="font-bold text-slate-700 capitalize">
                              {item.category.replace('_', ' ')}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{item.targetArea}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{item.createdAt}</span>
                          </div>
                          <span
                            className={`font-bold uppercase text-[11px] ${
                              item.status === 'resolved'
                                ? 'text-emerald-700'
                                : item.status === 'in_review'
                                ? 'text-amber-700'
                                : 'text-blue-700'
                            }`}
                          >
                            Status: {item.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                        {item.adminResponse && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>
                                Admin Console Response ({item.respondedBy || 'Division Admin'})
                              </span>
                              {item.respondedAt && (
                                <span className="text-[11px] font-normal text-emerald-700">
                                  · {item.respondedAt}
                                </span>
                              )}
                            </div>
                            <p className="text-emerald-950 leading-relaxed">{item.adminResponse}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
