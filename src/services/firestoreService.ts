import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  ALL_MODULES,
  INITIAL_ADMINS,
  INITIAL_AUDIT_LOGS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
} from '../data/seedData';
import {
  AdminAccount,
  AuditLogEntry,
  EmailNotificationRecord,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  GradeLevel,
  Module,
  ModuleProgress,
  StudentAccount,
  SystemFeedbackRecord,
  TeacherAccount,
  UserAccount,
} from '../types/lingoquest';

// Local storage fallback cache keys (for application data only; auth tokens are strictly in-memory)
const CACHE_KEY_USERS = 'lingoquest_cached_users_v3';
const CACHE_KEY_CUSTOM_MODULES = 'lingoquest_custom_modules_v1';
const CACHE_KEY_AUDIT = 'lingoquest_cached_audit_v3';
const CACHE_KEY_EMAILS = 'lingoquest_cached_emails_v3';
const CACHE_KEY_FEEDBACK = 'lingoquest_cached_feedback_v3';

// In-memory auth token (never stored in localStorage)
let inMemoryAuthToken: string | null = null;
let sessionPromise: Promise<string | null> | null = null;

// Pub/Sub for real-time email notification banner & inbox updates
type EmailListener = (
  allEmails: EmailNotificationRecord[],
  latestDispatched?: EmailNotificationRecord
) => void;
const emailListeners = new Set<EmailListener>();

export function subscribeToEmailNotifications(listener: EmailListener): () => void {
  emailListeners.add(listener);
  return () => {
    emailListeners.delete(listener);
  };
}

function notifyEmailListeners(
  allEmails: EmailNotificationRecord[],
  latestDispatched?: EmailNotificationRecord
) {
  emailListeners.forEach((fn) => {
    try {
      fn(allEmails, latestDispatched);
    } catch (e) {
      console.warn('Email listener error:', e);
    }
  });
}

export function setInMemoryAuthToken(token: string | null): void {
  inMemoryAuthToken = token;
}

async function getBearerToken(): Promise<string | null> {
  if (auth.currentUser) {
    try {
      const firebaseToken = await auth.currentUser.getIdToken();
      inMemoryAuthToken = firebaseToken;
      return firebaseToken;
    } catch {
      // Fallback to in-memory session token
    }
  }
  if (inMemoryAuthToken) {
    return inMemoryAuthToken;
  }
  if (!sessionPromise) {
    sessionPromise = (async () => {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            inMemoryAuthToken = data.token;
            if (Array.isArray(data.users) && data.users.length > 0) {
              setCachedUsers(data.users);
            }
            if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
              setCachedAuditLogs(data.auditLogs);
            }
            if (Array.isArray(data.emailNotifications) && data.emailNotifications.length > 0) {
              setCachedEmailNotifications(data.emailNotifications);
            }
            return data.token as string;
          }
        }
      } catch (err) {
        console.warn('Unable to establish session token:', err);
      } finally {
        sessionPromise = null;
      }
      return null;
    })();
  }
  return sessionPromise;
}

async function cloudSqlFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getBearerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(path, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn(`LocalStorage quota reached for "${key}". Data is retained in-memory.`);
    }
  }
}

// ----------------------------------------------------
// In-Memory & LocalStorage Cache Helpers
// ----------------------------------------------------
function getCachedUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading cached users', e);
  }
  return [...INITIAL_ADMINS, ...INITIAL_TEACHERS, ...INITIAL_STUDENTS];
}

function setCachedUsers(users: UserAccount[]) {
  safeStorageSet(CACHE_KEY_USERS, JSON.stringify(users));
}

function getCachedModules(): Module[] {
  return ALL_MODULES;
}

function setCachedModules(modules: Module[]) {
  try {
    const baseIds = new Set(ALL_MODULES.map((m) => m.id));
    const customOnly = modules.filter(
      (m) => !baseIds.has(m.id) || (m as any).updatedAt || (m as any).isCustom
    );
    if (customOnly.length > 0) {
      safeStorageSet(CACHE_KEY_CUSTOM_MODULES, JSON.stringify(customOnly));
    } else {
      localStorage.removeItem(CACHE_KEY_CUSTOM_MODULES);
    }
  } catch (e) {
    console.warn('Failed setting cached modules', e);
  }
}

function getCachedAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_AUDIT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading cached audit logs', e);
  }
  return INITIAL_AUDIT_LOGS;
}

function setCachedAuditLogs(logs: AuditLogEntry[]) {
  safeStorageSet(CACHE_KEY_AUDIT, JSON.stringify(logs));
}

export function getCachedEmailNotifications(): EmailNotificationRecord[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_EMAILS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading cached email notifications', e);
  }
  return [];
}

function setCachedEmailNotifications(emails: EmailNotificationRecord[]) {
  safeStorageSet(CACHE_KEY_EMAILS, JSON.stringify(emails.slice(0, 100)));
}

export function getCachedSystemFeedback(): SystemFeedbackRecord[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_FEEDBACK);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading cached system feedback', e);
  }
  return [
    {
      id: 'fb-seed-001',
      userId: 'stu-1',
      userName: 'Maria Clara Santos',
      userRole: 'student',
      userEmail: 'mariaclara.santos@student.deped-davaoor.edu.ph',
      schoolName: 'Mati National Comprehensive High School',
      gradeLevel: 8,
      classCode: 'LQ-ENG-8492',
      category: 'feature_request',
      priority: 'medium',
      targetArea: 'Lesson & Quiz Game',
      subject: 'Audio Pronunciation Button for Vocabulary Words',
      message:
        'It would be super helpful if we could click a speaker icon next to unfamiliar Afro-Asian vocabulary words in Grade 8 Quarter 1 so we can hear how they are pronounced before taking the Bridge Quiz.',
      status: 'in_review',
      adminResponse:
        'Thank you Maria! Our Division Curriculum team is reviewing audio pronunciation support for Quarter 1 & 2 vocabulary modules.',
      respondedBy: 'Department of Education Davao Oriental',
      respondedAt: '2026-10-28 14:20',
      createdAt: '2026-10-28 09:15',
    },
    {
      id: 'fb-seed-002',
      userId: 'tch-marco-solis',
      userName: 'Mr. Marco Solis',
      userRole: 'teacher',
      userEmail: 'marco.solis@deped.gov.ph',
      schoolName: 'Mati National Comprehensive High School',
      classCode: 'LQ-ENG-8492',
      category: 'bug_report',
      priority: 'high',
      targetArea: 'Teacher Roster & Analytics',
      subject: 'Section Filter Resetting After Approving Pending Learner',
      message:
        'When filtering my Grade 8 roster by Section Rizal and approving a pending student enrollment, the table view occasionally resets back to All Sections. Could we keep the active section filter selected?',
      status: 'open',
      createdAt: '2026-10-29 16:40',
    },
  ];
}

function setCachedSystemFeedback(items: SystemFeedbackRecord[]) {
  safeStorageSet(CACHE_KEY_FEEDBACK, JSON.stringify(items.slice(0, 150)));
}

// ----------------------------------------------------
// System Feedback, Bug Reports & Feature Requests Operations
// ----------------------------------------------------
export async function getAllSystemFeedback(): Promise<SystemFeedbackRecord[]> {
  try {
    const fetched = await cloudSqlFetch<SystemFeedbackRecord[]>('/api/feedback');
    if (Array.isArray(fetched) && fetched.length > 0) {
      setCachedSystemFeedback(fetched);
      return fetched;
    }
  } catch (error) {
    console.warn('getAllSystemFeedback fallback to cache:', error);
  }
  return getCachedSystemFeedback();
}

export async function submitSystemFeedback(params: {
  userId: string;
  userName: string;
  userRole: 'student' | 'teacher';
  userEmail: string;
  schoolName?: string;
  gradeLevel?: GradeLevel;
  classCode?: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  targetArea: string;
  subject: string;
  message: string;
}): Promise<SystemFeedbackRecord> {
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const newItem: SystemFeedbackRecord = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole,
    userEmail: params.userEmail,
    schoolName: params.schoolName,
    gradeLevel: params.gradeLevel,
    classCode: params.classCode,
    category: params.category,
    priority: params.priority || 'medium',
    targetArea: params.targetArea || 'General System',
    subject: params.subject.trim(),
    message: params.message.trim(),
    status: 'open',
    createdAt: nowStr,
  };

  try {
    await cloudSqlFetch<SystemFeedbackRecord>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback: newItem }),
    });
  } catch (error) {
    console.warn('submitSystemFeedback Cloud SQL fallback to local cache:', error);
  }

  const cached = getCachedSystemFeedback();
  const updated = [newItem, ...cached.filter((f) => f.id !== newItem.id)];
  setCachedSystemFeedback(updated);
  return newItem;
}

export async function updateSystemFeedbackStatus(
  feedbackId: string,
  updates: {
    status: FeedbackStatus;
    adminResponse?: string;
  },
  adminUser: AdminAccount
): Promise<SystemFeedbackRecord | null> {
  const cached = getCachedSystemFeedback();
  const target = cached.find((f) => f.id === feedbackId);
  if (!target) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const updatedRecord: SystemFeedbackRecord = {
    ...target,
    status: updates.status,
    adminResponse:
      updates.adminResponse !== undefined ? updates.adminResponse.trim() : target.adminResponse,
    respondedBy: adminUser.name,
    respondedAt: nowStr,
  };

  try {
    await cloudSqlFetch<SystemFeedbackRecord>(`/api/feedback/${encodeURIComponent(feedbackId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback: updatedRecord }),
    });
  } catch (error) {
    console.warn('updateSystemFeedbackStatus Cloud SQL fallback to cache:', error);
  }

  const updatedList = cached.map((f) => (f.id === feedbackId ? updatedRecord : f));
  setCachedSystemFeedback(updatedList);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'feedback_status_updated',
    targetId: feedbackId,
    targetName: `${target.userName} (${target.subject})`,
    details: `Updated feedback ticket [${target.category.replace('_', ' ')}] status to "${updates.status.toUpperCase()}". ${
      updates.adminResponse ? `Admin response: "${updates.adminResponse.trim()}"` : ''
    }`,
  });

  return updatedRecord;
}

export async function deleteSystemFeedbackItem(
  feedbackId: string,
  adminUser: AdminAccount
): Promise<boolean> {
  const cached = getCachedSystemFeedback();
  const target = cached.find((f) => f.id === feedbackId);

  try {
    await cloudSqlFetch(`/api/feedback/${encodeURIComponent(feedbackId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('deleteSystemFeedbackItem Cloud SQL fallback:', error);
  }

  setCachedSystemFeedback(cached.filter((f) => f.id !== feedbackId));

  if (target) {
    await recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      actionType: 'feedback_deleted',
      targetId: feedbackId,
      targetName: `${target.userName} (${target.subject})`,
      details: `Removed feedback/support item submitted by ${target.userRole} ${target.userName}.`,
    });
  }

  return true;
}

// ----------------------------------------------------
// Email Notification Dispatch & Inbox Operations
// ----------------------------------------------------
export async function getAllEmailNotifications(): Promise<EmailNotificationRecord[]> {
  try {
    const fetched = await cloudSqlFetch<EmailNotificationRecord[]>('/api/email-notifications');
    if (Array.isArray(fetched) && fetched.length > 0) {
      setCachedEmailNotifications(fetched);
      return fetched;
    }
  } catch (error) {
    console.warn('getAllEmailNotifications fallback to cache:', error);
  }
  return getCachedEmailNotifications();
}

export async function dispatchEmailNotification(
  params: Omit<EmailNotificationRecord, 'id' | 'isRead' | 'sentAt'>
): Promise<EmailNotificationRecord> {
  const newEmail: EmailNotificationRecord = {
    ...params,
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isRead: false,
    sentAt: new Date().toISOString(),
  };

  try {
    await cloudSqlFetch<EmailNotificationRecord>('/api/email-notifications', {
      method: 'POST',
      body: JSON.stringify({ notification: newEmail }),
    });
  } catch (error) {
    console.warn('dispatchEmailNotification Cloud SQL save fallback:', error);
  }

  const cached = getCachedEmailNotifications();
  const updated = [newEmail, ...cached.filter((e) => e.id !== newEmail.id)];
  setCachedEmailNotifications(updated);
  notifyEmailListeners(updated, newEmail);
  return newEmail;
}

export async function markEmailNotificationAsRead(notificationId: string): Promise<void> {
  const cached = getCachedEmailNotifications();
  const updated = cached.map((e) => (e.id === notificationId ? { ...e, isRead: true } : e));
  setCachedEmailNotifications(updated);
  notifyEmailListeners(updated);

  try {
    await cloudSqlFetch(`/api/email-notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.warn('markEmailNotificationAsRead Cloud SQL warning:', error);
  }
}

export async function resendAccountConfirmationEmail(
  account: UserAccount,
  approvedByName?: string
): Promise<EmailNotificationRecord> {
  if (account.role === 'teacher') {
    const t = account as TeacherAccount;
    const isApproved = t.status === 'approved';
    return dispatchEmailNotification({
      recipientEmail: t.depEdEmail || t.email || `${t.username}@deped.gov.ph`,
      recipientName: t.name,
      recipientRole: 'teacher',
      recipientUserId: t.id,
      notificationType: isApproved
        ? 'teacher_approved_confirmation'
        : 'teacher_registration_received',
      subject: isApproved
        ? `[LingoQuest Approved] Your Faculty Account & Class Code (${t.classCode}) Are Active!`
        : `[LingoQuest DepEd Davao Oriental] Faculty Registration Received (${t.classCode})`,
      headline: isApproved
        ? 'Faculty Account Approved by DepEd Davao Oriental Admin'
        : 'Faculty Application Received — Pending Admin Verification',
      messageBody: isApproved
        ? `Congratulations, ${t.name}! Your LingoQuest Faculty account for ${
            t.schoolName || t.department
          } has been officially approved by ${
            approvedByName || 'Department of Education Davao Oriental'
          }. Your unique Class Code (${t.classCode}) is now active so students can join your class. You can click the button below to log in immediately to your Classroom Portal.`
        : `Hello ${t.name}, we received your faculty registration for ${
            t.schoolName || t.department
          } using email ${t.depEdEmail}. Your pre-assigned Class Code (${
            t.classCode
          }) is reserved and will activate as soon as the Division Administrator approves your account.`,
      actionButtonLabel: isApproved
        ? 'Use Confirmation Email to Log In Now'
        : 'Check Application Status',
      canDirectLogin: true,
      credentialsSummary: {
        username: t.username,
        email: t.depEdEmail || t.email || '',
        classCode: t.classCode,
        employeeId: t.employeeId,
        schoolName: t.schoolName || t.department,
        approvedBy: approvedByName || 'Department of Education Davao Oriental',
      },
    });
  }

  const s = account as StudentAccount;
  const isApproved = s.status === 'approved' && s.enrollmentStatus !== 'pending_review';
  return dispatchEmailNotification({
    recipientEmail: s.email,
    recipientName: s.name,
    recipientRole: 'student',
    recipientUserId: s.id,
    notificationType: isApproved
      ? 'student_enrollment_approved'
      : 'student_registration_received',
    subject: isApproved
      ? `[LingoQuest Approved] Welcome ${s.name}! Your Grade ${s.gradeLevel} Account is Ready to Log In`
      : `[LingoQuest Notification] Student Sign-Up Confirmation for ${s.name} (LRN: ${s.lrn})`,
    headline: isApproved
      ? 'Learner Enrollment Approved — Start Your Island Quests!'
      : 'Student Sign-Up Email Confirmation Received',
    messageBody: isApproved
      ? `Great news, ${s.name}! Your English teacher (${
          approvedByName || 'Class Adviser'
        }) verified your DepEd LRN (${s.lrn}) and approved your Grade ${
          s.gradeLevel
        } enrollment under Class Code ${
          s.classCode
        }. Your account is now active with 200 welcome points! Click below to log in to your account.`
      : `Welcome to LingoQuest, ${s.name}! This email confirms that your student account was registered using ${
          s.email
        } under Class Code ${s.classCode} (Grade ${s.gradeLevel} · ${
          s.schoolName || 'DepEd Davao Oriental'
        }). You can use this confirmation email to log in and track your teacher's verification status.`,
    actionButtonLabel: isApproved
      ? 'Use Confirmation Email to Log In Now'
      : 'Log In & View Enrollment Status',
    canDirectLogin: true,
    credentialsSummary: {
      username: s.username,
      email: s.email,
      classCode: s.classCode,
      lrn: s.lrn || s.learnerId,
      gradeLevel: s.gradeLevel,
      schoolName: s.schoolName,
      approvedBy: approvedByName,
    },
  });
}

// ----------------------------------------------------
// Google Sign-In via Firebase Auth + Cloud SQL Sync
// ----------------------------------------------------
export async function signInWithGoogleAccount(): Promise<UserAccount> {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  const idToken = await credential.user.getIdToken();
  inMemoryAuthToken = idToken;

  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      displayName: credential.user.displayName || undefined,
      photoUrl: credential.user.photoURL || undefined,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to authenticate with Google.');
  }

  const data = (await response.json()) as { user: UserAccount };
  const cached = getCachedUsers();
  const exists = cached.some((u) => u.id === data.user.id);
  const updated = exists
    ? cached.map((u) => (u.id === data.user.id ? data.user : u))
    : [data.user, ...cached];
  setCachedUsers(updated);
  return data.user;
}

// ----------------------------------------------------
// Database Initialization / Seeding (Cloud SQL)
// ----------------------------------------------------
let hasSeeded = false;

export async function initializeFirestoreSeed(): Promise<{
  users?: UserAccount[];
  customModules?: Module[];
  auditLogs?: AuditLogEntry[];
  emailNotifications?: EmailNotificationRecord[];
  systemFeedback?: SystemFeedbackRecord[];
}> {
  if (hasSeeded) {
    return {
      users: getCachedUsers(),
      customModules: getCachedModules(),
      auditLogs: getCachedAuditLogs(),
      emailNotifications: getCachedEmailNotifications(),
      systemFeedback: getCachedSystemFeedback(),
    };
  }
  hasSeeded = true;

  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        inMemoryAuthToken = data.token;
      }
      if (Array.isArray(data.users) && data.users.length > 0) {
        setCachedUsers(data.users);
      }
      if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
        setCachedAuditLogs(data.auditLogs);
      }
      if (Array.isArray(data.emailNotifications) && data.emailNotifications.length > 0) {
        setCachedEmailNotifications(data.emailNotifications);
        notifyEmailListeners(data.emailNotifications);
      }
      if (Array.isArray(data.systemFeedback) && data.systemFeedback.length > 0) {
        setCachedSystemFeedback(data.systemFeedback);
      }
      return {
        users: data.users,
        customModules: data.customModules,
        auditLogs: data.auditLogs,
        emailNotifications: data.emailNotifications,
        systemFeedback: data.systemFeedback || getCachedSystemFeedback(),
      };
    }
  } catch (error) {
    console.warn('Cloud SQL bootstrap fallback to cached data:', error);
  }
  return {
    users: getCachedUsers(),
    customModules: getCachedModules(),
    auditLogs: getCachedAuditLogs(),
    emailNotifications: getCachedEmailNotifications(),
    systemFeedback: getCachedSystemFeedback(),
  };
}

// ----------------------------------------------------
// User Operations & RBAC
// ----------------------------------------------------
export async function getAllUsers(): Promise<UserAccount[]> {
  try {
    const fetched = await cloudSqlFetch<UserAccount[]>('/api/users');
    if (Array.isArray(fetched) && fetched.length > 0) {
      setCachedUsers(fetched);
      return fetched;
    }
  } catch (error) {
    console.warn('getAllUsers fallback to cache:', error);
  }
  return getCachedUsers();
}

export async function getUserById(userId: string): Promise<UserAccount | null> {
  try {
    const user = await cloudSqlFetch<UserAccount>(`/api/users/${encodeURIComponent(userId)}`);
    if (user && user.id) {
      return user;
    }
  } catch (error) {
    console.warn('getUserById fallback to cache:', error);
  }
  const cached = getCachedUsers();
  return cached.find((u) => u.id === userId) || null;
}

export async function registerNewStudent(
  studentData: Omit<
    StudentAccount,
    | 'id'
    | 'role'
    | 'status'
    | 'points'
    | 'badges'
    | 'completedModules'
    | 'progressByModule'
    | 'personalizationHistory'
    | 'writingSubmissions'
    | 'isActive'
    | 'joinedDate'
  >
): Promise<StudentAccount> {
  const newStudent: StudentAccount = {
    ...studentData,
    id: `stu-${Date.now()}`,
    role: 'student',
    status: 'pending',
    enrollmentStatus: 'pending_review',
    enrollmentReviewNote: 'Awaiting teacher review to verify LRN, grade level, and school info.',
    points: 200,
    badges: ['first_lesson'],
    completedModules: [],
    progressByModule: {},
    personalizationHistory: [],
    writingSubmissions: [],
    isActive: false,
    joinedDate: new Date().toISOString().split('T')[0],
  };

  try {
    await cloudSqlFetch<StudentAccount>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ user: newStudent }),
    });
  } catch (error) {
    console.warn('registerNewStudent writing to Cloud SQL failed, saving locally:', error);
  }

  const all = getCachedUsers();
  setCachedUsers([newStudent, ...all]);

  // Automatically dispatch Student Sign-Up Confirmation Email Notification
  await dispatchEmailNotification({
    recipientEmail: newStudent.email,
    recipientName: newStudent.name,
    recipientRole: 'student',
    recipientUserId: newStudent.id,
    notificationType: 'student_registration_received',
    subject: `[LingoQuest Notification] Student Registration Confirmation for ${newStudent.name} (LRN: ${newStudent.lrn})`,
    headline: 'Student Sign-Up Email Confirmation — Welcome to LingoQuest!',
    messageBody: `Hello ${newStudent.name}! Thank you for signing up on LingoQuest using your email (${newStudent.email}). Your Grade ${newStudent.gradeLevel} learner account at ${newStudent.schoolName || 'DepEd Davao Oriental'} has been linked to Teacher Class Code ${newStudent.classCode}. Your class teacher will verify your LRN (${newStudent.lrn}) shortly. You can use this confirmation email right now to sign in and view your account status.`,
    actionButtonLabel: 'Use Email Confirmation to Sign In',
    canDirectLogin: true,
    credentialsSummary: {
      username: newStudent.username,
      email: newStudent.email,
      classCode: newStudent.classCode,
      lrn: newStudent.lrn,
      gradeLevel: newStudent.gradeLevel,
      schoolName: newStudent.schoolName,
    },
  });

  return newStudent;
}

// ----------------------------------------------------
// Unique Class Code Generator
// ----------------------------------------------------
export function generateUniqueClassCode(existingUsers?: UserAccount[]): string {
  const existingCodes = new Set<string>();

  if (existingUsers && Array.isArray(existingUsers)) {
    for (const u of existingUsers) {
      if (u.role === 'teacher' && (u as TeacherAccount).classCode) {
        existingCodes.add((u as TeacherAccount).classCode.trim().toUpperCase());
      }
    }
  }

  try {
    const cached = getCachedUsers();
    for (const u of cached) {
      if (u.role === 'teacher' && (u as TeacherAccount).classCode) {
        existingCodes.add((u as TeacherAccount).classCode.trim().toUpperCase());
      }
    }
  } catch {
    // Ignore fallback errors
  }

  let code = '';
  let attempts = 0;
  do {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    code = `LQ-ENG-${randomDigits}`;
    attempts++;
    if (attempts > 60) {
      const alpha = Math.floor(10000 + Math.random() * 90000);
      code = `LQ-ENG-${alpha}`;
    }
  } while (existingCodes.has(code));

  return code;
}

export async function registerNewTeacher(teacherData: {
  name: string;
  schoolName?: string;
  department: string;
  employeeId: string;
  depEdEmail: string;
  username: string;
  password?: string;
  classCode?: string;
}): Promise<TeacherAccount> {
  const allUsers = getCachedUsers();
  const assignedClassCode =
    teacherData.classCode && teacherData.classCode.trim().length >= 4
      ? teacherData.classCode.trim().toUpperCase()
      : generateUniqueClassCode(allUsers);

  const newTeacher: TeacherAccount = {
    ...teacherData,
    email: teacherData.depEdEmail,
    id: `tch-${Date.now()}`,
    role: 'teacher',
    status: 'pending',
    classCode: assignedClassCode,
    staffRole: 'Teacher',
    isActive: true,
    joinedDate: new Date().toISOString().split('T')[0],
  };

  try {
    await cloudSqlFetch<TeacherAccount>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ user: newTeacher }),
    });
  } catch (error) {
    console.warn('registerNewTeacher writing to Cloud SQL failed, saving locally:', error);
  }

  setCachedUsers([newTeacher, ...allUsers]);

  // Automatically dispatch Faculty Registration Received Email Notification
  await dispatchEmailNotification({
    recipientEmail: newTeacher.depEdEmail,
    recipientName: newTeacher.name,
    recipientRole: 'teacher',
    recipientUserId: newTeacher.id,
    notificationType: 'teacher_registration_received',
    subject: `[LingoQuest DepEd Davao Oriental] Faculty Registration Received — Class Code ${newTeacher.classCode}`,
    headline: 'Faculty Registration Received — Pending Admin Approval',
    messageBody: `Dear ${newTeacher.name}, thank you for registering your DepEd Davao Oriental Faculty account (${newTeacher.depEdEmail}) for ${newTeacher.schoolName || newTeacher.department}. Your unique Class Code (${newTeacher.classCode}) has been reserved. As soon as the Division Administrator approves your registration, you will receive an official Approval Confirmation Email that you can use to log in and manage your classes.`,
    actionButtonLabel: 'Check Approval Status',
    canDirectLogin: true,
    credentialsSummary: {
      username: newTeacher.username,
      email: newTeacher.depEdEmail,
      classCode: newTeacher.classCode,
      employeeId: newTeacher.employeeId,
      schoolName: newTeacher.schoolName || newTeacher.department,
    },
  });

  return newTeacher;
}

// ----------------------------------------------------
// Admin Approval Queue & Faculty Management
// ----------------------------------------------------
export async function approveTeacher(
  teacherId: string,
  adminUser: AdminAccount,
  customClassCode?: string
): Promise<{ success: boolean; classCode: string; emailNotification?: EmailNotificationRecord }> {
  const cached = getCachedUsers();
  const currentTeacher = cached.find(
    (u) => u.id === teacherId && u.role === 'teacher'
  ) as TeacherAccount | undefined;

  let classCode =
    customClassCode?.trim().toUpperCase() || currentTeacher?.classCode?.trim().toUpperCase();
  if (!classCode) {
    classCode = generateUniqueClassCode(cached);
  }

  const updateData = {
    status: 'approved' as const,
    classCode,
    approvedAt: new Date().toISOString(),
    approvedBy: adminUser.name,
  };

  const updated = cached.map((u) => {
    if (u.id === teacherId && u.role === 'teacher') {
      return { ...u, ...updateData };
    }
    return u;
  });
  setCachedUsers(updated);

  const updatedTeacher = updated.find((u) => u.id === teacherId) as TeacherAccount | undefined;
  if (updatedTeacher) {
    try {
      await cloudSqlFetch(`/api/users/${encodeURIComponent(teacherId)}`, {
        method: 'PUT',
        body: JSON.stringify({ user: updatedTeacher }),
      });
    } catch (error) {
      console.warn('approveTeacher Cloud SQL update failed:', error);
    }
  }

  // Dispatch Official Teacher Approval Confirmation Email
  let emailNotification: EmailNotificationRecord | undefined;
  if (updatedTeacher) {
    const targetEmail =
      updatedTeacher.depEdEmail || updatedTeacher.email || `${updatedTeacher.username}@deped.gov.ph`;
    emailNotification = await dispatchEmailNotification({
      recipientEmail: targetEmail,
      recipientName: updatedTeacher.name,
      recipientRole: 'teacher',
      recipientUserId: updatedTeacher.id,
      notificationType: 'teacher_approved_confirmation',
      subject: `✅ [LingoQuest Admin Approved] Your Faculty Account & Class Code (${classCode}) Are Now Active!`,
      headline: 'Official Teacher Account Approval Confirmation',
      messageBody: `Congratulations, ${updatedTeacher.name}! Your LingoQuest Faculty registration for ${updatedTeacher.schoolName || updatedTeacher.department} has been officially verified and APPROVED by ${adminUser.name} (DepEd Davao Oriental Division Admin). Your unique Class Code (${classCode}) is now active for student sign-ups. You can use this confirmation email to log in directly to your Faculty Classroom Portal!`,
      actionButtonLabel: 'Use Confirmation Email to Log In to Account',
      canDirectLogin: true,
      credentialsSummary: {
        username: updatedTeacher.username,
        email: targetEmail,
        classCode,
        employeeId: updatedTeacher.employeeId,
        schoolName: updatedTeacher.schoolName || updatedTeacher.department,
        approvedBy: adminUser.name,
      },
    });
  }

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'teacher_approved',
    targetId: teacherId,
    targetName: updatedTeacher?.name || teacherId,
    details: `Approved teacher credentials. Activated unique class code ${classCode} and sent confirmation email to ${updatedTeacher?.depEdEmail || 'teacher email'}.`,
  });

  return { success: true, classCode, emailNotification };
}

export async function updateTeacherClassCode(
  teacherId: string,
  newClassCode: string,
  adminUser: AdminAccount
): Promise<{ success: boolean; classCode: string; error?: string }> {
  const cleanCode = newClassCode.trim().toUpperCase();
  if (cleanCode.length < 4) {
    return {
      success: false,
      classCode: '',
      error: 'Class code must be at least 4 characters long.',
    };
  }

  const cached = getCachedUsers();
  const isDuplicate = cached.some(
    (u) =>
      u.role === 'teacher' &&
      u.id !== teacherId &&
      (u as TeacherAccount).classCode?.toUpperCase() === cleanCode
  );
  if (isDuplicate) {
    return {
      success: false,
      classCode: '',
      error: `Class code ${cleanCode} is already assigned to another teacher.`,
    };
  }

  const teacher = cached.find(
    (u) => u.id === teacherId && u.role === 'teacher'
  ) as TeacherAccount | undefined;
  if (!teacher) {
    return { success: false, classCode: '', error: 'Teacher record not found.' };
  }

  const oldCode = teacher.classCode;
  const updatedTeacher: TeacherAccount = { ...teacher, classCode: cleanCode };

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(teacherId)}`, {
      method: 'PUT',
      body: JSON.stringify({ user: updatedTeacher }),
    });
  } catch (error) {
    console.warn('updateTeacherClassCode Cloud SQL update failed:', error);
  }

  const updated: UserAccount[] = cached.map((u) => {
    if (u.id === teacherId && u.role === 'teacher') {
      return updatedTeacher;
    }
    return u;
  });
  setCachedUsers(updated);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'teacher_approved',
    targetId: teacherId,
    targetName: teacher.name,
    details: `Reassigned unique class code from "${oldCode || 'None'}" to "${cleanCode}".`,
  });

  return { success: true, classCode: cleanCode };
}

export async function rejectTeacher(
  teacherId: string,
  reason: string,
  adminUser: AdminAccount
): Promise<boolean> {
  const updateData = {
    status: 'rejected' as const,
    rejectionReason: reason,
    rejectedAt: new Date().toISOString(),
    rejectedBy: adminUser.name,
  };

  const cached = getCachedUsers();
  const updated = cached.map((u) => {
    if (u.id === teacherId && u.role === 'teacher') {
      return { ...u, ...updateData };
    }
    return u;
  });
  setCachedUsers(updated);

  const updatedTeacher = updated.find((u) => u.id === teacherId) as TeacherAccount | undefined;
  if (updatedTeacher) {
    try {
      await cloudSqlFetch(`/api/users/${encodeURIComponent(teacherId)}`, {
        method: 'PUT',
        body: JSON.stringify({ user: updatedTeacher }),
      });
    } catch (error) {
      console.warn('rejectTeacher Cloud SQL update failed:', error);
    }

    const targetEmail =
      updatedTeacher.depEdEmail || updatedTeacher.email || `${updatedTeacher.username}@deped.gov.ph`;
    await dispatchEmailNotification({
      recipientEmail: targetEmail,
      recipientName: updatedTeacher.name,
      recipientRole: 'teacher',
      recipientUserId: updatedTeacher.id,
      notificationType: 'teacher_rejected_notice',
      subject: `[LingoQuest Notice] Faculty Application Review Update for ${updatedTeacher.name}`,
      headline: 'Faculty Application Requires Credential Verification',
      messageBody: `Dear ${updatedTeacher.name}, your faculty registration for ${updatedTeacher.schoolName || updatedTeacher.department} was reviewed by ${adminUser.name} with the following note: "${reason}". Please coordinate with your school principal or Division English Coordinator.`,
      actionButtonLabel: 'View Application Notice',
      canDirectLogin: false,
      credentialsSummary: {
        username: updatedTeacher.username,
        email: targetEmail,
        classCode: updatedTeacher.classCode,
        employeeId: updatedTeacher.employeeId,
        schoolName: updatedTeacher.schoolName || updatedTeacher.department,
        approvedBy: adminUser.name,
      },
    });
  }

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'teacher_rejected',
    targetId: teacherId,
    targetName: updatedTeacher?.name || teacherId,
    details: `Application rejected: "${reason}"`,
  });

  return true;
}

export async function suspendUser(
  userId: string,
  reason: string,
  adminUser: AdminAccount
): Promise<boolean> {
  const updateData = {
    status: 'suspended' as const,
    isActive: false,
    suspensionReason: reason,
    suspendedAt: new Date().toISOString(),
    suspendedBy: adminUser.name,
  };

  const cached = getCachedUsers();
  const updated: UserAccount[] = cached.map((u) => {
    if (u.id === userId) {
      return { ...u, ...updateData } as UserAccount;
    }
    return u;
  });
  setCachedUsers(updated);

  const target = updated.find((u) => u.id === userId);
  if (target) {
    try {
      await cloudSqlFetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: JSON.stringify({ user: target }),
      });
    } catch (error) {
      console.warn('suspendUser Cloud SQL update failed:', error);
    }
  }

  const targetRole = target?.role || 'user';
  let actionType: AuditLogEntry['actionType'] = 'teacher_suspended';
  if (targetRole === 'student') actionType = 'student_suspended';
  else if (targetRole === 'admin') actionType = 'sub_admin_suspended';

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType,
    targetId: userId,
    targetName: target?.name || userId,
    details: `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} account suspended: "${reason}"`,
  });

  return true;
}

export async function reactivateUser(
  userId: string,
  adminUser: AdminAccount
): Promise<boolean> {
  const updateData = {
    status: 'approved' as const,
    isActive: true,
    rejectionReason: '',
    suspensionReason: '',
    reactivatedAt: new Date().toISOString(),
  };

  const cached = getCachedUsers();
  const updated: UserAccount[] = cached.map((u) => {
    if (u.id === userId) {
      return { ...u, ...updateData } as UserAccount;
    }
    return u;
  });
  setCachedUsers(updated);

  const target = updated.find((u) => u.id === userId);
  if (target) {
    try {
      await cloudSqlFetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: JSON.stringify({ user: target }),
      });
    } catch (error) {
      console.warn('reactivateUser Cloud SQL update failed:', error);
    }
  }

  const targetRole = target?.role || 'user';
  let actionType: AuditLogEntry['actionType'] = 'teacher_reactivated';
  if (targetRole === 'student') actionType = 'student_reactivated';
  else if (targetRole === 'admin') actionType = 'sub_admin_reactivated';

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType,
    targetId: userId,
    targetName: target?.name || userId,
    details: `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} account reactivated to approved & active status.`,
  });

  return true;
}

export async function deleteStudentAccount(
  studentId: string,
  adminUser: AdminAccount,
  reason?: string
): Promise<boolean> {
  const cached = getCachedUsers();
  const student = cached.find(
    (u) => u.id === studentId && u.role === 'student'
  ) as StudentAccount | undefined;
  const studentName = student?.name || studentId;
  const studentStatus = student?.status || 'unknown';

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(studentId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('deleteStudentAccount Cloud SQL delete failed, continuing locally:', error);
  }

  const updatedUsers = cached.filter((u) => u.id !== studentId);
  setCachedUsers(updatedUsers);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'student_deleted',
    targetId: studentId,
    targetName: studentName,
    details: `Permanently removed student account (${studentStatus}). ${reason ? `Reason: ${reason}` : ''}`,
  });

  return true;
}

export async function deleteTeacherAccount(
  teacherId: string,
  adminUser: AdminAccount,
  reason?: string
): Promise<boolean> {
  const cached = getCachedUsers();
  const teacher = cached.find(
    (u) => u.id === teacherId && u.role === 'teacher'
  ) as TeacherAccount | undefined;
  const teacherName = teacher?.name || teacherId;
  const teacherStatus = teacher?.status || 'unknown';

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(teacherId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('deleteTeacherAccount Cloud SQL delete failed, continuing locally:', error);
  }

  const updatedUsers = cached.filter((u) => u.id !== teacherId);
  setCachedUsers(updatedUsers);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'teacher_deleted',
    targetId: teacherId,
    targetName: teacherName,
    details: `Permanently deleted ${teacherStatus} teacher account. ${reason ? `Reason: ${reason}` : ''}`,
  });

  return true;
}

// ----------------------------------------------------
// Sub-Admin Management (Main Admin Exclusive Authority)
// ----------------------------------------------------
export async function createSubAdminAccount(
  subAdminData: {
    name: string;
    email: string;
    username: string;
    password?: string;
    adminTitle: string;
    employeeId: string;
  },
  requestingAdmin: AdminAccount
): Promise<{ success: boolean; subAdmin?: AdminAccount; error?: string }> {
  const isMain =
    requestingAdmin.isMainAdmin ??
    (requestingAdmin.adminLevel === 'main' ||
      requestingAdmin.id === 'admin-deped-davao-oriental' ||
      requestingAdmin.id === 'admin-elena-reyes' ||
      !requestingAdmin.createdByAdminId);
  if (!isMain) {
    return {
      success: false,
      error:
        'Security Violation: Only the Main Administrator has the authority to add sub-administrators.',
    };
  }

  const cleanUsername = subAdminData.username.trim().toLowerCase();
  const cleanEmail = subAdminData.email.trim().toLowerCase();

  const cached = getCachedUsers();
  const existingUser = cached.find(
    (u) =>
      u.username.toLowerCase() === cleanUsername ||
      (u.role === 'admin' && (u as AdminAccount).email.toLowerCase() === cleanEmail)
  );

  if (existingUser) {
    return {
      success: false,
      error: `An account with username "${cleanUsername}" or email "${cleanEmail}" already exists.`,
    };
  }

  const newSubAdmin: AdminAccount = {
    id: `admin-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    role: 'admin',
    status: 'approved',
    name: subAdminData.name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    password: subAdminData.password || 'subadmin123',
    adminTitle: subAdminData.adminTitle.trim() || 'Division Assistant Administrator',
    employeeId: subAdminData.employeeId.trim(),
    isActive: true,
    joinedDate: new Date().toISOString().split('T')[0],
    isMainAdmin: false,
    adminLevel: 'sub',
    permissions: {
      canApproveTeachers: true,
      canManageModules: true,
      canViewStudentProgress: true,
      canManageSubAdmins: false,
    },
    createdByAdminId: requestingAdmin.id,
    createdByName: requestingAdmin.name,
  };

  try {
    await cloudSqlFetch<AdminAccount>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ user: newSubAdmin }),
    });
  } catch (error) {
    console.warn('createSubAdminAccount Cloud SQL write failed, saving locally:', error);
  }

  setCachedUsers([...cached, newSubAdmin]);

  await recordAuditLog({
    adminId: requestingAdmin.id,
    adminName: requestingAdmin.name,
    adminEmail: requestingAdmin.email,
    actionType: 'sub_admin_created',
    targetId: newSubAdmin.id,
    targetName: newSubAdmin.name,
    details: `Created sub-administrator account "${newSubAdmin.name}" (${newSubAdmin.employeeId}) with delegated teacher approval, module editing, and student progress oversight permissions. Sub-admin rights to add further administrators are restricted.`,
  });

  return { success: true, subAdmin: newSubAdmin };
}

export async function updateSubAdminAccount(
  subAdminId: string,
  updates: Partial<AdminAccount>,
  requestingAdmin: AdminAccount
): Promise<{ success: boolean; subAdmin?: AdminAccount; error?: string }> {
  const isMain =
    requestingAdmin.isMainAdmin ??
    (requestingAdmin.adminLevel === 'main' ||
      requestingAdmin.id === 'admin-deped-davao-oriental' ||
      requestingAdmin.id === 'admin-elena-reyes' ||
      !requestingAdmin.createdByAdminId);
  if (!isMain) {
    return {
      success: false,
      error:
        'Security Violation: Only the Main Administrator has the authority to modify administrator accounts.',
    };
  }

  const cached = getCachedUsers();
  const target = cached.find(
    (u) => u.id === subAdminId && u.role === 'admin'
  ) as AdminAccount | undefined;
  if (!target) {
    return { success: false, error: 'Administrator account not found.' };
  }

  const isTargetMain =
    target.isMainAdmin ??
    (target.adminLevel === 'main' ||
      target.id === 'admin-deped-davao-oriental' ||
      target.id === 'admin-elena-reyes' ||
      !target.createdByAdminId);
  if (isTargetMain && updates.isMainAdmin === false) {
    return { success: false, error: 'Cannot demote the Main Administrator account.' };
  }

  const updatedAdmin: AdminAccount = {
    ...target,
    ...updates,
    permissions: target.isMainAdmin
      ? target.permissions
      : {
          canApproveTeachers: true,
          canManageModules: true,
          canViewStudentProgress: true,
          canManageSubAdmins: false,
        },
  };

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(subAdminId)}`, {
      method: 'PUT',
      body: JSON.stringify({ user: updatedAdmin }),
    });
  } catch (error) {
    console.warn('updateSubAdminAccount Cloud SQL update failed, continuing locally:', error);
  }

  setCachedUsers(cached.map((u) => (u.id === subAdminId ? updatedAdmin : u)));

  await recordAuditLog({
    adminId: requestingAdmin.id,
    adminName: requestingAdmin.name,
    adminEmail: requestingAdmin.email,
    actionType: 'sub_admin_updated',
    targetId: target.id,
    targetName: target.name,
    details: `Updated administrator account "${target.name}". Status: ${updatedAdmin.isActive ? 'Active' : 'Deactivated'}. Title: ${updatedAdmin.adminTitle}.`,
  });

  return { success: true, subAdmin: updatedAdmin };
}

export async function deleteSubAdminAccount(
  subAdminId: string,
  requestingAdmin: AdminAccount,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const isMain =
    requestingAdmin.isMainAdmin ??
    (requestingAdmin.adminLevel === 'main' ||
      requestingAdmin.id === 'admin-deped-davao-oriental' ||
      requestingAdmin.id === 'admin-elena-reyes' ||
      !requestingAdmin.createdByAdminId);
  if (!isMain) {
    return {
      success: false,
      error:
        'Security Violation: Only the Main Administrator has the authority to remove administrator accounts.',
    };
  }

  const cached = getCachedUsers();
  const target = cached.find(
    (u) => u.id === subAdminId && u.role === 'admin'
  ) as AdminAccount | undefined;
  if (!target) {
    return { success: false, error: 'Administrator account not found.' };
  }

  const isTargetMain =
    target.isMainAdmin ??
    (target.adminLevel === 'main' ||
      target.id === 'admin-deped-davao-oriental' ||
      target.id === 'admin-elena-reyes' ||
      !target.createdByAdminId);
  if (isTargetMain) {
    return {
      success: false,
      error: 'Protected Account: The Main Administrator account cannot be removed.',
    };
  }

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(subAdminId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('deleteSubAdminAccount Cloud SQL delete failed, continuing locally:', error);
  }

  setCachedUsers(cached.filter((u) => u.id !== subAdminId));

  await recordAuditLog({
    adminId: requestingAdmin.id,
    adminName: requestingAdmin.name,
    adminEmail: requestingAdmin.email,
    actionType: 'sub_admin_deleted',
    targetId: target.id,
    targetName: target.name,
    details: `Permanently removed sub-administrator account "${target.name}" (${target.employeeId}). ${reason ? `Reason: ${reason}` : ''}`,
  });

  return { success: true };
}

export async function reviewStudentEnrollment(
  studentId: string,
  reviewerTeacher: TeacherAccount,
  action: 'approve' | 'reject',
  updates?: {
    name?: string;
    lrn?: string;
    gradeLevel?: GradeLevel;
    schoolName?: string;
    section?: string;
  },
  note?: string
): Promise<{
  success: boolean;
  student?: StudentAccount;
  emailNotification?: EmailNotificationRecord;
  error?: string;
}> {
  const cached = getCachedUsers();
  const existing = cached.find(
    (u) => u.id === studentId && u.role === 'student'
  ) as StudentAccount | undefined;
  if (!existing) {
    return { success: false, error: 'Student record not found.' };
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const newEnrollmentStatus = action === 'approve' ? 'approved' : 'rejected';

  const updatedStudent: StudentAccount = {
    ...existing,
    ...(updates?.name ? { name: updates.name.trim() } : {}),
    ...(updates?.lrn ? { lrn: updates.lrn.trim(), learnerId: updates.lrn.trim() } : {}),
    ...(updates?.gradeLevel ? { gradeLevel: updates.gradeLevel } : {}),
    ...(updates?.schoolName ? { schoolName: updates.schoolName } : {}),
    ...(updates?.section !== undefined ? { section: updates.section.trim() } : {}),
    status: newStatus,
    isActive: action === 'approve',
    enrollmentStatus: newEnrollmentStatus,
    enrollmentReviewedAt: new Date().toISOString(),
    enrollmentReviewerId: reviewerTeacher.id,
    enrollmentReviewNote:
      note ||
      (action === 'approve'
        ? 'Information verified and enrollment approved by teacher.'
        : 'Enrollment rejected by teacher due to incorrect information.'),
  };

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      body: JSON.stringify({ user: updatedStudent }),
    });
  } catch (error) {
    console.warn('reviewStudentEnrollment Cloud SQL update failed, continuing locally:', error);
  }

  const updatedUsers = cached.map((u) => (u.id === studentId ? updatedStudent : u));
  setCachedUsers(updatedUsers);

  // Dispatch Student Enrollment Confirmation / Notification Email
  const emailNotification = await dispatchEmailNotification({
    recipientEmail: updatedStudent.email || `${updatedStudent.username}@student.deped.gov.ph`,
    recipientName: updatedStudent.name,
    recipientRole: 'student',
    recipientUserId: updatedStudent.id,
    notificationType:
      action === 'approve' ? 'student_enrollment_approved' : 'student_enrollment_rejected',
    subject:
      action === 'approve'
        ? `🎉 [LingoQuest Approved] Your Grade ${updatedStudent.gradeLevel} Learner Account is Ready to Log In!`
        : `[LingoQuest Notice] Enrollment Review Update for ${updatedStudent.name}`,
    headline:
      action === 'approve'
        ? 'Student Account Approved — Log In & Start Your Island Quests!'
        : 'Enrollment Information Flagged by Class Teacher',
    messageBody:
      action === 'approve'
        ? `Hello ${updatedStudent.name}! Your English teacher, ${reviewerTeacher.name}, has verified your LRN (${updatedStudent.lrn}) and APPROVED your Grade ${updatedStudent.gradeLevel} enrollment under Class Code ${updatedStudent.classCode}. Your account is now active with 200 welcome points! Use the button below to log in immediately.`
        : `Hello ${updatedStudent.name}, your teacher (${reviewerTeacher.name}) reviewed your registration with note: "${updatedStudent.enrollmentReviewNote}". Please verify your 12-digit DepEd LRN and contact your teacher.`,
    actionButtonLabel:
      action === 'approve'
        ? 'Use Confirmation Email to Log In Now'
        : 'View Enrollment Status',
    canDirectLogin: action === 'approve',
    credentialsSummary: {
      username: updatedStudent.username,
      email: updatedStudent.email,
      classCode: updatedStudent.classCode,
      lrn: updatedStudent.lrn || updatedStudent.learnerId,
      gradeLevel: updatedStudent.gradeLevel,
      schoolName: updatedStudent.schoolName,
      approvedBy: reviewerTeacher.name,
    },
  });

  return { success: true, student: updatedStudent, emailNotification };
}

// ----------------------------------------------------
// Class Code Verification
// ----------------------------------------------------
export function verifyClassCode(
  classCode: string,
  allUsers: UserAccount[]
): { valid: boolean; teacher?: TeacherAccount; error?: string; isPending?: boolean } {
  const cleanCode = classCode.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: 'Please enter a valid teacher class code.' };
  }

  const teacher = allUsers.find(
    (u): u is TeacherAccount =>
      u.role === 'teacher' &&
      typeof (u as TeacherAccount).classCode === 'string' &&
      (u as TeacherAccount).classCode.toUpperCase() === cleanCode
  );

  if (!teacher) {
    return {
      valid: false,
      error: 'Invalid Class Code. No teacher found with code: ' + cleanCode,
    };
  }

  if (teacher.status === 'pending') {
    return {
      valid: false,
      isPending: true,
      teacher,
      error: `Class Code belongs to ${teacher.name} (${teacher.schoolName || teacher.department}), but the teacher account is pending Division Admin approval. Students can join once approved by Admin.`,
    };
  }

  if (teacher.status !== 'approved') {
    return {
      valid: false,
      error: `Teacher account is currently ${teacher.status}. Please check with your teacher or school administrator.`,
    };
  }

  return { valid: true, teacher };
}

// ----------------------------------------------------
// Module Manager (Admins Only)
// ----------------------------------------------------
export async function getAllModules(): Promise<Module[]> {
  return ALL_MODULES;
}

export async function createNewModule(
  moduleData: Module,
  adminUser: AdminAccount
): Promise<Module> {
  const fullModule: Module = {
    ...moduleData,
    id: moduleData.id || `mod-${Date.now()}`,
  };

  try {
    await cloudSqlFetch<Module>('/api/modules', {
      method: 'POST',
      body: JSON.stringify({
        module: {
          ...fullModule,
          updatedAt: new Date().toISOString(),
          updatedBy: adminUser.id,
        },
        updatedBy: adminUser.id,
      }),
    });
  } catch (error) {
    console.warn('createNewModule Cloud SQL save failed:', error);
  }

  const cached = getCachedModules();
  const updated = [fullModule, ...cached.filter((m) => m.id !== fullModule.id)];
  setCachedModules(updated);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'module_created',
    targetId: fullModule.id,
    targetName: fullModule.title,
    details: `Created new module "${fullModule.title}" (Grade ${fullModule.gradeLevel}, Q${fullModule.quarter}).`,
  });

  return fullModule;
}

export async function updateExistingModule(
  moduleData: Module,
  adminUser: AdminAccount
): Promise<Module> {
  try {
    await cloudSqlFetch<Module>('/api/modules', {
      method: 'POST',
      body: JSON.stringify({
        module: {
          ...moduleData,
          updatedAt: new Date().toISOString(),
          updatedBy: adminUser.id,
        },
        updatedBy: adminUser.id,
      }),
    });
  } catch (error) {
    console.warn('updateExistingModule Cloud SQL update failed:', error);
  }

  const cached = getCachedModules();
  const updated = cached.map((m) => (m.id === moduleData.id ? moduleData : m));
  setCachedModules(updated);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'module_updated',
    targetId: moduleData.id,
    targetName: moduleData.title,
    details: `Updated lesson content and quiz parameters for module "${moduleData.title}".`,
  });

  return moduleData;
}

export async function deleteExistingModule(
  moduleId: string,
  moduleTitle: string,
  adminUser: AdminAccount
): Promise<boolean> {
  try {
    await cloudSqlFetch(`/api/modules/${encodeURIComponent(moduleId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('deleteExistingModule Cloud SQL delete failed:', error);
  }

  const cached = getCachedModules();
  const updated = cached.filter((m) => m.id !== moduleId);
  setCachedModules(updated);

  await recordAuditLog({
    adminId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    actionType: 'module_deleted',
    targetId: moduleId,
    targetName: moduleTitle,
    details: `Deleted curriculum module "${moduleTitle}" (${moduleId}).`,
  });

  return true;
}

// ----------------------------------------------------
// Audit Trail Operations
// ----------------------------------------------------
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const logs = await cloudSqlFetch<AuditLogEntry[]>('/api/audit-logs');
    if (Array.isArray(logs) && logs.length > 0) {
      logs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      setCachedAuditLogs(logs);
      return logs;
    }
  } catch (error) {
    console.warn('getAuditLogs fallback to cache:', error);
  }
  return getCachedAuditLogs();
}

export async function recordAuditLog(
  log: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const newLog: AuditLogEntry = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    await cloudSqlFetch<AuditLogEntry>('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify({ log: newLog }),
    });
  } catch (error) {
    console.warn('recordAuditLog Cloud SQL write failed, saving locally:', error);
  }

  const cached = getCachedAuditLogs();
  setCachedAuditLogs([newLog, ...cached]);
  return newLog;
}

export async function archiveAuditLog(
  logId: string,
  adminUser: AdminAccount
): Promise<boolean> {
  const cached = getCachedAuditLogs();
  const now = new Date().toISOString();

  try {
    await cloudSqlFetch('/api/audit-logs/archive', {
      method: 'PATCH',
      body: JSON.stringify({
        logIds: [logId],
        isArchived: true,
        archivedBy: adminUser.name,
      }),
    });
  } catch (error) {
    console.warn('archiveAuditLog Cloud SQL update failed, continuing locally:', error);
  }

  const updated = cached.map((l) =>
    l.id === logId
      ? { ...l, isArchived: true, archivedAt: now, archivedBy: adminUser.name }
      : l
  );
  setCachedAuditLogs(updated);
  return true;
}

export async function unarchiveAuditLog(
  logId: string,
  _adminUser: AdminAccount
): Promise<boolean> {
  const cached = getCachedAuditLogs();

  try {
    await cloudSqlFetch('/api/audit-logs/archive', {
      method: 'PATCH',
      body: JSON.stringify({
        logIds: [logId],
        isArchived: false,
      }),
    });
  } catch (error) {
    console.warn('unarchiveAuditLog Cloud SQL update failed, continuing locally:', error);
  }

  const updated = cached.map((l) =>
    l.id === logId
      ? { ...l, isArchived: false, archivedAt: undefined, archivedBy: undefined }
      : l
  );
  setCachedAuditLogs(updated);
  return true;
}

export async function deleteAuditLog(
  logId: string,
  _adminUser: AdminAccount
): Promise<boolean> {
  try {
    await cloudSqlFetch('/api/audit-logs', {
      method: 'DELETE',
      body: JSON.stringify({ logIds: [logId] }),
    });
  } catch (error) {
    console.warn('deleteAuditLog Cloud SQL delete failed, continuing locally:', error);
  }

  const cached = getCachedAuditLogs();
  const updated = cached.filter((l) => l.id !== logId);
  setCachedAuditLogs(updated);
  return true;
}

export async function bulkArchiveAuditLogs(
  logIds: string[],
  adminUser: AdminAccount
): Promise<boolean> {
  const idSet = new Set(logIds);
  const now = new Date().toISOString();

  try {
    await cloudSqlFetch('/api/audit-logs/archive', {
      method: 'PATCH',
      body: JSON.stringify({
        logIds,
        isArchived: true,
        archivedBy: adminUser.name,
      }),
    });
  } catch (error) {
    console.warn('bulkArchiveAuditLogs Cloud SQL update failed:', error);
  }

  const cached = getCachedAuditLogs();
  const updated = cached.map((l) =>
    idSet.has(l.id)
      ? { ...l, isArchived: true, archivedAt: now, archivedBy: adminUser.name }
      : l
  );
  setCachedAuditLogs(updated);
  return true;
}

export async function bulkDeleteAuditLogs(
  logIds: string[],
  _adminUser: AdminAccount
): Promise<boolean> {
  const idSet = new Set(logIds);

  try {
    await cloudSqlFetch('/api/audit-logs', {
      method: 'DELETE',
      body: JSON.stringify({ logIds }),
    });
  } catch (error) {
    console.warn('bulkDeleteAuditLogs Cloud SQL delete failed:', error);
  }

  const cached = getCachedAuditLogs();
  const updated = cached.filter((l) => !idSet.has(l.id));
  setCachedAuditLogs(updated);
  return true;
}

// ----------------------------------------------------
// Student Progress Protection & Cloud SQL Sync
// ----------------------------------------------------
export async function persistStudentProgress(
  student: StudentAccount,
  moduleId: string,
  prog: ModuleProgress
): Promise<void> {
  try {
    await cloudSqlFetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({
        student,
        moduleId,
        progress: prog,
      }),
    });
  } catch (error) {
    console.warn('persistStudentProgress Cloud SQL write error:', error);
  }
}

// ----------------------------------------------------
// Student Profile & Credentials Updates
// ----------------------------------------------------
export async function updateStudentProfile(
  studentId: string,
  updates: {
    name?: string;
    email?: string;
    password?: string;
    photoUrl?: string;
    section?: string;
    lrn?: string;
    learnerId?: string;
    gradeLevel?: GradeLevel;
    schoolName?: string;
  }
): Promise<{ success: boolean; student?: StudentAccount; error?: string }> {
  const cached = getCachedUsers();
  const student = cached.find(
    (u) => u.id === studentId && u.role === 'student'
  ) as StudentAccount | undefined;
  if (!student) {
    return { success: false, error: 'Student record not found.' };
  }

  const payload: Partial<StudentAccount> = {};
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (trimmed.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters long.' };
    }
    payload.name = trimmed;
  }
  if (updates.email !== undefined) {
    const trimmedEmail = updates.email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    payload.email = trimmedEmail;
  }
  if (updates.password !== undefined) {
    if (updates.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    payload.password = updates.password;
  }
  if (updates.photoUrl !== undefined) {
    payload.photoUrl = updates.photoUrl;
  }
  if (updates.section !== undefined) {
    payload.section = updates.section.trim();
  }
  if (updates.lrn !== undefined || updates.learnerId !== undefined) {
    const lrnVal = (updates.lrn || updates.learnerId || '').trim();
    if (lrnVal.length !== 12 || !/^\d{12}$/.test(lrnVal)) {
      return { success: false, error: 'DepEd LRN must be exactly 12 numeric digits.' };
    }
    payload.lrn = lrnVal;
    payload.learnerId = lrnVal;
  }
  if (updates.gradeLevel !== undefined) {
    const gr = Number(updates.gradeLevel);
    if (![7, 8, 9, 10].includes(gr)) {
      return { success: false, error: 'Grade level must be 7, 8, 9, or 10.' };
    }
    payload.gradeLevel = gr as GradeLevel;
  }
  if (updates.schoolName !== undefined) {
    const sName = updates.schoolName.trim();
    if (!sName) {
      return { success: false, error: 'School name cannot be empty.' };
    }
    payload.schoolName = sName;
  }

  const updatedStudent: StudentAccount = {
    ...student,
    ...payload,
  };

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      body: JSON.stringify({ user: updatedStudent }),
    });
  } catch (error) {
    console.warn('updateStudentProfile Cloud SQL update failed, persisting locally:', error);
  }

  const updatedUsers = cached.map((u) => (u.id === studentId ? updatedStudent : u));
  setCachedUsers(updatedUsers);

  return { success: true, student: updatedStudent };
}

// ----------------------------------------------------
// Teacher Profile & Credentials Updates
// ----------------------------------------------------
export async function updateTeacherProfile(
  teacherId: string,
  updates: {
    name?: string;
    depEdEmail?: string;
    email?: string;
    password?: string;
    schoolName?: string;
    department?: string;
    photoUrl?: string;
  }
): Promise<{ success: boolean; teacher?: TeacherAccount; error?: string }> {
  const cached = getCachedUsers();
  const teacher = cached.find(
    (u) => u.id === teacherId && u.role === 'teacher'
  ) as TeacherAccount | undefined;
  if (!teacher) {
    return { success: false, error: 'Teacher record not found.' };
  }

  const payload: Partial<TeacherAccount> = {};
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (trimmed.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters long.' };
    }
    payload.name = trimmed;
  }
  if (updates.depEdEmail !== undefined || updates.email !== undefined) {
    const emailVal = (updates.depEdEmail || updates.email || '').trim().toLowerCase();
    if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
      return { success: false, error: 'Please enter a valid DepEd or official email address.' };
    }
    payload.depEdEmail = emailVal;
    payload.email = emailVal;
  }
  if (updates.password !== undefined && updates.password.trim().length > 0) {
    if (updates.password.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    payload.password = updates.password.trim();
  }
  if (updates.schoolName !== undefined) {
    payload.schoolName = updates.schoolName.trim();
  }
  if (updates.department !== undefined) {
    payload.department = updates.department.trim();
  }
  if (updates.photoUrl !== undefined) {
    payload.photoUrl = updates.photoUrl;
  }

  const updatedTeacher: TeacherAccount = {
    ...teacher,
    ...payload,
  };

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(teacherId)}`, {
      method: 'PUT',
      body: JSON.stringify({ user: updatedTeacher }),
    });
  } catch (error) {
    console.warn('updateTeacherProfile Cloud SQL update failed, persisting locally:', error);
  }

  const updatedUsers = cached.map((u) => (u.id === teacherId ? updatedTeacher : u));
  setCachedUsers(updatedUsers);

  return { success: true, teacher: updatedTeacher };
}

// ----------------------------------------------------
// Password Recovery (Linked to Email for Students & Teachers)
// ----------------------------------------------------
export async function recoverUserPassword(params: {
  role: 'student' | 'teacher';
  identifier?: string;
  email: string;
  newPassword: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPassword = params.newPassword.trim();
  const cleanId = (params.identifier || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      error: 'A valid email address is required for password recovery.',
    };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return {
      success: false,
      error: 'New password must be at least 4 characters long.',
    };
  }

  const cached = getCachedUsers();
  let targetUser: UserAccount | undefined;

  if (params.role === 'student') {
    targetUser = cached.find((u) => {
      if (u.role !== 'student') return false;
      const s = u as StudentAccount;
      const emailMatches = s.email && s.email.toLowerCase() === cleanEmail;
      if (cleanId) {
        const idMatches =
          s.username.toLowerCase() === cleanId ||
          s.learnerId === cleanId ||
          s.lrn === cleanId;
        return emailMatches || idMatches;
      }
      return emailMatches;
    });
  } else {
    targetUser = cached.find((u) => {
      if (u.role !== 'teacher') return false;
      const t = u as TeacherAccount;
      const emailMatches =
        (t.depEdEmail && t.depEdEmail.toLowerCase() === cleanEmail) ||
        (t.email && t.email.toLowerCase() === cleanEmail);
      if (cleanId) {
        const idMatches =
          t.username.toLowerCase() === cleanId || t.employeeId.toLowerCase() === cleanId;
        return emailMatches || idMatches;
      }
      return emailMatches;
    });
  }

  if (!targetUser) {
    return {
      success: false,
      error: `No registered ${params.role} account found matching email "${cleanEmail}"${
        cleanId ? ` or username/ID "${cleanId}"` : ''
      }. Please check your credentials.`,
    };
  }

  const updates: Record<string, any> = {
    password: cleanPassword,
    updatedAt: new Date().toISOString(),
  };

  if (params.role === 'student') {
    updates.email = cleanEmail;
  } else if (params.role === 'teacher') {
    updates.depEdEmail = cleanEmail;
    updates.email = cleanEmail;
  }

  const updatedUser: UserAccount = {
    ...targetUser,
    ...updates,
  };

  try {
    await cloudSqlFetch(`/api/users/${encodeURIComponent(targetUser.id)}`, {
      method: 'PUT',
      body: JSON.stringify({ user: updatedUser }),
    });
  } catch (error) {
    console.warn('recoverUserPassword Cloud SQL update failed, falling back to local storage:', error);
  }

  const updatedUsers = cached.map((u) => (u.id === targetUser!.id ? updatedUser : u));
  setCachedUsers(updatedUsers);

  try {
    await recordAuditLog({
      adminId: 'system-auth',
      adminName: 'LingoQuest Security Guard',
      adminEmail: 'security@lingoquest.deped.gov.ph',
      actionType: 'user_password_recovered',
      targetId: updatedUser.id,
      targetName: updatedUser.name,
      details: `Password recovered and reset via verified email link (${cleanEmail}) for ${params.role} @${updatedUser.username}.`,
    });
  } catch (logErr) {
    console.warn('Audit log write error:', logErr);
  }

  return { success: true, user: updatedUser };
}
