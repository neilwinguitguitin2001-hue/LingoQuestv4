import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import {
  FeedbackCategory,
  FeedbackStatus,
  SystemFeedbackRecord,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';

interface AdminFeedbackConsoleViewProps {
  feedbackItems: SystemFeedbackRecord[];
  onUpdateFeedbackStatus: (
    feedbackId: string,
    updates: { status: FeedbackStatus; adminResponse?: string }
  ) => Promise<void>;
  onDeleteFeedback: (feedbackId: string) => Promise<void>;
}

export const AdminFeedbackConsoleView: React.FC<AdminFeedbackConsoleViewProps> = ({
  feedbackItems,
  onUpdateFeedbackStatus,
  onDeleteFeedback,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<FeedbackStatus>('in_review');
  const [isSavingId, setIsSavingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const total = feedbackItems.length;
    const openCount = feedbackItems.filter((f) => f.status === 'open').length;
    const inReviewCount = feedbackItems.filter((f) => f.status === 'in_review').length;
    const resolvedCount = feedbackItems.filter((f) => f.status === 'resolved').length;
    const bugsCount = feedbackItems.filter((f) => f.category === 'bug_report').length;
    const featuresCount = feedbackItems.filter((f) => f.category === 'feature_request').length;
    return { total, openCount, inReviewCount, resolvedCount, bugsCount, featuresCount };
  }, [feedbackItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return feedbackItems.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (roleFilter !== 'all' && item.userRole !== roleFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.userName.toLowerCase().includes(q) ||
        item.userEmail.toLowerCase().includes(q) ||
        (item.schoolName || '').toLowerCase().includes(q) ||
        item.targetArea.toLowerCase().includes(q)
      );
    });
  }, [feedbackItems, categoryFilter, roleFilter, statusFilter, searchQuery]);

  const handleStartReply = (item: SystemFeedbackRecord) => {
    soundFX.playClick();
    setActiveReplyId(item.id);
    setReplyDraft(item.adminResponse || '');
    setStatusDraft(item.status === 'open' ? 'in_review' : item.status);
  };

  const handleSaveReply = async (item: SystemFeedbackRecord) => {
    setIsSavingId(item.id);
    try {
      await onUpdateFeedbackStatus(item.id, {
        status: statusDraft,
        adminResponse: replyDraft.trim() || undefined,
      });
      soundFX.playPass();
      setActiveReplyId(null);
    } finally {
      setIsSavingId(null);
    }
  };

  const handleQuickStatus = async (item: SystemFeedbackRecord, nextStatus: FeedbackStatus) => {
    soundFX.playClick();
    setIsSavingId(item.id);
    try {
      await onUpdateFeedbackStatus(item.id, {
        status: nextStatus,
        adminResponse: item.adminResponse,
      });
    } finally {
      setIsSavingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-dashboard-panel">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#07172C] via-[#0F3460] to-[#1E3E62] text-white p-6 rounded-3xl border border-sky-500/30 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Student &amp; Faculty Direct Feedback Channel
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black">
            Feedback, Bug Reports &amp; Feature Requests Console
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Review and respond to bug reports, feature requests, system comments, and support inquiries submitted via the floating Feedback button on the Student and Teacher Dashboards.
          </p>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-center">
            <div className="text-lg font-mono font-black text-amber-300">{counts.openCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Open
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-center">
            <div className="text-lg font-mono font-black text-sky-300">{counts.inReviewCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              In Review
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-center">
            <div className="text-lg font-mono font-black text-emerald-300">
              {counts.resolvedCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Resolved
            </div>
          </div>
          <div className="hidden sm:block p-3 rounded-2xl bg-white/10 border border-white/15 text-center">
            <div className="text-lg font-mono font-black text-white">{counts.total}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Total
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Segmented Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
            {(
              [
                { id: 'all', label: `All (${counts.total})` },
                { id: 'bug_report', label: `Bug Reports (${counts.bugsCount})` },
                { id: 'feature_request', label: `Feature Requests (${counts.featuresCount})` },
                { id: 'general_comment', label: 'System Comments' },
                { id: 'help_inquiry', label: 'Help Inquiries' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCategoryFilter(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">All Roles (Students &amp; Teachers)</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, description, student/teacher name, school, or target system area..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Feedback Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Matching Feedback or Support Tickets
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try clearing your search query or switching the category and status filters above.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isEditingReply = activeReplyId === item.id;
            const isSaving = isSavingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 transition hover:border-slate-300"
              >
                {/* Top Metadata Row (Unboxed clean typography with separators) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {item.category === 'bug_report' ? (
                      <Bug className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : item.category === 'feature_request' ? (
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : item.category === 'help_inquiry' ? (
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-blue-700">{item.targetArea}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold capitalize ${
                        item.priority === 'high'
                          ? 'text-rose-600'
                          : item.priority === 'medium'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{item.createdAt}</span>
                  </div>

                  {/* Quick Status Selector Buttons */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    {(['open', 'in_review', 'resolved'] as FeedbackStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleQuickStatus(item, st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                          item.status === st
                            ? st === 'resolved'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'in_review'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject & Message */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-display font-black text-slate-900">
                    {item.subject}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>

                {/* Submitter Details Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800">{item.userName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.userRole}</span>
                    {item.gradeLevel && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Grade {item.gradeLevel}</span>
                      </>
                    )}
                    {item.classCode && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {item.classCode}
                        </span>
                      </>
                    )}
                    {item.schoolName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.schoolName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{item.userEmail}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartReply(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{item.adminResponse ? 'Edit Admin Response' : 'Reply to User'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onDeleteFeedback(item.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                      title="Delete feedback item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Existing Admin Response */}
                {item.adminResponse && !isEditingReply && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Official Admin Response ({item.respondedBy || 'Division Admin'})</span>
                      {item.respondedAt && (
                        <span className="font-normal text-emerald-700">· {item.respondedAt}</span>
                      )}
                    </div>
                    <p className="text-emerald-950 leading-relaxed">{item.adminResponse}</p>
                  </div>
                )}

                {/* Inline Reply Editor */}
                {isEditingReply && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Write Official Response to {item.userName} ({item.userRole})
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-semibold">Set Status:</span>
                        <select
                          value={statusDraft}
                          onChange={(e) => setStatusDraft(e.target.value as FeedbackStatus)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                        >
                          <option value="open">Open</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="Write a helpful response, resolution update, or guidance that will be shown in the user's Feedback & Support modal..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-blue-500 resize-none"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveReply(item)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                      >
                        {isSaving ? 'Saving...' : 'Save Response & Update Status'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
