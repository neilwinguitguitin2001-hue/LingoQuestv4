import {RecoveryRequest} from './PasswordRecovery';
import {InabelStrip} from './InabelStrip';
import {InabelWovenStrip} from './FilipinianaMotifs';
import {LegalLinks,RegistrationNotices} from './LegalCenter';
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  Lock,
  LogIn,
  Mail,
  MapPin,
  RefreshCw,
  School,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS } from '../data/davaoOrientalSchools';
import {
  AdminAccount,
  EmailNotificationRecord,
  GradeLevel,
  StudentAccount,
  TeacherAccount,
  UserAccount,
} from '../types/lingoquest';
import { generateUniqueClassCode } from '../services/accountService';
import {NOTICE_VERSION} from '../data/legalNotices';
import {privateRequest} from '../services/privacyService';
import { privateLogin } from '../services/privacyService';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/soundEffects';
import { LingoQuestEmblem, LingoQuestLogo } from './LingoQuestLogo';
import { InteractiveIslandMap, IslandStationData } from './InteractiveIslandMap';

interface AuthScreenProps {
  students: StudentAccount[];
  teachers: TeacherAccount[];
  admins: AdminAccount[];
  onLoginSuccess: (account: UserAccount) => void;
  onRegisterStudent: (newStudent: {
    name: string;
    email: string;
    lrn: string;
    gradeLevel: GradeLevel;
    schoolName: string;
    section?: string;
    classCode: string;
    teacherId: string;
    username: string;
    password?: string;
  }) => Promise<StudentAccount>;
  onRegisterTeacher: (newTeacher: {
    name: string;
    employeeId: string;
    schoolName: string;
    department: string;
    depEdEmail: string;
    username: string;
    password?: string;
    classCode?: string;
  }) => Promise<TeacherAccount>;
  onVerifyClassCode: (classCode: string) => { valid: boolean; teacher?: TeacherAccount; error?: string };
  onRecoverPassword?: (
    role: 'student' | 'teacher',
    identifier: string,
    email: string,
    newPassword: string
  ) => Promise<{ success: boolean; user?: any; error?: string }>;
  onTriggerTransition?: (title: string, subtitle?: string) => void;
  emailNotifications?: EmailNotificationRecord[];
  onOpenEmailInbox?: (filterEmail?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  students,
  teachers,
  admins,
  onLoginSuccess,
  onRegisterStudent,
  onRegisterTeacher,
  onVerifyClassCode,
  onRecoverPassword,
  onTriggerTransition,
  emailNotifications = [],
  onOpenEmailInbox,
}) => {
  const {
    login: supabaseLogin,
    signup: supabaseSignup,
  } = useAuth();

  // Mode and Role Tabs
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginRole, setLoginRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [termsAccepted,setTermsAccepted]=useState(false);
  const [privacyRead,setPrivacyRead]=useState(false);
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher'>('student');

  // Login form fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showStuPassword, setShowStuPassword] = useState(false);
  const [showTchPassword, setShowTchPassword] = useState(false);

  // Rate Limiting States
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('lingoquest_failed_attempts');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('lingoquest_lockout_until');
      if (!stored) return 0;
      const parsed = parseInt(stored, 10);
      // Cap at 30 seconds from now in case a previous 60-second lock was active
      const maxAllowed = Date.now() + 30 * 1000;
      return parsed > maxAllowed ? maxAllowed : parsed;
    } catch {
      return 0;
    }
  });

  const [remainingLockout, setRemainingLockout] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Registration form fields
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuLrn, setStuLrn] = useState('');
  const [stuGrade, setStuGrade] = useState<GradeLevel>(8);
  const [stuSchool, setStuSchool] = useState<string>(DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS[0]);
  const [stuSection, setStuSection] = useState('');
  const [stuClassCode, setStuClassCode] = useState('');
  const [stuUsername, setStuUsername] = useState('');
  const [stuPassword, setStuPassword] = useState('');

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [selectedMapIslandId, setSelectedMapIslandId] = useState<string>('discovery-dinosaur');

  // Teacher Registration form fields
  const [tchName, setTchName] = useState('');
  const [tchEmployeeId, setTchEmployeeId] = useState('');
  const [tchSchool, setTchSchool] = useState<string>(DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS[0]);
  const [tchDepEdEmail, setTchDepEdEmail] = useState('');
  const [tchUsername, setTchUsername] = useState('');
  const [tchPassword, setTchPassword] = useState('');

  // System-assigned unique class code for teacher registration
  const [assignedTeacherCode, setAssignedTeacherCode] = useState<string>(() =>
    generateUniqueClassCode(teachers)
  );
  const [assignedCodeCopied, setAssignedCodeCopied] = useState(false);
  const [registeredTeacherResult, setRegisteredTeacherResult] = useState<TeacherAccount | null>(null);

  // Live class code verification feedback
  const [classCodeFeedback, setClassCodeFeedback] = useState<{
    valid: boolean;
    teacherName?: string;
    error?: string;
  } | null>(null);

  // Rate Limit Countdown Interval
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setRemainingLockout(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setRemainingLockout(0);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  // Check class code in real-time as user types
  useEffect(() => {
    if (mode === 'register' && registerRole === 'student' && stuClassCode.trim().length >= 4) {
      const result = onVerifyClassCode(stuClassCode.trim());
      if (result.valid && result.teacher) {
        setClassCodeFeedback({
          valid: true,
          teacherName: result.teacher.name,
        });
      } else {
        setClassCodeFeedback({
          valid: false,
          error: result.error || 'Class code not recognized',
        });
      }
    } else {
      setClassCodeFeedback(null);
    }
  }, [stuClassCode, mode, registerRole, onVerifyClassCode]);

  const handleRoleSwitch = (newRole: 'student' | 'teacher' | 'admin') => {
    soundFX.playClick();
    setLoginRole(newRole);
    setErrorMsg('');
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleRecordFailedAttempt = () => {
    const nextCount = failedAttempts + 1;
    setFailedAttempts(nextCount);
    try {
      localStorage.setItem('lingoquest_failed_attempts', nextCount.toString());
    } catch {}

    if (nextCount >= 5) {
      const lockTime = Date.now() + 30 * 1000; // 30 seconds lockout
      setLockoutUntil(lockTime);
      try {
        localStorage.setItem('lingoquest_lockout_until', lockTime.toString());
      } catch {}
      setErrorMsg('Too many failed login attempts. Login temporarily locked for 30 seconds.');
    }
  };

  const handleRegenerateTeacherCode = () => {
    soundFX.playClick();
    const newCode = generateUniqueClassCode(teachers);
    setAssignedTeacherCode(newCode);
  };

  const handleResetFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(0);
    try {
      localStorage.removeItem('lingoquest_failed_attempts');
      localStorage.removeItem('lingoquest_lockout_until');
    } catch {}
  };

  // Login handler with Supabase Auth and rate limiting
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingLockout > 0) return;

    soundFX.playClick();
    setErrorMsg('');
    const trimmedUser = loginUsername.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const account = await privateLogin(trimmedUser, loginPassword, loginRole);
      handleResetFailedAttempts();
      onLoginSuccess(account);
    } catch (error) {
      handleRecordFailedAttempt();
      setErrorMsg(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally { setIsSubmitting(false); }
    return;
  };

  // Registration handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!termsAccepted||!privacyRead){setErrorMsg('Please read the Privacy Notice and acknowledge it, and accept the Terms of Use before registering. Research consent remains separate.');return;}
    soundFX.playClick();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (registerRole === 'student') {
        if (!stuName.trim() || !stuEmail.trim() || !stuLrn.trim() || !stuSchool || !stuClassCode.trim() || !stuUsername.trim() || !stuPassword.trim()) {
          setErrorMsg('Please complete all required fields, including your email address.');
          setIsSubmitting(false);
          return;
        }

        // Validate Email
        const cleanEmail = stuEmail.trim().toLowerCase();
        if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
          setErrorMsg('Please enter a valid email address for password recovery.');
          setIsSubmitting(false);
          return;
        }

        // Validate LRN
        if (stuLrn.trim().length !== 12 || !/^\d+$/.test(stuLrn.trim())) {
          setErrorMsg('DepEd Learner Reference Number (LRN) must be exactly 12 numeric digits.');
          setIsSubmitting(false);
          return;
        }

        // Validate Class Code against approved teachers
        const codeCheck = onVerifyClassCode(stuClassCode.trim());
        if (!codeCheck.valid || !codeCheck.teacher) {
          setErrorMsg(codeCheck.error || 'Invalid class code. Please ask your teacher for their approved class code.');
          setIsSubmitting(false);
          return;
        }

        // Check duplicate username
        const exists =
          students.some((s) => s.username.toLowerCase() === stuUsername.trim().toLowerCase()) ||
          teachers.some((t) => t.username.toLowerCase() === stuUsername.trim().toLowerCase());
        if (exists) {
          setErrorMsg('That username is already registered. Please choose another username.');
          setIsSubmitting(false);
          return;
        }

        // Register student in Supabase Auth and profile storage if password >= 6 chars
        try {
          if (stuPassword.length >= 6) {
            await supabaseSignup({
              fullName: stuName.trim(),
              email: cleanEmail,
              password: stuPassword,
              gradeLevel: stuGrade,
              school: stuSchool,
              section: stuSection.trim(),
              lrn: stuLrn.trim(),
              classCode: stuClassCode.trim().toUpperCase(),
              teacherId: codeCheck.teacher.id,
              username: stuUsername.trim(),
            });
          }
        } catch (signupError: any) {
          console.warn('Supabase signup notice:', signupError?.message || signupError);
        }

        const newStudent = await onRegisterStudent({
          name: stuName.trim(),
          email: cleanEmail,
          lrn: stuLrn.trim(),
          gradeLevel: stuGrade,
          schoolName: stuSchool,
          section: stuSection.trim(),
          classCode: stuClassCode.trim().toUpperCase(),
          teacherId: codeCheck.teacher.id,
          username: stuUsername.trim(),
          password: stuPassword,
        });

        soundFX.playBridgeRestored();
        await privateRequest({action:'acknowledgeNotice',version:NOTICE_VERSION,termsAccepted:true},newStudent.id).catch(()=>undefined);
        onLoginSuccess(newStudent);
      } else {
        // Teacher registration
        if (!tchName.trim() || !tchEmployeeId.trim() || !tchSchool || !tchDepEdEmail.trim() || !tchUsername.trim() || !tchPassword.trim()) {
          setErrorMsg('Please complete all required teacher registration fields.');
          setIsSubmitting(false);
          return;
        }

        if (!tchDepEdEmail.includes('@')) {
          setErrorMsg('Please enter a valid DepEd or institutional email address.');
          setIsSubmitting(false);
          return;
        }

        const exists =
          students.some((s) => s.username.toLowerCase() === tchUsername.trim().toLowerCase()) ||
          teachers.some((t) => t.username.toLowerCase() === tchUsername.trim().toLowerCase());
        if (exists) {
          setErrorMsg('That username is already registered. Please choose another username.');
          setIsSubmitting(false);
          return;
        }

        const newTeacher = await onRegisterTeacher({
          name: tchName.trim(),
          employeeId: tchEmployeeId.trim(),
          schoolName: tchSchool,
          department: `${tchSchool} - English Department`,
          depEdEmail: tchDepEdEmail.trim(),
          username: tchUsername.trim(),
          password: tchPassword,
          classCode: assignedTeacherCode,
        });

        soundFX.playBridgeRestored();
        await privateRequest({action:'acknowledgeNotice',version:NOTICE_VERSION,termsAccepted:true},newTeacher.id).catch(()=>undefined);
        setRegisteredTeacherResult(newTeacher);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06162B] via-[#091F3C] to-[#0D2A4F] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient Tropical Glow Accents */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 w-full border-b border-[#143257]/80 bg-[#071930]/90 backdrop-blur-md px-4 sm:px-6 pt-6 pb-4">
        <div className="absolute inset-x-0 top-0 pointer-events-none" aria-hidden="true"><InabelWovenStrip variant="azure" height={8}/></div>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Official Brand Logo */}
          <span className="sm:hidden"><LingoQuestLogo size="sm" textColor="light" animated={true}/></span><span className="hidden sm:block"><LingoQuestLogo size="md" textColor="light" animated={true}/></span>

          {/* Action on Header */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                const nextMode = mode === 'login' ? 'register' : 'login';
                onTriggerTransition?.(
                  nextMode === 'register'
                    ? 'Opening Account Registration...'
                    : 'Returning to Sign In Portal...',
                  'DepEd Davao Oriental · LingoQuest'
                );
                setMode(nextMode);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              {mode === 'login' ? 'Create New Account' : 'Back to Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Portal Showcase Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex flex-col justify-center space-y-10">
        
        {/* Top First: Division Kicker & Welcome Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-sky-300/90 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>DepEd Schools Division of Davao Oriental</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Junior High English</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-[1.15] text-balance">
            Journey through the Islands of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-sky-200">
              English Mastery
            </span>
            .
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A gamified e-learning adventure designed for secondary students in Davao Oriental.
            Sign in below to enter your island quest portal, or explore the interactive archipelago map.
          </p>
        </div>

        {/* Top First: Catchy, Interactive Auth Card (Sign In & Registration) */}
        <div className="max-w-xl mx-auto w-full">
          <div className="relative overflow-hidden bg-[#0B1E36]/95 border border-[#2378A6] backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 space-y-5">
              
              <div className="absolute inset-x-0 top-0 pointer-events-none" aria-hidden="true"><InabelStrip variant="royal" height={16}/></div>
              {/* Card Header: Mode & Switcher */}
              <div className="flex items-center justify-between border-b border-[#1A385E] pb-4">
                <div>
                  <h2 className="text-xl font-black font-display text-white">
                    {mode === 'login'
                      ? loginRole === 'student'
                        ? 'Learner Sign In'
                        : loginRole === 'teacher'
                        ? 'Faculty Sign In'
                        : 'Division Admin'
                      : registerRole === 'student'
                      ? 'Student Registration'
                      : 'Faculty Registration'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {mode === 'login'
                      ? 'Select your role to access your portal'
                      : 'Enroll with DepEd Davao Oriental validation'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    const nextMode = mode === 'login' ? 'register' : 'login';
                    onTriggerTransition?.(
                      nextMode === 'register'
                        ? 'Opening Account Registration...'
                        : 'Returning to Sign In Portal...',
                      'DepEd Davao Oriental · LingoQuest'
                    );
                    setMode(nextMode);
                    setErrorMsg('');
                  }}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4 transition"
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </div>

              {/* Error / Rate Limiting Alert */}
              {remainingLockout > 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2 animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Account temporarily locked</strong> due to repeated failed logins.
                    Please wait <strong>{remainingLockout} second{remainingLockout === 1 ? '' : 's'}</strong> before retrying.
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              ) : null}

              {/* ---------------- LOGIN MODE ---------------- */}
              {mode === 'login' && (
                <div className="space-y-5">
                  {/* 3 Role Selection Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#07172C] border border-[#16355B] rounded-2xl">
                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('student')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                        loginRole === 'student'
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('teacher')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                        loginRole === 'teacher'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <School className="w-4 h-4" />
                      <span>Teacher</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('admin')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                        loginRole === 'admin'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                  </div>

                  {/* Sign In Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {loginRole === 'admin' && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-2.5 text-amber-300">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[11px] leading-relaxed text-slate-300">
                          Restricted Access: Department of Education Davao Oriental Division Administrators only.
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {loginRole === 'student'
                          ? 'Learner LRN, Email, or Username'
                          : loginRole === 'teacher'
                          ? 'DepEd Email or Username'
                          : 'Administrator Username or Email'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          autoComplete={loginRole === 'admin' ? 'off' : 'username'}
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          className="w-full px-3.5 py-2.5 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          Password
                        </label>
                        {(
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();







                              setShowRecoveryModal(true);
                            }}
                            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline transition cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete={loginRole === 'admin' ? 'new-password' : 'current-password'}
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setShowLoginPassword(!showLoginPassword);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                          title={showLoginPassword ? 'Hide password' : 'Show password'}
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4 text-sky-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={remainingLockout > 0 || isSubmitting}
                      className={`w-full py-3 rounded-2xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                        remainingLockout > 0 || isSubmitting
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : loginRole === 'student'
                          ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                          : loginRole === 'teacher'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>
                        {loginRole === 'student'
                          ? 'Enter Learning Home'
                          : loginRole === 'teacher'
                          ? 'Access Faculty Dashboard'
                          : 'Access Division Administration'}
                      </span>
                    </button>


                  </form>
                </div>
              )}

              {/* ---------------- REGISTER MODE ---------------- */}
              {mode === 'register' && (
                <div className="space-y-4">
                  <RegistrationNotices terms={termsAccepted} privacy={privacyRead} onTerms={setTermsAccepted} onPrivacy={setPrivacyRead}/>
                  {/* Role Switch for Register */}
                  <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#07172C] border border-[#16355B] rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setRegisterRole('student');
                        setErrorMsg('');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                        registerRole === 'student'
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setRegisterRole('teacher');
                        setErrorMsg('');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                        registerRole === 'teacher'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <School className="w-4 h-4" />
                      <span>Teacher</span>
                    </button>
                  </div>

                  {/* Student Registration Form */}
                  {registerRole === 'student' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Complete Student Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={stuName}
                          onChange={(e) => setStuName(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                          <span>Email Address <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Password Recovery Link
                          </span>
                        </label>
                        <input
                          type="email"
                          required
                          value={stuEmail}
                          onChange={(e) => setStuEmail(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Required to recover and reset your password if you ever forget it.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            12-Digit LRN
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={12}
                            value={stuLrn}
                            onChange={(e) => setStuLrn(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Grade Level
                          </label>
                          <select
                            value={stuGrade}
                            onChange={(e) => setStuGrade(parseInt(e.target.value, 10) as GradeLevel)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                          >
                            <option value={7}>Grade 7</option>
                            <option value={8}>Grade 8</option>
                            <option value={9}>Grade 9</option>
                            <option value={10}>Grade 10</option>
                          </select>
                        </div>
                      </div>

                      {/* School Name & Optional Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            School Name
                          </label>
                          <select
                            value={stuSchool}
                            onChange={(e) => setStuSchool(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none truncate"
                          >
                            {DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS.map((school) => (
                              <option key={school} value={school} className="bg-[#07172C] text-white">
                                {school}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Section <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Rizal"
                            value={stuSection}
                            onChange={(e) => setStuSection(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-300">
                            Class Code from English Teacher
                          </label>
                          {classCodeFeedback?.valid && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Teacher: {classCodeFeedback.teacherName}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={stuClassCode}
                          onChange={(e) => setStuClassCode(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none font-mono uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                          <input
                            type="text"
                            required
                            value={stuUsername}
                            onChange={(e) => setStuUsername(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                          <div className="relative">
                            <input
                              type={showStuPassword ? 'text' : 'password'}
                              required
                              value={stuPassword}
                              onChange={(e) => setStuPassword(e.target.value)}
                              className="w-full pl-3.5 pr-9 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-sky-400 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setShowStuPassword(!showStuPassword);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                              title={showStuPassword ? 'Hide password' : 'Show password'}
                              aria-label={showStuPassword ? 'Hide password' : 'Show password'}
                            >
                              {showStuPassword ? (
                                <EyeOff className="w-3.5 h-3.5 text-sky-400" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-md transition"
                      >
                        {isSubmitting ? 'Registering Student...' : 'Create Student Account'}
                      </button>
                    </form>
                  )}

                  {/* Teacher Registration Form */}
                  {registerRole === 'teacher' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
                        Teacher accounts are subject to administrative review by the Davao Oriental Division Office before activation.
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={tchName}
                            onChange={(e) => setTchName(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-emerald-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Employee ID</label>
                          <input
                            type="text"
                            required
                            value={tchEmployeeId}
                            onChange={(e) => setTchEmployeeId(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-emerald-400 outline-none"
                          />
                        </div>
                      </div>

                      {/* School Name Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          School Name
                        </label>
                        <select
                          value={tchSchool}
                          onChange={(e) => setTchSchool(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-emerald-400 outline-none truncate"
                        >
                          {DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS.map((school) => (
                            <option key={school} value={school} className="bg-[#07172C] text-white">
                              {school}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Official DepEd Email</label>
                        <input
                          type="email"
                          required
                          value={tchDepEdEmail}
                          onChange={(e) => setTchDepEdEmail(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-emerald-400 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                          <input
                            type="text"
                            required
                            value={tchUsername}
                            onChange={(e) => setTchUsername(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-emerald-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                          <div className="relative">
                            <input
                              type={showTchPassword ? 'text' : 'password'}
                              required
                              value={tchPassword}
                              onChange={(e) => setTchPassword(e.target.value)}
                              className="w-full pl-3.5 pr-9 py-2 bg-[#07172C] text-white text-xs rounded-xl border border-[#193B66] focus:border-emerald-400 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setShowTchPassword(!showTchPassword);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                              title={showTchPassword ? 'Hide password' : 'Show password'}
                              aria-label={showTchPassword ? 'Hide password' : 'Show password'}
                            >
                              {showTchPassword ? (
                                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* System-Assigned Unique Class Code Preview Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#061D38] via-[#0A274B] to-[#0D315E] border border-sky-500/40 space-y-2.5 shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
                              <Key className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="text-[11px] font-black uppercase tracking-wider text-sky-200 block">
                                System-Assigned Unique Class Code
                              </span>
                              <span className="text-[10px] text-slate-300">
                                Assigned to your account upon registration
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRegenerateTeacherCode}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900/70 border border-sky-500/30 text-[10px] font-bold text-sky-300 transition"
                            title="Generate another unique code"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-[#031022] px-3.5 py-2.5 rounded-xl border border-sky-500/30">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-amber-300 tracking-wider">
                              {assignedTeacherCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                navigator.clipboard.writeText(assignedTeacherCode);
                                setAssignedCodeCopied(true);
                                setTimeout(() => setAssignedCodeCopied(false), 2000);
                              }}
                              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-bold text-sky-200 transition flex items-center gap-1"
                            >
                              {assignedCodeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{assignedCodeCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Admin Approval
                          </span>
                        </div>

                        <p className="text-[10.5px] text-slate-300 leading-relaxed">
                          The system assigns this unique class code to your account. Upon review and approval by the Division Office Admin, this code is activated so your students can enroll in your class.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition"
                      >
                        {isSubmitting ? 'Submitting Application...' : 'Submit Faculty Application (Pending)'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
        </div>

        {/* Underneath: Interactive Davao Oriental Curriculum Archipelago Map */}
        <div className="space-y-3 pt-6 border-t border-[#16355B]/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300/90 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>DepEd Schools Division of Davao Oriental</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Interactive Curriculum Archipelago Map</span>
            </div>
            <span className="text-[11px] text-sky-300 font-bold bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/30">
              ⚓ Click any island or bottom card to sail the boat
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-[#123B63] bg-[#07192F] shadow-[0_4px_0_#031024]">
            <InabelStrip variant="royal" height={16}/>
            <InteractiveIslandMap
              mode="signin"
              activeIslandId={selectedMapIslandId}
              onSelectIsland={(island) => setSelectedMapIslandId(island.id)}
            />
          </div>
        </div>

        {/* Supporting Curriculum Highlights & Storytelling (Underneath Island Map) */}
        <div className="space-y-6 pt-6 border-t border-[#16355B]/60">
          {/* Creative Emblem Showcase Card */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-r from-[#0C2444]/80 via-[#0E2C52]/70 to-[#0A203C]/80 border border-[#1A3F6D] backdrop-blur-md shadow-xl overflow-hidden group">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Master Official App Icon Emblem */}
              <div className="relative shrink-0 flex items-center justify-center p-2">
                <LingoQuestEmblem size={84} withSquircle={true} className="relative z-10 drop-shadow-xl" />
              </div>

              {/* Narrative highlight */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-extrabold tracking-widest text-amber-300 uppercase">
                    Archipelago Learning System
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  5 Interactive Island Quests & Writing Lab
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Spanning Grades 7 to 10 with DepEd competencies, interactive lesson bridges, diagnostic vocabulary quizzes, and division achievements.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Interactive Highlight Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sky-500/40 transition">
              <div className="flex items-center gap-2 text-sky-400 mb-1.5">
                <Compass className="w-4 h-4" />
                <span className="text-xs font-bold">Island Quests</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Repair bridges through grammar, syntax, modals, and literary reading modules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition">
              <div className="flex items-center gap-2 text-amber-400 mb-1.5">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-bold">Writing Lab</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Guided essay composition with live rubric checks and feedback.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition">
              <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-bold">Division Reach</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Dedicated high school rosters across all Davao Oriental municipalities.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Teacher Account Created & Assigned Class Code Modal */}
      {registeredTeacherResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1E36] border border-sky-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Account Created & Code Assigned
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                  Teacher Registration Submitted
                </h3>
                <p className="text-xs text-slate-300">
                  Welcome, <strong>{registeredTeacherResult.name}</strong>! Your account has been submitted for administrative review.
                </p>
              </div>
            </div>

            {/* Assigned Unique Class Code Showcase */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/80 via-[#071F3F] to-[#0A2B54] border border-sky-400/30 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                Your Assigned Unique Class Code
              </span>
              <div className="flex items-center justify-between bg-[#041226] px-4 py-3 rounded-xl border border-sky-500/30">
                <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">
                  {registeredTeacherResult.classCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    navigator.clipboard.writeText(registeredTeacherResult.classCode);
                    setAssignedCodeCopied(true);
                    setTimeout(() => setAssignedCodeCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-bold border border-sky-400/30 transition"
                >
                  {assignedCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{assignedCodeCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-200/90 pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Status: <strong>Pending Administrator Approval</strong></span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <strong className="text-white block font-bold">What happens next?</strong>
              <p>
                1. An authorized Administrator in the Davao Oriental Division Office will review your faculty credentials.
              </p>
              <p>
                2. Once approved, this class code becomes active, allowing your students to register and join your class roster.
              </p>
              <p>
                3. You can sign in anytime to monitor your verification status.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onLoginSuccess(registeredTeacherResult);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>View Status Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setRegisteredTeacherResult(null);
                  setMode('login');
                  setLoginRole('teacher');
                }}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition text-center"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecoveryModal && <RecoveryRequest onClose={() => setShowRecoveryModal(false)}/>}

      {/* Footer (Clean, Quiet, with animated emblem, WITHOUT the removed RBAC string) */}
      <footer className="relative z-20 w-full border-t border-[#143257] bg-[#051326] text-slate-300 px-6 pt-7 pb-5 text-xs">
        <div className="absolute inset-x-0 top-0 pointer-events-none" aria-hidden="true"><InabelWovenStrip variant="azure" height={8}/></div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LingoQuestEmblem size={24} />
            <span className="font-semibold text-white">LingoQuest</span>
            <span className="text-slate-400">· DepEd Schools Division of Davao Oriental</span>
          </div>
          <div className="text-center sm:text-right text-slate-400">
            Region XI · Davao Oriental · English Learning Adventure
          </div>
        </div>
        <LegalLinks/>
      </footer>
    </div>
  );
};
