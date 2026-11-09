import React, { useEffect, useRef, useState } from 'react';
import {
  ALL_MODULES,
  BADGE_DEFINITIONS,
  INITIAL_ADMINS,
  INITIAL_AUDIT_LOGS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
} from './data/seedData';
import {
  AdminAccount,
  AuditLogEntry,
  DifficultyLevel,
  EmailNotificationRecord,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  GradeLevel,
  Module,
  ModuleProgress,
  PersonalizationRecord,
  QuarterNumber,
  QuizAttemptRecord,
  StudentAccount,
  SystemFeedbackRecord,
  TeacherAccount,
  UserAccount,
  WritingSubmissionRecord,
  DAVAO_ORIENTAL_QUARTER_ISLANDS,
} from './types/lingoquest';
import { soundFX } from './utils/soundEffects';
import { isStudentModuleUnlocked } from './utils/progression';

// Components
import { PrivateAdminSummary } from './components/PrivateAdminSummary';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthScreen } from './components/AuthScreen';
import { IslandMapView } from './components/IslandMapView';
import { LeaderboardView } from './components/LeaderboardView';
import { LessonAndQuizView, QuizCompletionPayload } from './components/LessonAndQuizView';
import { LingoQuestEmblem, LingoQuestLogo, LogoTransitionOverlay } from './components/LingoQuestLogo';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { ProfileBadgesView } from './components/ProfileBadgesView';
import { QuestMarketView } from './components/QuestMarketView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { StudentProgressView } from './components/StudentProgressView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { WritingLabView } from './components/WritingLabView';
import { NetworkStatusToast } from './components/NetworkStatusToast';
import { EmailNotificationCenter } from './components/EmailNotificationCenter';
import { FloatingFeedbackWidget } from './components/FloatingFeedbackWidget';
import { supabase } from './lib/supabase';
import { privateBootstrap } from './services/privacyService';
import { questGame } from './services/questGameService';
import {
  InabelWovenStrip,
  PhilippineSunMedallion,
} from './components/FilipinianaMotifs';

// Services
import {
  approveTeacher as apiApproveTeacher,
  createNewModule as apiCreateNewModule,
  deleteExistingModule as apiDeleteExistingModule,
  getAuditLogs as apiGetAuditLogs,
  initializeFirestoreSeed,
  persistStudentProgress as apiPersistStudentProgress,
  hydrateStudentProgressFromSupabase,
  reactivateUser as apiReactivateUser,
  recoverUserPassword as apiRecoverUserPassword,
  registerNewStudent as apiRegisterNewStudent,
  registerNewTeacher as apiRegisterNewTeacher,
  rejectTeacher as apiRejectTeacher,
  suspendUser as apiSuspendUser,
  deleteTeacherAccount as apiDeleteTeacherAccount,
  deleteStudentAccount as apiDeleteStudentAccount,
  reviewStudentEnrollment as apiReviewStudentEnrollment,
  updateExistingModule as apiUpdateExistingModule,
  updateStudentProfile as apiUpdateStudentProfile,
  updateTeacherClassCode as apiUpdateTeacherClassCode,
  updateTeacherProfile as apiUpdateTeacherProfile,
  verifyClassCode as apiVerifyClassCode,
  generateUniqueClassCode,
  createSubAdminAccount as apiCreateSubAdmin,
  updateSubAdminAccount as apiUpdateSubAdmin,
  deleteSubAdminAccount as apiDeleteSubAdmin,
  archiveAuditLog as apiArchiveAuditLog,
  unarchiveAuditLog as apiUnarchiveAuditLog,
  deleteAuditLog as apiDeleteAuditLog,
  bulkArchiveAuditLogs as apiBulkArchiveAuditLogs,
  bulkDeleteAuditLogs as apiBulkDeleteAuditLogs,
  getCachedEmailNotifications,
  markEmailNotificationAsRead as apiMarkEmailRead,
  subscribeToEmailNotifications,
  getCachedSystemFeedback,
  getAllSystemFeedback as apiGetAllSystemFeedback,
  submitSystemFeedback as apiSubmitSystemFeedback,
  updateSystemFeedbackStatus as apiUpdateSystemFeedbackStatus,
  deleteSystemFeedbackItem as apiDeleteSystemFeedbackItem,
} from './services/firestoreService';
import { useAuth } from './context/AuthContext';
import {
  mergeLocalGuestProgressIntoStudent,
  recordQuizResultToFirestore,
  syncStudentProgressToFirestore,
  syncUserProfileToFirestore,
} from './services/firebaseProgressService';

import {
  AlertTriangle,
  Award,
  BookOpen,
  Coins,
  Clock,
  Compass,
  Feather,
  Flame,
  Globe,
  GraduationCap,
  Key,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  School,
  Shield,
  ShieldCheck,
  Trophy,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

type AppView =
  | 'AUTH'
  | 'MAP'
  | 'LESSON_QUIZ'
  | 'WRITING'
  | 'PROGRESS'
  | 'LEADERBOARD'
  | 'PROFILE'
  | 'MARKET'
  | 'STUDENT_DASHBOARD'
  | 'TEACHER'
  | 'ADMIN'
  | 'WAITING_APPROVAL';

const STORAGE_KEY_STUDENTS = 'lingoquest_students_v3';
const STORAGE_KEY_TEACHERS = 'lingoquest_teachers_v3';
const STORAGE_KEY_ADMINS = 'lingoquest_admins_v3';
const STORAGE_KEY_CUSTOM_MODULES = 'lingoquest_custom_modules_v1';
const STORAGE_KEY_CURRENT_USER = 'lingoquest_current_user_id_v3';
const SESSION_INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes session timeout

// Safely write to localStorage and handle quota limits gracefully
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      // Purge any legacy cache entries to free up quota
      try {
        const toDelete: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            k &&
            k !== key &&
            (k.startsWith('lingoquest_modules') ||
              k.startsWith('lingoquest_cached') ||
              k.includes('quizzes'))
          ) {
            toDelete.push(k);
          }
        }
        toDelete.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(key, value);
        return;
      } catch {
        console.warn(`LocalStorage quota reached for "${key}". Data is retained safely in-memory.`);
      }
    } else {
      console.warn(`Could not save "${key}" to localStorage:`, err);
    }
  }
}

// Clean up legacy multi-megabyte curriculum dumps and v2 user caches from localStorage on boot
(function purgeLegacyBulkyStorage() {
  try {
    const keysToRemove: string[] = [
      'lingoquest_students_v2',
      'lingoquest_teachers_v2',
      'lingoquest_admins_v2',
      'lingoquest_current_user_id_v2',
      'lingoquest_cached_users_v2',
      'lingoquest_cached_audit_v2',
      'lingoquest_cached_emails_v1',
      'lingoquest_cached_feedback_v1',
    ];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('lingoquest_modules_v') ||
          key.startsWith('lingoquest_cached_modules') ||
          key.includes('25quizzes_per_module') ||
          key === 'lingoquest_modules_v13_25quizzes_per_module')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
  } catch {}
})();

function normalizeModuleIslands(rawModules: Module[]): Module[] {
  return rawModules.filter(m => ALL_MODULES.some(source => source.id === m.id)).map((m) => {
    const qInfo = DAVAO_ORIENTAL_QUARTER_ISLANDS[m.quarter as QuarterNumber];
    const with25 = ALL_MODULES.find(source => source.id === m.id)!;
    if (qInfo) {
      return {
        ...with25,
        islandName: qInfo.name,
        islandThemeColor: qInfo.themeColor,
      };
    }
    return with25;
  });
}

function normalizeTeacherClassCodes(rawTeachers: TeacherAccount[]): TeacherAccount[] {
  const existingCodes = new Set<string>();
  for (const t of rawTeachers) {
    if (t.classCode && t.classCode.trim()) {
      existingCodes.add(t.classCode.trim().toUpperCase());
    }
  }

  return rawTeachers.map((t) => {
    if (!t.classCode || !t.classCode.trim()) {
      let code = '';
      do {
        code = `LQ-ENG-${Math.floor(1000 + Math.random() * 9000)}`;
      } while (existingCodes.has(code));
      existingCodes.add(code);
      return { ...t, classCode: code };
    }
    return t;
  });
}

export default function App() {
  const { user: firebaseUser, logout: firebaseLogout } = useAuth();

  // Initialize Database / Local Storage
  const [students, setStudents] = useState<StudentAccount[]>([]);

  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);

  const [admins, setAdmins] = useState<AdminAccount[]>([]);

  const [modules, setModules] = useState<Module[]>(() => {
    const baseModules = normalizeModuleIslands(ALL_MODULES);
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_MODULES);
      if (saved) {
        const customList: Module[] = JSON.parse(saved);
        if (Array.isArray(customList) && customList.length > 0) {
          const map = new Map<string, Module>();
          baseModules.forEach((m) => map.set(m.id, m));
          normalizeModuleIslands(customList).forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('Failed to load custom modules, using base curriculum', e);
    }
    return baseModules;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotificationRecord[]>([]);
  const [systemFeedback, setSystemFeedback] = useState<SystemFeedbackRecord[]>([]);
  const [latestToastEmail, setLatestToastEmail] = useState<EmailNotificationRecord | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailModalFilter, setEmailModalFilter] = useState<string>('');

  // Active current user ID - clean start
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved && saved.trim() !== '' && saved !== 'guest-explorer') return 'MAP';
    } catch {}
    return 'AUTH';
  });

  // Active module for Lesson / Quiz
  const [selectedModule, setSelectedModule] = useState<Module>(() => {
    return modules.find((m) => m.gradeLevel === 8 && m.moduleNumber === 1) || modules[0];
  });
  const [lessonInitialStage, setLessonInitialStage] = useState<'LESSON' | 'QUIZ_SETUP'>('LESSON');

  // Personalization browsing state
  const [browseGrade, setBrowseGrade] = useState<GradeLevel>(8);
  const [isPersonalizationMode, setIsPersonalizationMode] = useState<boolean>(false);

  // Sound & Mobile menu
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFX.isMuted());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [questCoinBalance, setQuestCoinBalance] = useState<number | null>(null);

  // Session Timeout State
  const [isSessionTimeoutOpen, setIsSessionTimeoutOpen] = useState(false);
  const lastActivityTimeRef = useRef<number>(Date.now());

  // Logo Transition Animation State (Page Navigation, Sign In, Log Out)
  const [logoTransition, setLogoTransition] = useState<{
    active: boolean;
    exiting: boolean;
    title: string;
    subtitle: string;
    kind: 'signin' | 'logout' | 'navigate';
  }>({
    active: false,
    exiting: false,
    title: 'Loading LingoQuest...',
    subtitle: 'DepEd Davao Oriental · English Archipelago',
    kind: 'navigate',
  });
  const transitionTimersRef = useRef<{ exitTimer?: number; hideTimer?: number }>({});
  const prevViewRef = useRef<AppView>(currentView);
  const customTransitionTriggeredRef = useRef<boolean>(false);

  const triggerLogoTransition = (options: {
    title: string;
    subtitle?: string;
    kind?: 'signin' | 'logout' | 'navigate';
    durationMs?: number;
  }) => {
    if (transitionTimersRef.current.exitTimer) {
      window.clearTimeout(transitionTimersRef.current.exitTimer);
    }
    if (transitionTimersRef.current.hideTimer) {
      window.clearTimeout(transitionTimersRef.current.hideTimer);
    }

    const kind = options.kind || 'navigate';
    const holdDuration = options.durationMs ?? (kind === 'navigate' ? 430 : 650);

    setLogoTransition({
      active: true,
      exiting: false,
      title: options.title,
      subtitle: options.subtitle || 'DepEd Davao Oriental · English Archipelago',
      kind,
    });

    transitionTimersRef.current.exitTimer = window.setTimeout(() => {
      setLogoTransition((prev) => ({ ...prev, exiting: true }));
    }, holdDuration);

    transitionTimersRef.current.hideTimer = window.setTimeout(() => {
      setLogoTransition((prev) => ({ ...prev, active: false, exiting: false }));
    }, holdDuration + 280);
  };

  useEffect(() => {
    return () => {
      if (transitionTimersRef.current.exitTimer) {
        window.clearTimeout(transitionTimersRef.current.exitTimer);
      }
      if (transitionTimersRef.current.hideTimer) {
        window.clearTimeout(transitionTimersRef.current.hideTimer);
      }
    };
  }, []);

  // Automatically play logo transition whenever switching between pages/views
  useEffect(() => {
    if (prevViewRef.current === currentView) return;
    prevViewRef.current = currentView;

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}

    if (customTransitionTriggeredRef.current) {
      customTransitionTriggeredRef.current = false;
      return;
    }

    const viewMeta: Record<AppView, { title: string; subtitle: string }> = {
      AUTH: {
        title: 'Opening Sign In Portal...',
        subtitle: 'DepEd Davao Oriental · LingoQuest Authentication',
      },
      MAP: {
        title: 'Sailing to Island Quests...',
        subtitle: 'Loading Davao Oriental Curriculum Archipelago',
      },
      LESSON_QUIZ: {
        title: `Opening Module ${selectedModule?.moduleNumber || ''}...`,
        subtitle: selectedModule?.title || 'Preparing Lesson & Bridge Quest Challenges',
      },
      WRITING: {
        title: 'Entering Writing Lab...',
        subtitle: 'Preparing Guided English Composition Studio',
      },
      PROGRESS: {
        title: 'Loading My Progress...',
        subtitle: 'Syncing Bridge Restorations & Mastery Analytics',
      },
      LEADERBOARD: {
        title: 'Opening Your Grade Activity Board...',
        subtitle: 'Optional activity completions in your participating grade group',
      },
      PROFILE: {
        title: 'Loading Badges & Trophy Case...',
        subtitle: 'Retrieving Learner Achievement Medals',
      },
      MARKET: {
        title: 'Opening Quest Market...',
        subtitle: 'Loading Quest Coins, inventory, and exchange history',
      },
      STUDENT_DASHBOARD: {
        title: 'Opening Student Dashboard...',
        subtitle: 'Loading Learner Profile & Credentials',
      },
      TEACHER: {
        title: 'Opening Classroom Portal...',
        subtitle: 'Loading Faculty Roster & Performance Analytics',
      },
      ADMIN: {
        title: 'Opening Admin Console...',
        subtitle: 'Loading Division Governance & Curriculum Manager',
      },
      WAITING_APPROVAL: {
        title: 'Checking Verification Status...',
        subtitle: 'Reviewing DepEd Davao Oriental Enrollment State',
      },
    };

    const meta = viewMeta[currentView] || {
      title: 'Loading LingoQuest...',
      subtitle: 'DepEd Davao Oriental · English Archipelago',
    };

    triggerLogoTransition({
      title: meta.title,
      subtitle: meta.subtitle,
      kind: 'navigate',
      durationMs: 430,
    });
  }, [currentView, selectedModule]);

  // Hydrate only verified, server-authorized records. Ignore stale account-switch responses.
  useEffect(() => {
    let active = true;
    (firebaseUser ? privateBootstrap() : Promise.resolve({ users: [], customModules: [], auditLogs: [], emailNotifications: [], systemFeedback: [] }))
      .then((res) => {
        if (!active) return;
        if (res?.users && Array.isArray(res.users)) {
          const dbStudents = res.users.filter((u): u is StudentAccount => u.role === 'student');
          const dbTeachers = res.users.filter((u): u is TeacherAccount => u.role === 'teacher');
          const dbAdmins = res.users.filter((u): u is AdminAccount => u.role === 'admin');
          setStudents(dbStudents);
          setTeachers(normalizeTeacherClassCodes(dbTeachers));
          setAdmins(dbAdmins);
          setCurrentUserId(firebaseUser?.uid || '');
        }
        if (res?.customModules && Array.isArray(res.customModules) && res.customModules.length > 0) {
          setModules((prev) => {
            const map = new Map<string, Module>();
            prev.forEach((m) => map.set(m.id, m));
            normalizeModuleIslands(res.customModules!).forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }
        if (res?.auditLogs && Array.isArray(res.auditLogs) && res.auditLogs.length > 0) {
          setAuditLogs(res.auditLogs);
        }
        if (
          res?.emailNotifications &&
          Array.isArray(res.emailNotifications) &&
          res.emailNotifications.length > 0
        ) {
          setEmailNotifications(res.emailNotifications);
        }
        if (
          res?.systemFeedback &&
          Array.isArray(res.systemFeedback) &&
          res.systemFeedback.length > 0
        ) {
          setSystemFeedback(res.systemFeedback);
        }
      })
      .catch(() => { if (active) { setStudents([]); setTeachers([]); setAdmins([]); setCurrentUserId(''); } });
    return () => { active = false; };
  }, [firebaseUser?.uid]);

  // Subscribe to real-time email confirmation dispatches
  useEffect(() => {
    const unsubscribe = subscribeToEmailNotifications((allEmails, latestDispatched) => {
      setEmailNotifications(allEmails);
      if (latestDispatched) {
        setLatestToastEmail(latestDispatched);
      }
    });

    const handleOpenModalEvent = () => {
      setIsEmailModalOpen(true);
    };
    window.addEventListener('lingoquest:open-email-modal', handleOpenModalEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('lingoquest:open-email-modal', handleOpenModalEvent);
    };
  }, []);

  // Save changes to localStorage






  useEffect(() => {
    try {
      // Only persist custom/modified modules (modules created or modified by admin)
      const baseIds = new Set(ALL_MODULES.map((m) => m.id));
      const customOrModified = modules.filter(
        (m) => !baseIds.has(m.id) || (m as any).updatedAt || (m as any).isCustom
      );
      if (customOrModified.length > 0) {
        safeSetItem(STORAGE_KEY_CUSTOM_MODULES, JSON.stringify(customOrModified));
      } else {
        localStorage.removeItem(STORAGE_KEY_CUSTOM_MODULES);
      }
    } catch {}
  }, [modules]);

  useEffect(() => {
    try {
      if (currentUserId && currentUserId.trim() !== '') {
        safeSetItem(STORAGE_KEY_CURRENT_USER, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch {}
  }, [currentUserId]);

  // Determine current active user
  const currentStudent = students.find((s) => s.id === currentUserId) || null;
  const currentTeacher = teachers.find((t) => t.id === currentUserId) || null;
  const currentAdmin = admins.find((a) => a.id === currentUserId) || null;
  const currentUser: UserAccount | null = currentStudent || currentTeacher || currentAdmin;

  useEffect(() => {
    let active = true;
    const handleBalance = (event: Event) => {
      const balance = (event as CustomEvent<{ balance: number }>).detail?.balance;
      if (active && Number.isFinite(balance)) setQuestCoinBalance(balance);
    };
    window.addEventListener('lingoquest:quest-balance', handleBalance);
    if (currentStudent && supabase) {
      setQuestCoinBalance(null);
      questGame<{ balance: number }>('wallet')
        .then(({ balance }) => { if (active) setQuestCoinBalance(balance); })
        .catch(() => { if (active) setQuestCoinBalance(null); });
    } else {
      setQuestCoinBalance(null);
    }
    return () => {
      active = false;
      window.removeEventListener('lingoquest:quest-balance', handleBalance);
    };
  }, [currentStudent?.id]);

  // Always lock student to their enrolled grade level
  useEffect(() => {
    if (currentStudent) {
      setBrowseGrade((prev) => (prev !== currentStudent.gradeLevel ? currentStudent.gradeLevel : prev));
      setIsPersonalizationMode(false);
    }
  }, [currentStudent?.id, currentStudent?.gradeLevel]);

  // ----------------------------------------------------
  // Session Inactivity Tracker & Timeout Guard
  // ----------------------------------------------------
  useEffect(() => {
    const handleUserInteraction = () => {
      lastActivityTimeRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);

    const checkInterval = setInterval(() => {
      if (currentView !== 'AUTH' && currentUser) {
        const idleDuration = Date.now() - lastActivityTimeRef.current;
        if (idleDuration > SESSION_INACTIVITY_LIMIT_MS) {
          setIsSessionTimeoutOpen(true);
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      clearInterval(checkInterval);
    };
  }, [currentView, currentUser]);

  const handleSessionTimeoutLogOut = () => {
    setIsSessionTimeoutOpen(false);
    handleLogOut();
  };

  const handleStayLoggedIn = () => {
    lastActivityTimeRef.current = Date.now();
    setIsSessionTimeoutOpen(false);
  };

  // ----------------------------------------------------
  // Route Guards by Role
  // ----------------------------------------------------
  useEffect(() => {
    if (currentView === 'AUTH') return;

    if (!currentUser) {
      setCurrentView('AUTH');
      return;
    }

    if (currentUser.role === 'teacher') {
      if (currentUser.status === 'pending' || currentUser.status === 'rejected' || currentUser.status === 'suspended') {
        setCurrentView('WAITING_APPROVAL');
      } else if (currentView !== 'TEACHER' && currentView !== 'MAP') {
        setCurrentView('TEACHER');
      }
    } else if (currentUser.role === 'admin') {
      if (currentView === 'WAITING_APPROVAL') {
        setCurrentView('ADMIN');
      }
    } else if (currentUser.role === 'student') {
      const studentAcc = currentUser as StudentAccount;
      if (
        studentAcc.status === 'pending' ||
        studentAcc.status === 'rejected' ||
        studentAcc.enrollmentStatus === 'pending_review' ||
        studentAcc.enrollmentStatus === 'rejected'
      ) {
        setCurrentView('WAITING_APPROVAL');
      } else if (currentView === 'TEACHER' || currentView === 'ADMIN' || currentView === 'WAITING_APPROVAL') {
        setCurrentView('MAP');
      }
    }
  }, [currentUser, currentView]);

  // Audio mute toggle
  const handleToggleSound = () => {
    const next = !isMuted;
    soundFX.setMuted(next);
    setIsMuted(next);
    if (!next) soundFX.playClick();
  };

  // Login handler
  const handleLoginSuccess = (account: UserAccount) => {
    soundFX.playPass();
    customTransitionTriggeredRef.current = true;
    const roleLabel =
      account.role === 'admin'
        ? 'Division Admin Console'
        : account.role === 'teacher'
        ? 'Faculty Classroom Portal'
        : `Grade ${(account as StudentAccount).gradeLevel} Island Archipelago`;

    triggerLogoTransition({
      title: `Welcome, ${account.name}!`,
      subtitle: `Signing in to ${roleLabel}...`,
      kind: 'signin',
      durationMs: 680,
    });

    if (account.role === 'student') {
      setStudents((prev) =>
        prev.some((s) => s.id === account.id)
          ? prev.map((s) => (s.id === account.id ? (account as StudentAccount) : s))
          : [account as StudentAccount, ...prev]
      );

      if (supabase) {
        hydrateStudentProgressFromSupabase(account as StudentAccount)
          .then((merged) => {
            setStudents((prev) => prev.map((s) => s.id === account.id ? merged : s));
          })
          .catch((error) => console.warn('Supabase progress hydration failed:', error));
      } else {
        // Preserve the existing Firebase path for deployments without Supabase.
        const targetUid = firebaseUser?.uid || account.id;
        syncUserProfileToFirestore(targetUid, account, false).catch(() => {});
        mergeLocalGuestProgressIntoStudent(targetUid, account as StudentAccount)
          .then((merged) => {
          setStudents((prev) =>
            prev.map((s) => (s.id === account.id ? merged : s))
          );
          })
          .catch(() => {});
      }
    } else if (account.role === 'teacher') {
      setTeachers((prev) =>
        prev.some((t) => t.id === account.id)
          ? prev.map((t) => (t.id === account.id ? (account as TeacherAccount) : t))
          : [account as TeacherAccount, ...prev]
      );
      if (firebaseUser?.uid) {
        syncUserProfileToFirestore(firebaseUser.uid, account, false).catch(() => {});
      }
    } else if (account.role === 'admin') {
      setAdmins((prev) =>
        prev.some((a) => a.id === account.id)
          ? prev.map((a) => (a.id === account.id ? (account as AdminAccount) : a))
          : [account as AdminAccount, ...prev]
      );
    }

    setCurrentUserId(account.id);
    lastActivityTimeRef.current = Date.now();

    if (account.role === 'teacher') {
      if (account.status === 'pending' || account.status === 'rejected' || account.status === 'suspended') {
        setCurrentView('WAITING_APPROVAL');
      } else {
        setCurrentView('TEACHER');
      }
    } else if (account.role === 'admin') {
      setCurrentView('ADMIN');
    } else {
      setBrowseGrade(account.gradeLevel);
      setIsPersonalizationMode(false);
      const studentAcc = account as StudentAccount;
      if (
        studentAcc.status === 'pending' ||
        studentAcc.status === 'rejected' ||
        studentAcc.enrollmentStatus === 'pending_review' ||
        studentAcc.enrollmentStatus === 'rejected'
      ) {
        setCurrentView('WAITING_APPROVAL');
      } else {
        setCurrentView('MAP');
      }
    }
  };

  const handleOpenEmailInbox = (filterEmail?: string) => {
    soundFX.playClick();
    setEmailModalFilter(filterEmail || '');
    setIsEmailModalOpen(true);
  };

  // Registration: Student
  const handleRegisterStudent = async (newStudentData: {
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
  }): Promise<StudentAccount> => {
    const created = await apiRegisterNewStudent({
      ...newStudentData,
      section: newStudentData.section || '',
      learnerId: newStudentData.lrn,
    });
    customTransitionTriggeredRef.current = true;
    triggerLogoTransition({
      title: `Welcome Aboard, ${created.name}!`,
      subtitle: 'Preparing your Student Enrollment Portal...',
      kind: 'signin',
      durationMs: 680,
    });
    setStudents((prev) => [created, ...prev]);
    setCurrentUserId(created.id);
    setBrowseGrade(created.gradeLevel);
    setIsPersonalizationMode(false);
    if (
      created.status === 'pending' ||
      created.status === 'rejected' ||
      created.enrollmentStatus === 'pending_review' ||
      created.enrollmentStatus === 'rejected'
    ) {
      setCurrentView('WAITING_APPROVAL');
    } else {
      setCurrentView('MAP');
    }
    return created;
  };

  // Student Profile & Credentials Updates (Name, Email, Password, Picture, Section)
  const handleUpdateStudentProfile = async (updates: {
    name?: string;
    email?: string;
    password?: string;
    photoUrl?: string;
    section?: string;
    lrn?: string;
    learnerId?: string;
    gradeLevel?: GradeLevel;
    schoolName?: string;
  }): Promise<{ success: boolean; student?: StudentAccount; error?: string }> => {
    if (!currentStudent) {
      return { success: false, error: 'No active student session found.' };
    }
    const res = await apiUpdateStudentProfile(currentStudent.id, updates);
    if (res.success && res.student) {
      const updated = res.student;
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return { success: true, student: updated };
    }
    return { success: false, error: res.error || 'Failed to update student profile.' };
  };

  // Teacher updating a student's information (Grade level, LRN verification, School name, Section)
  const handleTeacherUpdateStudent = async (
    studentId: string,
    updates: {
      gradeLevel?: GradeLevel;
      lrn?: string;
      learnerId?: string;
      schoolName?: string;
      section?: string;
      name?: string;
    }
  ): Promise<{ success: boolean; student?: StudentAccount; error?: string }> => {
    const res = await apiUpdateStudentProfile(studentId, updates);
    if (res.success && res.student) {
      const updated = res.student;
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return { success: true, student: updated };
    }
    return { success: false, error: res.error || 'Failed to update student profile.' };
  };

  // Teacher Profile & Credentials Updates (Name, DepEd Email, Password, School, Dept, Photo)
  const handleUpdateTeacherProfile = async (updates: {
    name?: string;
    depEdEmail?: string;
    email?: string;
    password?: string;
    schoolName?: string;
    department?: string;
    photoUrl?: string;
  }): Promise<{ success: boolean; teacher?: TeacherAccount; error?: string }> => {
    if (!currentTeacher) {
      return { success: false, error: 'No active teacher session found.' };
    }
    const res = await apiUpdateTeacherProfile(currentTeacher.id, updates);
    if (res.success && res.teacher) {
      const updated = res.teacher;
      setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      return { success: true, teacher: updated };
    }
    return { success: false, error: res.error || 'Failed to update faculty profile.' };
  };

  // Password Recovery linked to email for both Students and Teachers
  const handleRecoverPassword = async (
    role: 'student' | 'teacher',
    identifier: string,
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    const res = await apiRecoverUserPassword({
      role,
      identifier,
      email,
      newPassword,
    });
    if (res.success && res.user) {
      if (role === 'student') {
        const updatedStu = res.user as StudentAccount;
        setStudents((prev) => prev.map((s) => (s.id === updatedStu.id ? updatedStu : s)));
      } else {
        const updatedTch = res.user as TeacherAccount;
        setTeachers((prev) => prev.map((t) => (t.id === updatedTch.id ? updatedTch : t)));
      }
    }
    return res;
  };

  // Registration: Teacher
  const handleRegisterTeacher = async (newTeacherData: {
    name: string;
    employeeId: string;
    schoolName: string;
    department: string;
    depEdEmail: string;
    username: string;
    password?: string;
    classCode?: string;
  }): Promise<TeacherAccount> => {
    const created = await apiRegisterNewTeacher(newTeacherData);
    customTransitionTriggeredRef.current = true;
    triggerLogoTransition({
      title: `Faculty Profile Created!`,
      subtitle: 'Routing to Division Approval Verification...',
      kind: 'signin',
      durationMs: 680,
    });
    setTeachers((prev) => [created, ...prev]);
    setCurrentUserId(created.id);
    // Route to waiting for approval screen!
    setCurrentView('WAITING_APPROVAL');
    return created;
  };

  // Verify class code helper
  const handleVerifyClassCode = (classCode: string) => {
    return apiVerifyClassCode(classCode, teachers);
  };

  // Refresh status for waiting teacher or student
  const handleRefreshTeacherStatus = () => {
    const curTeacher = teachers.find((t) => t.id === currentUserId);
    if (curTeacher && curTeacher.status === 'approved') {
      soundFX.playPass();
      setCurrentView('TEACHER');
      return;
    }
    const curStudent = students.find((s) => s.id === currentUserId);
    if (curStudent && curStudent.status === 'approved') {
      soundFX.playPass();
      setCurrentView('MAP');
      return;
    }
  };

  // Log Out
  const handleLogOut = () => {
    soundFX.playClick();
    customTransitionTriggeredRef.current = true;
    triggerLogoTransition({
      title: 'Signing Out of LingoQuest...',
      subtitle: 'Saving your progress & returning to Sign In...',
      kind: 'logout',
      durationMs: 620,
    });
    firebaseLogout().catch(() => {});
    setStudents([]); setTeachers([]); setAdmins([]); setAuditLogs([]);
    setEmailNotifications([]); setSystemFeedback([]); setLatestToastEmail(null);
    setCurrentUserId('');
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } catch (e) {
      console.error('Failed to clear current user ID', e);
    }
    setIsMobileMenuOpen(false);
    setIsSessionTimeoutOpen(false);
    setCurrentView('AUTH');
  };

  // Module selection from map or progress
  const handleSelectModule = (mod: Module, startDirectlyInQuiz: boolean = false) => {
    soundFX.playClick();
    // Strictly prevent student from opening modules from other grade levels
    if (currentStudent) {
      if (mod.gradeLevel !== currentStudent.gradeLevel) {
        soundFX.playIncorrect();
        return;
      }
      if (!isStudentModuleUnlocked(mod, currentStudent, modules)) {
        soundFX.playIncorrect();
        return;
      }
    }
    setSelectedModule(mod);
    setBrowseGrade(mod.gradeLevel);
    const isLessonDone = Boolean(currentStudent?.progressByModule[mod.id]?.lessonCompleted);
    setLessonInitialStage(startDirectlyInQuiz && (isLessonDone || !currentStudent) ? 'QUIZ_SETUP' : 'LESSON');
    setCurrentView('LESSON_QUIZ');
  };

  // Complete lesson
  const handleCompleteLesson = (moduleId: string) => {
    if (!currentStudent) return;

    setStudents((prevStudents) =>
      prevStudents.map((st) => {
        if (st.id !== currentStudent.id) return st;

        const currentProg = st.progressByModule[moduleId] || {
          moduleId,
          lessonCompleted: false,
          isBridgeRestored: false,
          bestScorePercent: 0,
          attemptsCount: 0,
          completedDifficulties: [],
          lastAttemptDate: new Date().toISOString().split('T')[0],
          quizHistory: [],
        };

        const newlyCompleted = !currentProg.lessonCompleted;
        const updatedProg: ModuleProgress = {
          ...currentProg,
          lessonCompleted: true,
          lastAttemptDate: new Date().toISOString().split('T')[0],
        };

        const updatedBadges = Array.from(new Set([...st.badges, 'first_lesson']));

        const bonusPoints = newlyCompleted ? 50 : 10;
        const updatedStudent: StudentAccount = {
          ...st,
          points: st.points + bonusPoints,
          badges: updatedBadges,
          progressByModule: {
            ...st.progressByModule,
            [moduleId]: updatedProg,
          },
        };

        apiPersistStudentProgress(updatedStudent, moduleId, updatedProg);
        const targetUid = firebaseUser?.uid || updatedStudent.id;
        if (!supabase) syncStudentProgressToFirestore(targetUid, updatedStudent).catch(() => {});
        return updatedStudent;
      })
    );
  };

  // Award XP & unlock Visual Learner / Explainer Explorer badges on visual activity completion (once per item)
  const handleAwardVisualXP = (
    moduleId: string,
    activityKey: string,
    xpAmount: number
  ): { newlyAwarded: boolean; unlockedBadges: string[] } => {
    if (!currentStudent) {
      return { newlyAwarded: true, unlockedBadges: [] };
    }

    const existingProg = currentStudent.progressByModule[moduleId] || {
      moduleId,
      lessonCompleted: false,
      isBridgeRestored: false,
      bestScorePercent: 0,
      attemptsCount: 0,
      completedDifficulties: [],
      lastAttemptDate: new Date().toISOString().split('T')[0],
      quizHistory: [],
      visualInteractionsCompleted: [],
      visualXpEarned: 0,
    };

    const existingVisuals = existingProg.visualInteractionsCompleted || [];
    if (existingVisuals.includes(activityKey)) {
      return { newlyAwarded: false, unlockedBadges: [] };
    }

    const updatedVisuals = Array.from(new Set([...existingVisuals, activityKey]));

    // Count total visual activities and explainers across all modules for badge unlocking
    let totalVisualActivities = updatedVisuals.length;
    let totalExplainersWatched = updatedVisuals.includes('explainer') ? 1 : 0;

    Object.entries(currentStudent.progressByModule).forEach(([mId, prog]) => {
      if (mId === moduleId) return;
      const items = prog.visualInteractionsCompleted || [];
      totalVisualActivities += items.length;
      if (items.includes('explainer')) {
        totalExplainersWatched += 1;
      }
    });

    const unlockedBadges: string[] = [];
    let badgeBonusXp = 0;

    if (totalVisualActivities >= 3 && !currentStudent.badges.includes('visual_learner')) {
      unlockedBadges.push('visual_learner');
      badgeBonusXp += 75;
    }

    if (totalExplainersWatched >= 3 && !currentStudent.badges.includes('explainer_explorer')) {
      unlockedBadges.push('explainer_explorer');
      badgeBonusXp += 100;
    }

    setStudents((prevStudents) =>
      prevStudents.map((st) => {
        if (st.id !== currentStudent.id) return st;

        const curProg = st.progressByModule[moduleId] || existingProg;
        const updatedProg: ModuleProgress = {
          ...curProg,
          visualInteractionsCompleted: updatedVisuals,
          visualXpEarned: (curProg.visualXpEarned || 0) + xpAmount,
          lastAttemptDate: new Date().toISOString().split('T')[0],
        };

        const updatedBadges = Array.from(new Set([...st.badges, ...unlockedBadges]));
        const updatedStudent: StudentAccount = {
          ...st,
          points: st.points + xpAmount + badgeBonusXp,
          badges: updatedBadges,
          progressByModule: {
            ...st.progressByModule,
            [moduleId]: updatedProg,
          },
        };

        apiPersistStudentProgress(updatedStudent, moduleId, updatedProg);
        const targetUid = firebaseUser?.uid || updatedStudent.id;
        if (!supabase) syncStudentProgressToFirestore(targetUid, updatedStudent).catch(() => {});
        return updatedStudent;
      })
    );

    return { newlyAwarded: true, unlockedBadges };
  };

  // Submit quiz results & check bridge restoration & badges
  const handleSubmitQuizResult = (payload: QuizCompletionPayload) => {
    if (!currentStudent) {
      return { totalPointsAwarded: 0, newlyUnlockedBadges: [], bridgeNewlyRestored: false };
    }

    const mod = modules.find((m) => m.id === payload.moduleId) || selectedModule;
    const isPersonalization = mod.gradeLevel !== currentStudent.gradeLevel;

    // Compute progression and badge unlocks cleanly outside the state updater
    const existingProg = currentStudent.progressByModule[payload.moduleId] || {
      moduleId: payload.moduleId,
      lessonCompleted: true,
      isBridgeRestored: false,
      bestScorePercent: 0,
      attemptsCount: 0,
      completedDifficulties: [],
      lastAttemptDate: new Date().toISOString().split('T')[0],
      quizHistory: [],
    };

    const isPassed = payload.passed;
    const bridgeNewlyRestored = Boolean(isPassed && !existingProg.isBridgeRestored);

    let bonusPoints = 0;
    if (bridgeNewlyRestored) {
      bonusPoints += 120; // Bridge restore bonus
    }

    const newlyUnlockedBadges: string[] = [];
    if (isPassed && !currentStudent.badges.includes('first_quiz_pass')) {
      newlyUnlockedBadges.push('first_quiz_pass');
      bonusPoints += 100;
    }

    if (
      bridgeNewlyRestored &&
      !currentStudent.badges.includes('bridge_builder_1') &&
      !newlyUnlockedBadges.includes('bridge_builder_1')
    ) {
      newlyUnlockedBadges.push('bridge_builder_1');
      bonusPoints += 120;
    }

    const totalPointsAwarded = payload.basePointsEarned + bonusPoints;

    setStudents((prevStudents) =>
      prevStudents.map((st) => {
        if (st.id !== currentStudent.id) return st;

        const currentProg = st.progressByModule[payload.moduleId] || existingProg;

        const updatedDifficulties = Array.from(
          new Set([...currentProg.completedDifficulties, payload.difficulty])
        );

        const newAttemptRecord: QuizAttemptRecord = {
          id: `att-${Date.now()}`,
          moduleId: payload.moduleId,
          moduleTitle: mod.title,
          gradeLevel: mod.gradeLevel,
          quarter: mod.quarter,
          difficulty: payload.difficulty,
          gameModeFilter: payload.gameModeFilter,
          score: payload.score,
          totalQuestions: payload.totalQuestions,
          percentage: payload.percentage,
          passed: isPassed,
          pointsEarned: totalPointsAwarded,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          isPersonalization,
        };

        const updatedProg: ModuleProgress = {
          ...currentProg,
          attemptsCount: currentProg.attemptsCount + 1,
          bestScorePercent: Math.max(currentProg.bestScorePercent, payload.percentage),
          isBridgeRestored: currentProg.isBridgeRestored || isPassed,
          completedDifficulties: updatedDifficulties,
          lastAttemptDate: new Date().toISOString().split('T')[0],
          quizHistory: [newAttemptRecord, ...currentProg.quizHistory],
        };

        const updatedBadges = Array.from(new Set([...st.badges, ...newlyUnlockedBadges]));

        const updatedStudent: StudentAccount = {
          ...st,
          points: st.points + totalPointsAwarded,
          badges: updatedBadges,
          completedModules: Array.from(
            new Set([...st.completedModules, isPassed ? payload.moduleId : '']).values()
          ).filter(Boolean),
          progressByModule: {
            ...st.progressByModule,
            [payload.moduleId]: updatedProg,
          },
        };

        apiPersistStudentProgress(updatedStudent, payload.moduleId, updatedProg);
        const targetUid = firebaseUser?.uid || updatedStudent.id;
        if (!supabase) syncStudentProgressToFirestore(targetUid, updatedStudent).catch(() => {});
        recordQuizResultToFirestore({
          uid: firebaseUser?.uid || updatedStudent.id,
          questId: payload.moduleId,
          moduleTitle: mod.title,
          difficulty: payload.difficulty,
          score: payload.score,
          total: payload.totalQuestions,
          percentage: payload.percentage,
          passed: isPassed,
          timeSpent: 60,
        }).catch(() => {});
        return updatedStudent;
      })
    );

    return {
      totalPointsAwarded,
      newlyUnlockedBadges: Array.from(new Set(newlyUnlockedBadges)),
      bridgeNewlyRestored,
    };
  };

  // Next module in sequence
  const currentGradeModules = modules
    .filter((m) => m.gradeLevel === selectedModule.gradeLevel)
    .sort((a, b) => a.moduleNumber - b.moduleNumber || a.quarter - b.quarter);
  const currentModIdx = currentGradeModules.findIndex((m) => m.id === selectedModule.id);
  const nextModule =
    currentModIdx >= 0 && currentModIdx < currentGradeModules.length - 1
      ? currentGradeModules[currentModIdx + 1]
      : null;

  const handleAdvanceToNextModule = () => {
    if (nextModule) {
      handleSelectModule(nextModule, false);
    } else {
      setCurrentView('MAP');
    }
  };

  // Open writing lab
  const handleOpenWritingLabWithPrompt = (mod: Module) => {
    setSelectedModule(mod);
    setCurrentView('WRITING');
  };

  // Save writing submission
  const handleSaveWritingSubmission = (submission: WritingSubmissionRecord) => {
    if (!currentStudent) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudent.id) return s;
        const updatedBadges = Array.from(new Set([...s.badges, 'ai_writer']));
        return {
          ...s,
          points: s.points + 100,
          badges: updatedBadges,
          writingSubmissions: [submission, ...(s.writingSubmissions || [])],
        };
      })
    );
  };

  // Grade exploration - strictly disabled for enrolled students
  const handleTogglePersonalization = (enabled: boolean, targetGrade?: GradeLevel) => {
    if (currentStudent) {
      // Enrolled students are strictly locked to their assigned grade level
      setBrowseGrade(currentStudent.gradeLevel);
      setIsPersonalizationMode(false);
      return;
    }
    if (targetGrade) {
      setBrowseGrade(targetGrade);
      setIsPersonalizationMode(enabled);
    } else {
      setIsPersonalizationMode(enabled);
    }
  };

  // Admin Actions
  const handleAdminApproveTeacher = async (teacherId: string, customClassCode?: string) => {
    if (!currentAdmin) return { success: false, classCode: '' };
    const res = await apiApproveTeacher(teacherId, currentAdmin, customClassCode);
    if (res.success) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, status: 'approved', classCode: res.classCode } : t))
      );
      apiGetAuditLogs().then(setAuditLogs);
    }
    return res;
  };

  const handleAdminUpdateTeacherClassCode = async (teacherId: string, newClassCode: string) => {
    if (!currentAdmin) return { success: false, classCode: '', error: 'Unauthorized' };
    const res = await apiUpdateTeacherClassCode(teacherId, newClassCode, currentAdmin);
    if (res.success) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, classCode: res.classCode } : t))
      );
      apiGetAuditLogs().then(setAuditLogs);
    }
    return res;
  };

  const handleAdminRejectTeacher = async (teacherId: string, reason: string) => {
    if (!currentAdmin) return false;
    const ok = await apiRejectTeacher(teacherId, reason, currentAdmin);
    if (ok) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, status: 'rejected', rejectionReason: reason } : t))
      );
      apiGetAuditLogs().then(setAuditLogs);
    }
    return ok;
  };

  const handleAdminSuspendUser = async (userId: string, reason: string) => {
    if (!currentAdmin) return false;
    const ok = await apiSuspendUser(userId, reason, currentAdmin);
    if (ok) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === userId ? { ...t, status: 'suspended', isActive: false, suspensionReason: reason } : t))
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, status: 'suspended', isActive: false, suspensionReason: reason } : s))
      );
      setAdmins((prev) =>
        prev.map((a) => (a.id === userId ? { ...a, status: 'suspended', isActive: false, suspensionReason: reason } : a))
      );
      apiGetAuditLogs().then(setAuditLogs);
    }
    return ok;
  };

  const handleAdminReactivateUser = async (userId: string) => {
    if (!currentAdmin) return false;
    const ok = await apiReactivateUser(userId, currentAdmin);
    if (ok) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === userId ? { ...t, status: 'approved', isActive: true, rejectionReason: '', suspensionReason: '' } : t))
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, status: 'approved', isActive: true, suspensionReason: '' } : s))
      );
      setAdmins((prev) =>
        prev.map((a) => (a.id === userId ? { ...a, status: 'approved', isActive: true, suspensionReason: '' } : a))
      );
      apiGetAuditLogs().then(setAuditLogs);
    }
    return ok;
  };

  const handleAdminDeleteStudent = async (studentId: string, reason?: string) => {
    if (!currentAdmin) return false;
    const ok = await apiDeleteStudentAccount(studentId, currentAdmin, reason);
    if (ok) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      apiGetAuditLogs().then(setAuditLogs);
    }
    return ok;
  };

  const handleAdminCreateModule = async (mod: Module) => {
    if (!currentAdmin) return mod;
    const created = await apiCreateNewModule(mod, currentAdmin);
    setModules((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
    apiGetAuditLogs().then(setAuditLogs);
    return created;
  };

  const handleAdminUpdateModule = async (mod: Module) => {
    if (!currentAdmin) return mod;
    const updated = await apiUpdateExistingModule(mod, currentAdmin);
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    apiGetAuditLogs().then(setAuditLogs);
    return updated;
  };

  const handleAdminDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!currentAdmin) return false;
    const ok = await apiDeleteExistingModule(moduleId, moduleTitle, currentAdmin);
    if (ok) {
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      apiGetAuditLogs().then(setAuditLogs);
    }
    return ok;
  };

  const handleAdminDeleteTeacher = async (teacherId: string, reason?: string) => {
    if (!currentAdmin) return false;
    const ok = await apiDeleteTeacherAccount(teacherId, currentAdmin, reason);
    if (ok) {
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      apiGetAuditLogs().then(setAuditLogs);
    }
    return ok;
  };

  const handleAdminAddSubAdmin = async (subAdminData: {
    name: string;
    email: string;
    username: string;
    password?: string;
    adminTitle: string;
    employeeId: string;
  }) => {
    if (!currentAdmin) return { success: false, error: 'Not authenticated' };
    const res = await apiCreateSubAdmin(subAdminData, currentAdmin);
    if (res.success && res.subAdmin) {
      setAdmins((prev) => [...prev, res.subAdmin!]);
      apiGetAuditLogs().then(setAuditLogs);
    }
    return res;
  };

  const handleAdminUpdateSubAdmin = async (
    subAdminId: string,
    updates: Partial<AdminAccount>
  ) => {
    if (!currentAdmin) return { success: false, error: 'Not authenticated' };
    const res = await apiUpdateSubAdmin(subAdminId, updates, currentAdmin);
    if (res.success && res.subAdmin) {
      setAdmins((prev) => prev.map((a) => (a.id === subAdminId ? res.subAdmin! : a)));
      apiGetAuditLogs().then(setAuditLogs);
    }
    return res;
  };

  const handleAdminDeleteSubAdmin = async (subAdminId: string, reason?: string) => {
    if (!currentAdmin) return { success: false, error: 'Not authenticated' };
    const res = await apiDeleteSubAdmin(subAdminId, currentAdmin, reason);
    if (res.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== subAdminId));
      apiGetAuditLogs().then(setAuditLogs);
    }
    return res;
  };

  const handleAdminArchiveAuditLog = async (logId: string) => {
    if (!currentAdmin) return false;
    const ok = await apiArchiveAuditLog(logId, currentAdmin);
    if (ok) {
      const now = new Date().toISOString();
      setAuditLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? { ...l, isArchived: true, archivedAt: now, archivedBy: currentAdmin.name }
            : l
        )
      );
    }
    return ok;
  };

  const handleAdminUnarchiveAuditLog = async (logId: string) => {
    if (!currentAdmin) return false;
    const ok = await apiUnarchiveAuditLog(logId, currentAdmin);
    if (ok) {
      setAuditLogs((prev) =>
        prev.map((l) =>
          l.id === logId ? { ...l, isArchived: false, archivedAt: undefined, archivedBy: undefined } : l
        )
      );
    }
    return ok;
  };

  const handleAdminDeleteAuditLog = async (logId: string) => {
    if (!currentAdmin) return false;
    const ok = await apiDeleteAuditLog(logId, currentAdmin);
    if (ok) {
      setAuditLogs((prev) => prev.filter((l) => l.id !== logId));
    }
    return ok;
  };

  const handleAdminBulkArchiveAuditLogs = async (logIds: string[]) => {
    if (!currentAdmin || logIds.length === 0) return false;
    const ok = await apiBulkArchiveAuditLogs(logIds, currentAdmin);
    if (ok) {
      const idSet = new Set(logIds);
      const now = new Date().toISOString();
      setAuditLogs((prev) =>
        prev.map((l) =>
          idSet.has(l.id)
            ? { ...l, isArchived: true, archivedAt: now, archivedBy: currentAdmin.name }
            : l
        )
      );
    }
    return ok;
  };

  const handleAdminBulkDeleteAuditLogs = async (logIds: string[]) => {
    if (!currentAdmin || logIds.length === 0) return false;
    const ok = await apiBulkDeleteAuditLogs(logIds, currentAdmin);
    if (ok) {
      const idSet = new Set(logIds);
      setAuditLogs((prev) => prev.filter((l) => !idSet.has(l.id)));
    }
    return ok;
  };

  const handleTeacherReviewStudent = async (
    studentId: string,
    action: 'approve' | 'reject',
    updates?: {
      name?: string;
      lrn?: string;
      gradeLevel?: GradeLevel;
      schoolName?: string;
      section?: string;
    },
    note?: string
  ): Promise<{ success: boolean; student?: StudentAccount; error?: string }> => {
    if (!currentTeacher) {
      return { success: false, error: 'No active teacher session found.' };
    }
    const res = await apiReviewStudentEnrollment(studentId, currentTeacher, action, updates, note);
    if (res.success && res.student) {
      const updated = res.student;
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return { success: true, student: updated };
    }
    return { success: false, error: res.error || 'Failed to review student enrollment.' };
  };

  const handleRefreshAdminData = async () => {
    const [logs, feedbackList] = await Promise.all([
      apiGetAuditLogs(),
      apiGetAllSystemFeedback(),
    ]);
    setAuditLogs(logs);
    setSystemFeedback(feedbackList);
  };

  const handleUserSubmitFeedback = async (payload: {
    category: FeedbackCategory;
    priority: FeedbackPriority;
    targetArea: string;
    subject: string;
    message: string;
  }): Promise<SystemFeedbackRecord> => {
    const activeUser = currentStudent || currentTeacher;
    if (!activeUser) {
      throw new Error('Please sign in as a student or teacher to submit feedback.');
    }
    const email =
      activeUser.role === 'teacher'
        ? activeUser.depEdEmail || activeUser.email || ''
        : activeUser.email;
    const created = await apiSubmitSystemFeedback({
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      userEmail: email,
      schoolName: activeUser.schoolName,
      gradeLevel: activeUser.role === 'student' ? activeUser.gradeLevel : undefined,
      classCode: activeUser.classCode,
      category: payload.category,
      priority: payload.priority,
      targetArea: payload.targetArea,
      subject: payload.subject,
      message: payload.message,
    });
    setSystemFeedback((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
    return created;
  };

  const handleAdminUpdateFeedbackStatus = async (
    feedbackId: string,
    updates: { status: FeedbackStatus; adminResponse?: string }
  ) => {
    if (!currentAdmin) return;
    const updated = await apiUpdateSystemFeedbackStatus(feedbackId, updates, currentAdmin);
    if (updated) {
      setSystemFeedback((prev) => prev.map((f) => (f.id === feedbackId ? updated : f)));
      const logs = await apiGetAuditLogs();
      setAuditLogs(logs);
    }
  };

  const handleAdminDeleteFeedback = async (feedbackId: string) => {
    if (!currentAdmin) return;
    const ok = await apiDeleteSystemFeedbackItem(feedbackId, currentAdmin);
    if (ok) {
      setSystemFeedback((prev) => prev.filter((f) => f.id !== feedbackId));
      const logs = await apiGetAuditLogs();
      setAuditLogs(logs);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231F20] flex flex-col font-sans selection:bg-[#22C55E]/25 selection:text-[#231F20]">
      {/* Persistent Offline / Online Connection Status Toast */}
      <NetworkStatusToast />

      {/* Universal Logo Transition Overlay (Sign In, Log Out, Page Navigation) */}
      <LogoTransitionOverlay
        active={logoTransition.active}
        exiting={logoTransition.exiting}
        title={logoTransition.title}
        subtitle={logoTransition.subtitle}
        kind={logoTransition.kind}
      />

      {/* Session Inactivity Timeout Modal */}
      {isSessionTimeoutOpen && (
        <div className="fixed inset-0 z-50 nipa-modal-backdrop flex items-center justify-center p-4">
          <div className="linocut-card rounded-2xl max-w-md w-full overflow-hidden text-center jeepney-modal-enter">
            <InabelWovenStrip variant="crimson" height={10} />
            <div className="p-6 space-y-4 bg-[#FFFDFB]">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF3E0] border-2 border-[#231F20] text-[#D84315] flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-display text-[#231F20]">Session Timeout Warning</h3>
              <p className="text-xs text-[#6D4C41]">
                You have been inactive for over 15 minutes. For security compliance with DepEd student and faculty privacy, your session will expire.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleStayLoggedIn}
                  className="px-5 py-2.5 rounded-xl btn-fiesta font-bold text-xs cursor-pointer"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={handleSessionTimeoutLogOut}
                  className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] border-2 border-[#231F20] text-[#231F20] font-bold text-xs transition cursor-pointer"
                >
                  Log Out Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Universal App Navigation Bar (Neo-Filipiniana & Folk-Mural Edition) */}
      {currentView !== 'AUTH' && currentView !== 'WAITING_APPROVAL' && (
        <header data-dashboard-theme className="sticky top-0 z-40 bg-[#231F20] text-[#FAF7F2] border-b-[3px] border-[#2563EB] shadow-[0_4px_0_#231F20]">
          {/* Traditional Handwoven Inabel & Yakan Geometric Top Strip */}
          <InabelWovenStrip variant="crimson" height={8} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Brand Logo & Tagline */}
            <div
              onClick={() => {
                soundFX.playClick();
                if (currentUser?.role === 'admin') setCurrentView('ADMIN');
                else if (currentUser?.role === 'teacher') setCurrentView('TEACHER');
                else setCurrentView('MAP');
              }}
              className="cursor-pointer shrink-0"
            >
              <span className="hidden sm:block"><LingoQuestLogo size="md" textColor="light" animated={true} /></span>
              <span className="sm:hidden"><LingoQuestLogo size="sm" textColor="light" animated={true} /></span>
            </div>

            {/* Navigation Links based on Active Role */}
            {currentUser && (
              <nav className="hidden lg:flex items-center gap-1 bg-[#FFFDFB]/10 border-2 border-[#2563EB] px-2 py-1 rounded-xl text-xs font-bold text-[#FAF7F2]">
                {currentUser.role === 'student' && (
                  <>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('STUDENT_DASHBOARD');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'STUDENT_DASHBOARD'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Student Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('MAP');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'MAP'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Island Quests
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('WRITING');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'WRITING'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Writing Lab
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('PROGRESS');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'PROGRESS'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      My Progress
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('LEADERBOARD');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'LEADERBOARD'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Grade Activity Board
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('PROFILE');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'PROFILE'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Badges
                    </button>
                    <button
                      onClick={() => { soundFX.playClick(); setCurrentView('MARKET'); }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${currentView === 'MARKET' ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold' : 'hover:text-[#22C55E] hover:bg-white/5'}`}
                    >Quest Market</button>
                  </>
                )}

                {currentUser.role === 'teacher' && (
                  <>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('TEACHER');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'TEACHER'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Classroom Portal
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('MAP');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'MAP' || currentView === 'LESSON_QUIZ'
                          ? 'bg-[#0F766E] text-[#FFFDFB] border border-[#22C55E] shadow-[2px_2px_0px_#22C55E] font-extrabold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Preview Islands Map (Grades 7–10)
                    </button>
                  </>
                )}

                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('ADMIN');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'ADMIN'
                          ? 'bg-[#22C55E] text-[#231F20] border border-[#FFFDFB] font-black'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Admin Console (Approvals & Modules)
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('MAP');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                        currentView === 'MAP' || currentView === 'LESSON_QUIZ'
                          ? 'bg-[#22C55E] text-[#231F20] border border-[#FFFDFB] font-bold'
                          : 'hover:text-[#22C55E] hover:bg-white/5'
                      }`}
                    >
                      Preview Islands Map (Grades 7–10)
                    </button>
                  </>
                )}
              </nav>
            )}

            {/* Right Header Controls: separate permanent XP and spendable Quest Coins */}
            <div className="flex items-center gap-2">
              {currentStudent && (
                <div className="hidden xl:flex items-center gap-2 mr-1">
                  {/* Permanent learning progress */}
                  <div
                    className="flex items-center gap-2 rounded-xl border border-sky-400/70 bg-gradient-to-br from-[#123B63] to-[#07192F] px-2.5 py-1 text-white shadow-[2px_2px_0px_#0284C7]"
                    title="Permanent XP for levels and achievements"
                    aria-label={`${currentStudent.points} permanent XP`}
                  >
                    <PhilippineSunMedallion size={20} />
                    <span className="flex flex-col leading-tight"><span className="text-[9px] font-black uppercase tracking-wide text-sky-200">Permanent XP</span><span className="font-mono text-sm font-black tabular-nums">{currentStudent.points.toLocaleString()}</span></span>
                  </div>

                  {/* Spendable wallet balance opens the Quest Market */}
                  <button
                    type="button"
                    onClick={() => { soundFX.playClick(); setCurrentView('MARKET'); }}
                    className="flex items-center gap-2 rounded-xl border border-emerald-300/80 bg-gradient-to-br from-[#0F766E] to-[#0A4262] px-2.5 py-1 text-white shadow-[2px_2px_0px_#22C55E] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                    title="Open Quest Market"
                    aria-label={`${questCoinBalance ?? 'Loading'} Quest Coins. Open Quest Market`}
                  >
                    <Coins className="h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
                    <span className="flex flex-col text-left leading-tight"><span className="text-[9px] font-black uppercase tracking-wide text-emerald-100">Quest Coins</span><span className="font-mono text-sm font-black tabular-nums">{questCoinBalance === null ? '—' : questCoinBalance.toLocaleString()}</span></span>
                  </button>
                </div>
              )}

              {/* Credential & Email Confirmations Review Button (Admin & Approved Teachers Only) */}
              {(currentUser?.role === 'admin' ||
                (currentUser?.role === 'teacher' && currentUser.status === 'approved')) && (
                <button
                  type="button"
                  onClick={() => handleOpenEmailInbox('')}
                  className="relative px-2.5 py-1.5 rounded-xl bg-[#00838F]/30 hover:bg-[#00838F]/50 border border-[#00838F] text-[#FAF7F2] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title={
                    currentUser.role === 'admin'
                      ? 'Admin: Review Teacher & Student Credentials & Confirmation Emails'
                      : 'Teacher: Review Student Credentials & Enrollment Confirmations'
                  }
                >
                  <Mail className="w-4 h-4 text-[#22C55E]" />
                  <span className="hidden md:inline">
                    {currentUser.role === 'admin'
                      ? 'Review All Credentials'
                      : 'Review Student Credentials'}
                  </span>
                </button>
              )}

              {/* Audio Toggle */}
              <button
                onClick={handleToggleSound}
                className="p-2 rounded-xl border border-[#2563EB]/60 text-[#FAF7F2] hover:text-[#22C55E] hover:bg-white/10 transition cursor-pointer"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-[#0F766E]" /> : <Volume2 className="w-4 h-4 text-[#22C55E]" />}
              </button>

              {/* User Account / Role Pill */}
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#2563EB]/50">
                  {currentUser.role === 'student' ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentView('STUDENT_DASHBOARD');
                      }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-white/10 transition text-left cursor-pointer group"
                      title="Open Student Dashboard (Edit Credentials & Photo)"
                    >
                      {currentStudent?.photoUrl ? (
                        <img
                          src={currentStudent.photoUrl}
                          alt={currentUser.name}
                          className="w-8 h-8 rounded-lg object-cover border-2 border-[#22C55E] shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#0F766E] border-2 border-[#22C55E] flex items-center justify-center text-xs font-bold text-[#FFFDFB] shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                          {currentUser.name
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase() || 'S'}
                        </div>
                      )}
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-[#FAF7F2] truncate max-w-[150px] group-hover:text-[#22C55E] transition-colors">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#22C55E]">
                          {`STUDENT • G${(currentUser as StudentAccount).gradeLevel}`}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-[#FAF7F2] truncate max-w-[150px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#22C55E]">
                        {currentUser.role === 'admin'
                          ? 'ADMINISTRATOR'
                          : `TEACHER (${currentUser.classCode || 'PENDING'})`}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleLogOut}
                    className="p-2 rounded-xl text-[#FAF7F2]/80 hover:text-[#22C55E] hover:bg-[#0F766E]/40 transition cursor-pointer"
                    title="Sign In with Another Account / Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentView('AUTH')}
                  className="px-4 py-2 rounded-xl btn-fiesta font-bold text-xs transition"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open navigation"
                className="lg:hidden p-2 rounded-xl text-[#FAF7F2] hover:bg-white/10"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && currentUser && (
            <div className="lg:hidden px-4 py-3 border-t border-white/10 bg-[#07172C] space-y-1">
              {currentUser.role === 'student' && (
                <>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setCurrentView('STUDENT_DASHBOARD');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-sky-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    <span>Student Dashboard (Credentials & Photo)</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setCurrentView('MAP');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5"
                  >
                    Island Quests
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('WRITING');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5"
                  >
                    Writing Lab
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('PROGRESS');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5"
                  >
                    My Progress
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('LEADERBOARD');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5"
                  >
                    Grade Activity Board
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('PROFILE');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5"
                  >
                    Badges
                  </button>
                  <button
                    onClick={() => { setCurrentView('MARKET'); setIsMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5"
                  >Quest Market</button>
                </>
              )}

              {currentUser.role === 'teacher' && (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('TEACHER');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-sky-300 hover:bg-white/5"
                  >
                    Teacher Portal
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setCurrentView('MAP');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-sky-300 hover:bg-white/5"
                  >
                    Preview Islands Map (Grades 7–10)
                  </button>
                </>
              )}

              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('ADMIN');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:bg-white/5"
                  >
                    Admin Console
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setCurrentView('MAP');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:bg-white/5"
                  >
                    Preview Islands Map (Grades 7–10)
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  handleLogOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40"
              >
                Sign Out / Switch Account
              </button>
            </div>
          )}
        </header>
      )}

      {/* Main Content View Switcher */}
      <main className={`flex-1 ${currentView === 'AUTH' || currentView === 'WAITING_APPROVAL' ? '' : 'pb-16'}`}>
        <div key={currentView} className="animate-lq-page-enter">
        {/* Authentication View */}
        {currentView === 'AUTH' && (
          <AuthScreen
            students={students}
            teachers={teachers}
            admins={admins}
            onLoginSuccess={handleLoginSuccess}
            onRegisterStudent={handleRegisterStudent}
            onRegisterTeacher={handleRegisterTeacher}
            onVerifyClassCode={handleVerifyClassCode}
            onRecoverPassword={handleRecoverPassword}
            onTriggerTransition={(title, subtitle) =>
              triggerLogoTransition({ title, subtitle, kind: 'navigate', durationMs: 380 })
            }
          />
        )}

        {/* Waiting for Admin Approval Screen */}
        {currentView === 'WAITING_APPROVAL' && (currentTeacher || currentStudent) && (
          <PendingApprovalScreen
            teacher={currentTeacher || undefined}
            student={currentStudent || undefined}
            onRefreshStatus={handleRefreshTeacherStatus}
            onLogOut={handleLogOut}
          />
        )}

        {/* Administrator Dashboard View */}
        {currentView === 'ADMIN' && currentAdmin && (
          <><PrivateAdminSummary /><AdminDashboardView
            currentAdmin={currentAdmin}
            admins={admins}
            allUsers={[...admins, ...teachers, ...students]}
            modules={modules}
            auditLogs={auditLogs}
            onApproveTeacher={handleAdminApproveTeacher}
            onUpdateTeacherClassCode={handleAdminUpdateTeacherClassCode}
            onRejectTeacher={handleAdminRejectTeacher}
            onSuspendUser={handleAdminSuspendUser}
            onReactivateUser={handleAdminReactivateUser}
            onCreateModule={handleAdminCreateModule}
            onUpdateModule={handleAdminUpdateModule}
            onDeleteModule={handleAdminDeleteModule}
            onDeleteTeacher={handleAdminDeleteTeacher}
            onDeleteStudent={handleAdminDeleteStudent}
            onAddSubAdmin={handleAdminAddSubAdmin}
            onUpdateSubAdmin={handleAdminUpdateSubAdmin}
            onDeleteSubAdmin={handleAdminDeleteSubAdmin}
            onArchiveAuditLog={handleAdminArchiveAuditLog}
            onUnarchiveAuditLog={handleAdminUnarchiveAuditLog}
            onDeleteAuditLog={handleAdminDeleteAuditLog}
            onBulkArchiveAuditLogs={handleAdminBulkArchiveAuditLogs}
            onBulkDeleteAuditLogs={handleAdminBulkDeleteAuditLogs}
            feedbackItems={systemFeedback}
            onUpdateFeedbackStatus={handleAdminUpdateFeedbackStatus}
            onDeleteFeedback={handleAdminDeleteFeedback}
            onRefreshData={handleRefreshAdminData}
            onPreviewAsStudent={(targetGrade) => {
              soundFX.playClick();
              if (targetGrade) {
                setBrowseGrade(targetGrade);
              }
              setCurrentView('MAP');
            }}
          /></>
        )}

        {/* Teacher Dashboard View (Approved teachers only, scoped to their classCode) */}
        {currentView === 'TEACHER' && currentTeacher && currentTeacher.status === 'approved' && (
          <TeacherDashboardView
            currentTeacher={currentTeacher}
            students={students}
            allModules={modules}
            onAddStudent={async (newStu) => {
              const res = await handleRegisterStudent(newStu as any);
              return res;
            }}
            onToggleStudentStatus={(stuId) => {
              setStudents((prev) =>
                prev.map((s) => (s.id === stuId ? { ...s, isActive: !s.isActive } : s))
              );
            }}
            onSwitchToStudentView={(student) => {
              setCurrentUserId(student.id);
              setCurrentView('MAP');
            }}
            onUpdateTeacherProfile={handleUpdateTeacherProfile}
            onUpdateStudent={handleTeacherUpdateStudent}
            onReviewStudent={handleTeacherReviewStudent}
            onPreviewIslandMap={(targetGrade) => {
              soundFX.playClick();
              if (targetGrade) {
                setBrowseGrade(targetGrade);
              }
              setCurrentView('MAP');
            }}
          />
        )}

        {/* Student Views */}
        {currentView === 'MAP' && (currentStudent || currentUser) && (
          <IslandMapView
            student={
              currentStudent || {
                id: 'preview-student',
                role: 'student',
                status: 'approved',
                name: currentUser?.name || 'Faculty Preview',
                email: currentUser?.email || 'faculty.preview@deped-davaoor.edu.ph',
                learnerId: '129485080000',
                lrn: '129485080000',
                gradeLevel: browseGrade,
                section: currentUser?.role === 'teacher' ? 'Faculty Preview' : 'Admin Preview',
                classCode: (currentUser as any)?.classCode || 'LQ-ENG-8492',
                teacherId: currentUser?.id || 'tch-marco-solis',
                username: currentUser?.email?.split('@')[0] || 'preview.faculty',
                points: 1500,
                badges: ['first_lesson', 'first_quiz_pass'],
                completedModules: modules.map((m) => m.id),
                progressByModule: modules.reduce((acc, m) => {
                  acc[m.id] = {
                    moduleId: m.id,
                    lessonCompleted: true,
                    isBridgeRestored: true,
                    bestScorePercent: 100,
                    attemptsCount: 1,
                    completedDifficulties: ['easy', 'moderate', 'hard'],
                    lastAttemptDate: '2026-10-09',
                    quizHistory: [],
                  };
                  return acc;
                }, {} as any),
                personalizationHistory: [],
                writingSubmissions: [],
                isActive: true,
                joinedDate: '2026-09-28',
              }
            }
            modules={modules}
            activeBrowseGrade={currentStudent ? currentStudent.gradeLevel : browseGrade}
            isPersonalizationMode={false}
            isPreviewMode={!currentStudent && (currentUser?.role === 'teacher' || currentUser?.role === 'admin')}
            previewRole={currentUser?.role === 'teacher' ? 'teacher' : currentUser?.role === 'admin' ? 'admin' : null}
            onSelectGrade={(g) => {
              setBrowseGrade(g);
            }}
            onReturnToDashboard={() => {
              soundFX.playClick();
              setCurrentView(currentUser?.role === 'teacher' ? 'TEACHER' : 'ADMIN');
            }}
            onTogglePersonalization={handleTogglePersonalization}
            onSelectModule={handleSelectModule}
          />
        )}

        {currentView === 'LESSON_QUIZ' && (currentStudent || currentUser) && selectedModule && (
          <LessonAndQuizView
            module={selectedModule}
            nextModule={nextModule || null}
            initialStage={lessonInitialStage}
            isPersonalization={currentStudent ? selectedModule.gradeLevel !== currentStudent.gradeLevel : false}
            isPreviewMode={!currentStudent && (currentUser?.role === 'teacher' || currentUser?.role === 'admin')}
            previewRole={currentUser?.role === 'teacher' ? 'teacher' : currentUser?.role === 'admin' ? 'admin' : null}
            onBackToMap={() => {
              soundFX.playClick();
              setCurrentView('MAP');
            }}
            onReturnToDashboard={() => {
              soundFX.playClick();
              setCurrentView(currentUser?.role === 'teacher' ? 'TEACHER' : 'ADMIN');
            }}
            onCompleteLesson={handleCompleteLesson}
            onSubmitQuizResult={handleSubmitQuizResult}
            onAdvanceToNextModule={handleAdvanceToNextModule}
            onOpenWritingLabWithPrompt={handleOpenWritingLabWithPrompt}
            completedVisualItems={
              currentStudent?.progressByModule[selectedModule.id]?.visualInteractionsCompleted || []
            }
            onAwardVisualXP={handleAwardVisualXP}
          />
        )}

        {currentView === 'WRITING' && currentStudent && (
          <WritingLabView
            student={currentStudent}
            initialModule={selectedModule}
            allModules={modules}
            onSaveSubmission={handleSaveWritingSubmission}
            onBackToMap={() => {
              soundFX.playClick();
              setCurrentView('MAP');
            }}
          />
        )}

        {currentView === 'PROGRESS' && currentStudent && (
          <StudentProgressView
            student={currentStudent}
            allModules={modules}
            onSelectModule={handleSelectModule}
            onNavigateTab={(tab) => {
              soundFX.playClick();
              if (tab === 'map') setCurrentView('MAP');
              if (tab === 'writing') setCurrentView('WRITING');
              if (tab === 'leaderboard') setCurrentView('LEADERBOARD');
              if (tab === 'profile') setCurrentView('PROFILE');
              if (tab === 'dashboard') setCurrentView('STUDENT_DASHBOARD');
            }}
          />
        )}

        {currentView === 'LEADERBOARD' && (
          <LeaderboardView
            currentStudent={currentStudent}
            
          />
        )}

        {currentView === 'MARKET' && currentStudent && <QuestMarketView />}

        {/* Student Dashboard View (Edit credentials, upload picture, view achievements) */}
        {currentView === 'STUDENT_DASHBOARD' && currentStudent && (
          <StudentDashboardView
            student={currentStudent}
            teachers={teachers}
            onUpdateStudent={handleUpdateStudentProfile}
            onBackToMap={() => {
              soundFX.playClick();
              setCurrentView('MAP');
            }}
            onNavigateToLeaderboard={() => {
              soundFX.playClick();
              setCurrentView('LEADERBOARD');
            }}
            onNavigateToProgress={() => {
              soundFX.playClick();
              setCurrentView('PROGRESS');
            }}
          />
        )}

        {currentView === 'PROFILE' && currentStudent && (
          <ProfileBadgesView
            student={currentStudent}
            onBackToMap={() => {
              soundFX.playClick();
              setCurrentView('MAP');
            }}
            onNavigateToDashboard={() => {
              soundFX.playClick();
              setCurrentView('STUDENT_DASHBOARD');
            }}
          />
        )}
        </div>
      </main>

      {/* Footer (Neo-Filipiniana Woodcut & Inabel Edition) */}
      {currentView !== 'AUTH' && currentView !== 'WAITING_APPROVAL' && (
        <footer data-dashboard-theme className="border-t-[3px] border-[#123B63] bg-[#07192F] text-[#DBEAFE]">
          <InabelWovenStrip variant="azure" height={8} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LingoQuestLogo size="sm" textColor="light" />
            </div>
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-xs font-bold text-[#38BDF8]">
                DepEd Schools Division of Davao Oriental
              </p>
              <p className="text-[11px] text-[#FAF7F2]/80">
                DepEd Region XI · Division of Davao Oriental · Interactive English Learning Platform
              </p>
            </div>
          </div>
        </footer>
      )}
      {/* Floating Feedback, Bug Report, Feature Request & Help/FAQ Widget for Students & Teachers */}
      {currentView !== 'AUTH' && (currentStudent || currentTeacher) && (
        <FloatingFeedbackWidget
          currentUser={(currentStudent || currentTeacher)!}
          feedbackItems={systemFeedback}
          onSubmitFeedback={handleUserSubmitFeedback}
        />
      )}

      {/* Role-Scoped Credential & Email Confirmation Review Modal (Admin & Teacher Only) */}
      <EmailNotificationCenter
        currentUser={currentUser}
        emails={emailNotifications}
        latestToastEmail={latestToastEmail}
        onDismissToast={() => setLatestToastEmail(null)}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onMarkAsRead={(id) => apiMarkEmailRead(id)}
        initialFilterEmail={emailModalFilter}
        allUsers={[...students, ...teachers, ...admins]}
      />
    </div>
  );
}
