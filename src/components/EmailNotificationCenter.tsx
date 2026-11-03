import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  GraduationCap,
  Inbox,
  Mail,
  MailCheck,
  MailOpen,
  School,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  EmailNotificationRecord,
  StudentAccount,
  TeacherAccount,
  UserAccount,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';

interface EmailNotificationCenterProps {
  currentUser: UserAccount | null;
  emails: EmailNotificationRecord[];
  latestToastEmail: EmailNotificationRecord | null;
  onDismissToast: () => void;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (emailId: string) => void;
  initialFilterEmail?: string;
  allUsers?: UserAccount[];
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({
  currentUser,
  emails,
  latestToastEmail,
  onDismissToast,
  isOpen,
  onClose,
  onMarkAsRead,
  initialFilterEmail = '',
  allUsers = [],
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher' && currentUser.status === 'approved';

  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [searchQuery, setSearchQuery] = useState(initialFilterEmail);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialFilterEmail) {
      setSearchQuery(initialFilterEmail);
    }
  }, [initialFilterEmail]);

  // Enforce strict Role-Based Access Control (RBAC) on which credential emails can be reviewed:
  // - Admin: Can review all Teacher and Student confirmation emails & credentials.
  // - Teacher: Can ONLY review Student confirmation emails & credentials for students enrolled in their class (or their own faculty confirmation).
  const authorizedEmails = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      return emails;
    }
    if (isTeacher) {
      const teacher = currentUser as TeacherAccount;
      const teacherCodes = new Set<string>();
      if (teacher.classCode) teacherCodes.add(teacher.classCode.trim().toUpperCase());
      if (teacher.gradeClassCodes) {
        Object.values(teacher.gradeClassCodes).forEach((c) => {
          if (c) teacherCodes.add(c.trim().toUpperCase());
        });
      }

      const myStudentIds = new Set(
        allUsers
          .filter((u): u is StudentAccount => {
            if (u.role !== 'student') return false;
            const codeMatch =
              u.classCode && teacherCodes.has(u.classCode.trim().toUpperCase());
            return u.teacherId === teacher.id || Boolean(codeMatch);
          })
          .map((s) => s.id)
      );

      return emails.filter((item) => {
        if (item.recipientRole !== 'student') return false;
        const summaryCode = (item.credentialsSummary?.classCode || '').trim().toUpperCase();
        return (
          myStudentIds.has(item.recipientUserId) ||
          (summaryCode && teacherCodes.has(summaryCode))
        );
      });
    }
    return [];
  }, [currentUser, isAdmin, isTeacher, emails, allUsers]);

  const filteredEmails = useMemo(() => {
    return authorizedEmails.filter((item) => {
      if (isAdmin && roleFilter !== 'all' && item.recipientRole !== roleFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchEmail = item.recipientEmail.toLowerCase().includes(q);
        const matchName = item.recipientName.toLowerCase().includes(q);
        const matchSubj = item.subject.toLowerCase().includes(q);
        const matchCode = (item.credentialsSummary?.classCode || '').toLowerCase().includes(q);
        const matchUser = (item.credentialsSummary?.username || '').toLowerCase().includes(q);
        return matchEmail || matchName || matchSubj || matchCode || matchUser;
      }
      return true;
    });
  }, [authorizedEmails, isAdmin, roleFilter, searchQuery]);

  const activeEmail = useMemo(() => {
    if (selectedEmailId) {
      const found = filteredEmails.find((e) => e.id === selectedEmailId);
      if (found) return found;
    }
    return filteredEmails[0] || null;
  }, [filteredEmails, selectedEmailId]);

  // Security gate: Only Admin and Approved Teachers can access the Credential & Email Confirmation Review Center
  if (!isAdmin && !isTeacher) {
    return null;
  }

  const handleCopy = (label: string, text: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const getTypeBadge = (type: EmailNotificationRecord['notificationType']) => {
    switch (type) {
      case 'teacher_approved_confirmation':
        return {
          text: 'Teacher Approved Confirmation',
          classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'teacher_registration_received':
        return {
          text: 'Faculty Sign-Up Received',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'student_enrollment_approved':
        return {
          text: 'Student Approved Confirmation',
          classes: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'student_registration_received':
        return {
          text: 'Student Sign-Up Notification',
          classes: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      default:
        return {
          text: 'Account Notice',
          classes: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
    }
  };

  const canShowToast =
    latestToastEmail &&
    authorizedEmails.some((e) => e.id === latestToastEmail.id);

  return (
    <>
      {/* Live Dispatched Email Notification Toast (Authorized Admin / Teacher Only) */}
      {canShowToast && latestToastEmail && (
        <div className="fixed top-20 right-4 z-[90] max-w-md w-full bg-[#091D36]/95 border-2 border-emerald-400/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/60 p-4 text-slate-100 animate-bounce-once">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <MailCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    Email Confirmation Dispatched
                  </span>
                  <span className="text-[11px] text-sky-300 font-mono truncate">
                    To: {latestToastEmail.recipientEmail}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white leading-snug">
                  {latestToastEmail.subject}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {latestToastEmail.messageBody}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0"
              aria-label="Close email alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-700/70 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSelectedEmailId(latestToastEmail.id);
                onMarkAsRead(latestToastEmail.id);
                onDismissToast();
                window.dispatchEvent(
                  new CustomEvent('lingoquest:open-email-modal', {
                    detail: { emailId: latestToastEmail.id },
                  })
                );
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-sky-200 border border-white/15 transition cursor-pointer flex items-center gap-1.5"
            >
              <MailOpen className="w-3.5 h-3.5" />
              <span>Review Sent Credentials</span>
            </button>
          </div>
        </div>
      )}

      {/* Credential & Email Confirmation Review Modal (Admin & Teacher Scoped) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0B1E36] border border-[#1E4475] rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#071629] border-b border-[#193B66] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black font-display text-white">
                      {isAdmin
                        ? 'Division Admin Credential & Email Confirmation Log'
                        : 'Class Teacher — Student Credential & Confirmation Review'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {authorizedEmails.length}{' '}
                      {authorizedEmails.length === 1 ? 'Record' : 'Records'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isAdmin
                      ? 'Authorized Division Admin access: Review teacher & student credentials and dispatched confirmation emails.'
                      : 'Authorized Teacher access: Review student credentials and enrollment confirmation emails for your classes.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="px-6 py-3 bg-[#091A30] border-b border-[#16355B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {isAdmin ? (
                <div className="flex items-center gap-1.5 bg-[#061222] p-1 rounded-xl border border-[#16355B]">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setRoleFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      roleFilter === 'all'
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Credentials ({authorizedEmails.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setRoleFilter('teacher');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      roleFilter === 'teacher'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>
                      Teachers (
                      {authorizedEmails.filter((e) => e.recipientRole === 'teacher').length})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setRoleFilter('student');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      roleFilter === 'student'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>
                      Students (
                      {authorizedEmails.filter((e) => e.recipientRole === 'student').length})
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <span>
                    Enrolled Student Credential Records ({authorizedEmails.length})
                  </span>
                </div>
              )}

              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email, name, username, or class code..."
                  className="w-full pl-9 pr-8 py-1.5 bg-[#061222] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Split Pane: Email List & Selected Email Content */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Left Column: Email List */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#16355B] overflow-y-auto max-h-60 lg:max-h-none divide-y divide-[#143054] bg-[#08182C]">
                {filteredEmails.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="text-xs font-bold text-slate-300">
                      No credential confirmation records found
                    </p>
                    <p className="text-[11px]">
                      {isAdmin
                        ? 'Dispatched teacher and student confirmation emails will appear here for administrative review.'
                        : 'Confirmation records for students registered under your Class Code will appear here.'}
                    </p>
                  </div>
                ) : (
                  filteredEmails.map((item) => {
                    const isSelected = activeEmail?.id === item.id;
                    const badge = getTypeBadge(item.notificationType);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setSelectedEmailId(item.id);
                          if (!item.isRead) {
                            onMarkAsRead(item.id);
                          }
                        }}
                        className={`w-full text-left p-4 transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-sky-500/15 border-l-4 border-l-sky-400'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            item.isRead ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'
                          }`}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.classes}`}
                            >
                              {badge.text}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(item.sentAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white truncate">
                            To: {item.recipientName} ({item.recipientEmail})
                          </p>
                          <p className="text-xs font-semibold text-sky-300 truncate">
                            {item.subject}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {item.messageBody}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Credential & Email Preview (Review Only — No Direct Login Bypass) */}
              <div className="lg:col-span-7 overflow-y-auto p-6 bg-[#0B1E36] flex flex-col justify-between">
                {activeEmail ? (
                  <div className="space-y-5">
                    {/* Email Envelope Header */}
                    <div className="p-4 rounded-2xl bg-[#071629] border border-[#193B66] space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            getTypeBadge(activeEmail.notificationType).classes
                          }`}
                        >
                          {getTypeBadge(activeEmail.notificationType).text}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Sent: {new Date(activeEmail.sentAt).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                        {activeEmail.subject}
                      </h3>

                      <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-[#143054]">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span>
                            <strong className="text-slate-400">From:</strong> DepEd Davao Oriental LingoQuest &lt;no-reply@lingoquest.deped.gov.ph&gt;
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-400">To:</strong>{' '}
                          <span className="text-sky-300 font-semibold">
                            {activeEmail.recipientName} &lt;{activeEmail.recipientEmail}&gt;
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email Body Card */}
                    <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-lg space-y-4">
                      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-sky-700">
                            Republic of the Philippines · Department of Education
                          </p>
                          <h4 className="text-sm font-black text-slate-900">
                            {activeEmail.headline}
                          </h4>
                        </div>
                        <ShieldCheck className="w-7 h-7 text-sky-600 shrink-0" />
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {activeEmail.messageBody}
                      </p>

                      {/* Credentials Box inside the Email */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Reviewed Account Credentials
                          </span>
                          {activeEmail.credentialsSummary.approvedBy && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Verified by: {activeEmail.credentialsSummary.approvedBy}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 block">
                                Registered Email
                              </span>
                              <strong className="text-slate-800 truncate block">
                                {activeEmail.recipientEmail}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy('email', activeEmail.recipientEmail)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                              title="Copy Email"
                            >
                              {copiedField === 'email' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 block">Username</span>
                              <strong className="text-slate-800 font-mono truncate block">
                                {activeEmail.credentialsSummary.username}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy('username', activeEmail.credentialsSummary.username)
                              }
                              className="p-1.5 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                              title="Copy Username"
                            >
                              {copiedField === 'username' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {activeEmail.credentialsSummary.classCode && (
                            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-sky-700 font-bold block">
                                  {activeEmail.recipientRole === 'teacher'
                                    ? 'Activated Faculty Class Code'
                                    : 'Linked Class Code'}
                                </span>
                                <strong className="text-sky-900 font-mono font-black text-sm">
                                  {activeEmail.credentialsSummary.classCode}
                                </strong>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    'classCode',
                                    activeEmail.credentialsSummary.classCode || ''
                                  )
                                }
                                className="p-1.5 text-sky-700 hover:text-sky-900 transition cursor-pointer"
                                title="Copy Class Code"
                              >
                                {copiedField === 'classCode' ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}

                          {activeEmail.credentialsSummary.lrn && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-400 block">
                                12-Digit DepEd LRN
                              </span>
                              <strong className="text-slate-800 font-mono">
                                {activeEmail.credentialsSummary.lrn}
                              </strong>
                            </div>
                          )}

                          {activeEmail.credentialsSummary.employeeId && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-400 block">
                                DepEd Employee ID
                              </span>
                              <strong className="text-slate-800 font-mono">
                                {activeEmail.credentialsSummary.employeeId}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                    <Mail className="w-10 h-10 text-slate-500" />
                    <p className="text-sm font-bold text-slate-300">
                      Select a confirmation record to review credentials
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
