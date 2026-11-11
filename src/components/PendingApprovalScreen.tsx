import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  GraduationCap,
  Key,
  LogOut,
  Mail,
  RefreshCw,
  School,
  Shield,
  ShieldCheck,
  User,
} from 'lucide-react';
import { StudentAccount, TeacherAccount } from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';
import { LingoQuestLogo } from './LingoQuestLogo';

interface PendingApprovalScreenProps {
  teacher?: TeacherAccount;
  student?: StudentAccount;
  onRefreshStatus: () => Promise<string>;
  onLogOut: () => void;
  onOpenEmailInbox?: (filterEmail?: string) => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  teacher,
  student,
  onRefreshStatus,
  onLogOut,
  onOpenEmailInbox,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const checkStatus = async () => {
    setStatusMessage('Checking status…');
    try {
      const status = await onRefreshStatus();
      setStatusMessage(status === 'pending' ? 'Your application is still pending.' : 'Your application status was updated.');
    } catch {
      setStatusMessage('Could not check your status. Please sign in again or try again later.');
    }
  };

  // If student mode
  if (student) {
    const isStudentRejected = student.status === 'rejected' || student.enrollmentStatus === 'rejected';

    return (
      <div className="min-h-screen bg-[#EEF4FB] flex flex-col justify-between selection:bg-sky-200">
        <header className="w-full border-b border-[#143257] bg-[#0B1E36] px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <LingoQuestLogo size="md" textColor="light" />
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-slate-300">
                Learner: <strong className="text-white">{student.name}</strong>
              </span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  onLogOut();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div
              className={`p-8 text-white ${
                isStudentRejected
                  ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-red-950'
                  : 'bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3.5 rounded-2xl ${
                    isStudentRejected
                      ? 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
                      : 'bg-amber-400/20 border border-amber-300/30 text-amber-300 animate-pulse'
                  }`}
                >
                  {isStudentRejected ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <Clock className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 border border-white/20">
                    {isStudentRejected ? 'Enrollment Flagged' : 'Teacher Verification In Progress'}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">
                    {isStudentRejected
                      ? 'Enrollment Information Flagged'
                      : 'Enrollment Awaiting Teacher Review'}
                  </h1>
                  <p className="text-sm text-slate-200">
                    {isStudentRejected
                      ? 'Your class teacher flagged an issue with your submitted registration details.'
                      : 'Your English teacher is reviewing your LRN, grade level, and school info to ensure accuracy.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {isStudentRejected ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Teacher Review Note
                  </div>
                  <p className="text-sm font-medium">
                    {student.enrollmentReviewNote || 'Your student information could not be verified. Please contact your teacher or re-register with your official 12-digit DepEd LRN.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> DepEd Davao Oriental Verification
                  </div>
                  <p className="text-xs leading-relaxed text-blue-950">
                    To maintain official class masterlists, your teacher reviews every student who registers with their class code (<strong>{student.classCode}</strong>). Once your teacher confirms your details, your island learning journey will automatically unlock!
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Submitted Learner Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Learner Full Name:</span>
                    <strong className="text-slate-800 text-sm">{student.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Class Code Used:</span>
                    <strong className="text-blue-700 text-sm font-mono font-bold">{student.classCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">DepEd LRN (12 Digits):</span>
                    <strong className="text-slate-800 text-sm font-mono">{student.lrn || student.learnerId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grade Level & Section:</span>
                    <strong className="text-slate-800">Grade {student.gradeLevel} {student.section ? `• Section ${student.section}` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">School Name:</span>
                    <strong className="text-slate-800">{student.schoolName || 'DepEd Davao Oriental'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Registration Date:</span>
                    <span className="text-slate-700">{student.joinedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    void checkStatus();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Check Enrollment Status
                </button>
                {statusMessage && <p role="status" className="text-xs text-slate-700">{statusMessage}</p>}

                <button
                  onClick={() => {
                    soundFX.playClick();
                    onLogOut();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full border-t border-[#143257] bg-[#07172C] text-slate-400 px-6 py-4 text-xs text-center">
          DepEd Schools Division of Davao Oriental • LingoQuest Learner Enrollment Portal
        </footer>
      </div>
    );
  }

  // Teacher mode
  if (!teacher) return null;
  const isRejected = teacher.status === 'rejected';
  const isSuspended = teacher.status === 'suspended';

  return (
    <div className="min-h-screen bg-[#EEF4FB] flex flex-col justify-between selection:bg-sky-200">
      {/* Header */}
      <header className="w-full border-b border-[#143257] bg-[#0B1E36] px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <LingoQuestLogo size="md" textColor="light" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-300">
              Signed in as: <strong className="text-white">{teacher.name}</strong>
            </span>
            <button
              onClick={() => {
                soundFX.playClick();
                onLogOut();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div
            className={`p-8 text-white ${
              isRejected
                ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-red-950'
                : isSuspended
                ? 'bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-950'
                : 'bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl ${
                  isRejected
                    ? 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
                    : isSuspended
                    ? 'bg-amber-500/20 border border-amber-400/30 text-amber-300'
                    : 'bg-amber-400/20 border border-amber-300/30 text-amber-300 animate-pulse'
                }`}
              >
                {isRejected ? (
                  <AlertCircle className="w-8 h-8" />
                ) : isSuspended ? (
                  <Shield className="w-8 h-8" />
                ) : (
                  <Clock className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 border border-white/20">
                  {isRejected
                    ? 'Application Rejected'
                    : isSuspended
                    ? 'Account Suspended'
                    : 'Awaiting Division Verification'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">
                  {isRejected
                    ? 'Teacher Registration Declined'
                    : isSuspended
                    ? 'Faculty Account Suspended'
                    : 'Waiting for Admin Approval'}
                </h1>
                <p className="text-sm text-slate-200">
                  {isRejected
                    ? 'Your teacher application could not be verified by the Division Office.'
                    : isSuspended
                    ? 'Access to class rosters and student progress is currently paused.'
                    : 'DepEd Schools Division of Davao Oriental • English Department'}
                </p>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-8 space-y-6">
            {isRejected && teacher.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Reason for Rejection
                </div>
                <p className="text-sm font-medium">{teacher.rejectionReason}</p>
                <p className="text-xs text-rose-600 mt-2">
                  Please consult your school principal or Division English Coordinator to re-verify credentials.
                </p>
              </div>
            )}

            {isSuspended && teacher.suspensionReason && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Suspension Notice
                </div>
                <p className="text-sm font-medium">{teacher.suspensionReason}</p>
              </div>
            )}

            {/* System-Assigned Unique Class Code Showcase Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#092244] via-[#0D2D57] to-[#143B6E] text-white border border-sky-400/30 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                      System-Assigned Unique Class Code
                    </span>
                    <span className="text-2xl font-mono font-black text-amber-300 tracking-wider">
                      {teacher.classCode || 'LQ-ENG-ASSIGNED'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse">
                    Pending Admin Activation
                  </span>
                  {teacher.classCode && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        navigator.clipboard.writeText(teacher.classCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-sky-200 border border-white/20 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="border-t border-sky-800/60 pt-2.5 text-xs text-sky-100/90 leading-relaxed">
                This unique class code is permanently linked to your faculty account. When the Division Administrator approves your application, this code is activated so your students can register and join your class roster.
              </p>
            </div>

            {!isRejected && !isSuspended && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
                <h3 className="text-sm font-bold text-sky-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  What happens next?
                </h3>
                <p className="text-xs text-sky-800 leading-relaxed">
                  Your registration has been securely queued in the <strong>Admin Dashboard</strong>.
                  An authorized Division English Administrator will verify your DepEd credentials.
                  Once approved:
                </p>
                <ul className="text-xs text-sky-900 list-disc list-inside space-y-1 pl-1">
                  <li>Your assigned unique Class Code (<strong>{teacher.classCode || 'LQ-ENG-XXXX'}</strong>) will be activated for student registration.</li>
                  <li>Students in your section can register using this Class Code to join your roster.</li>
                  <li>You will gain full access to your classroom analytics, quiz results, and student writing reviews.</li>
                </ul>
              </div>
            )}

            {/* Profile summary card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Submitted Faculty Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Full Name:</span>
                  <strong className="text-slate-800 text-sm">{teacher.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Class Code:</span>
                  <strong className="text-blue-700 text-sm font-mono font-bold">{teacher.classCode || 'Assigned on submission'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Employee ID:</span>
                  <strong className="text-slate-800 text-sm font-mono">{teacher.employeeId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">DepEd Email:</span>
                  <strong className="text-slate-800">{teacher.depEdEmail || 'Not specified'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Department / School:</span>
                  <strong className="text-slate-800">{teacher.department}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Submission Date:</span>
                  <span className="text-slate-700">{teacher.joinedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isRejected
                        ? 'bg-rose-100 text-rose-800'
                        : isSuspended
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {teacher.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  void checkStatus();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Check Approval Status
              </button>
                {statusMessage && <p role="status" className="text-xs text-slate-700">{statusMessage}</p>}

              <button
                onClick={() => {
                  soundFX.playClick();
                  onLogOut();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign In with Different Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#143257] bg-[#07172C] text-slate-400 px-6 py-4 text-xs text-center">
        DepEd Schools Division of Davao Oriental • LingoQuest Faculty Verification Portal
      </footer>
    </div>
  );
};
