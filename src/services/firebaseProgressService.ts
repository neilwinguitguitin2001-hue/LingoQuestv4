import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  DAVAO_ORIENTAL_QUARTER_ISLANDS,
  GradeLevel,
  ModuleProgress,
  QuarterNumber,
  StudentAccount,
  UserAccount,
  UserRole,
} from '../types/lingoquest';

// ============================================================================
// Structured Firestore Error Handler (Skill Compliance)
// ============================================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  if (message.includes('Missing or insufficient permissions')) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
  console.warn(`Firestore ${operationType} notice on "${path}":`, message);
}

// ============================================================================
// Firestore Document Interfaces
// ============================================================================

/** `users/{uid}` document shape */
export interface FirestoreUserDoc {
  uid: string;
  id: string;
  displayName: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  gradeLevel?: GradeLevel;
  school: string;
  schoolName: string;
  section?: string;
  lrn?: string;
  learnerId?: string;
  classCode?: string;
  teacherId?: string;
  username?: string;
  photoUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt?: string;
}

/** `progress/{uid}` document shape */
export interface FirestoreProgressDoc {
  uid: string;
  userId: string;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  currentIsland: string;
  unlockedIslands: string[];
  completedQuests: string[];
  badges?: string[];
  progressByModule?: Record<string, ModuleProgress>;
  updatedAt: string;
}

/** `quizResults/{autoId}` document shape */
export interface FirestoreQuizResultDoc {
  id?: string;
  uid: string;
  questId: string;
  moduleTitle?: string;
  difficulty?: string;
  score: number;
  total: number;
  percentage?: number;
  passed?: boolean;
  timeSpent: number;
  createdAt: string;
}

/** `leaderboard/{uid}` document shape (public read, owner write) */
export interface FirestoreLeaderboardDoc {
  uid?: string;
  displayName: string;
  school: string;
  xp: number;
  level: number;
  gradeLevel?: GradeLevel;
  section?: string;
  bridgesRestoredCount?: number;
  completedQuestsCount?: number;
  updatedAt?: string;
}

// ============================================================================
// Level & Island Progression Helpers
// ============================================================================
export function calculateLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Number(xp) || 0);
  return Math.floor(safeXp / 250) + 1;
}

export function deriveIslandsFromStudent(student: StudentAccount): {
  currentIsland: string;
  unlockedIslands: string[];
} {
  const q1 = DAVAO_ORIENTAL_QUARTER_ISLANDS[1].name;
  const q2 = DAVAO_ORIENTAL_QUARTER_ISLANDS[2].name;
  const q3 = DAVAO_ORIENTAL_QUARTER_ISLANDS[3].name;
  const q4 = DAVAO_ORIENTAL_QUARTER_ISLANDS[4].name;

  const completedCount = student.completedModules?.length || 0;
  const unlocked: string[] = [q1];

  if (completedCount >= 2) unlocked.push(q2);
  if (completedCount >= 4) unlocked.push(q3);
  if (completedCount >= 6) unlocked.push(q4);

  const currentIsland = unlocked[unlocked.length - 1] || q1;
  return { currentIsland, unlockedIslands: unlocked };
}

// ============================================================================
// 1. `users/{uid}` Firestore Operations
// ============================================================================
export async function syncUserProfileToFirestore(
  uid: string,
  account: UserAccount,
  isNewSignup = false
): Promise<FirestoreUserDoc | null> {
  const path = `users/${uid}`;
  const nowIso = new Date().toISOString();

  const school =
    (account as any).schoolName ||
    (account as any).school ||
    'Mati National Comprehensive High School';

  // Enforce default role 'student' on client signup unless pending teacher
  const safeRole: UserRole =
    account.role === 'admin'
      ? 'admin'
      : account.role === 'teacher'
      ? 'teacher'
      : 'student';

  const docData: FirestoreUserDoc = {
    uid,
    id: uid,
    displayName: account.name.slice(0, 120),
    name: account.name.slice(0, 120),
    email: (account.email || '').slice(0, 150),
    role: safeRole,
    status: account.status || (safeRole === 'teacher' ? 'pending' : 'approved'),
    school: school.slice(0, 180),
    schoolName: school.slice(0, 180),
    createdAt: isNewSignup ? nowIso : (account as any).createdAt || nowIso,
    lastLoginAt: nowIso,
    updatedAt: nowIso,
  };

  if (account.role === 'student') {
    const stu = account as StudentAccount;
    docData.gradeLevel = stu.gradeLevel || 8;
    docData.section = (stu.section || '').slice(0, 80);
    docData.lrn = stu.lrn || stu.learnerId || '';
    docData.learnerId = stu.learnerId || stu.lrn || '';
    docData.classCode = stu.classCode || 'LQ-ENG-8492';
    docData.teacherId = stu.teacherId || 'tch-marco-solis';
    docData.username = stu.username || '';
    if (stu.photoUrl) docData.photoUrl = stu.photoUrl;
  }

  try {
    await setDoc(doc(db, 'users', uid), docData, { merge: true });
    return docData;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch {
      // Allow offline/local fallback if rules or auth session are not active for seed user
    }
    return null;
  }
}

export async function getUserProfileFromFirestore(
  uid: string
): Promise<FirestoreUserDoc | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as FirestoreUserDoc;
    }
    return null;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch {}
    return null;
  }
}

// ============================================================================
// 2. `progress/{uid}` & `leaderboard/{uid}` Firestore Operations
// ============================================================================
export async function syncStudentProgressToFirestore(
  uid: string,
  student: StudentAccount
): Promise<void> {
  if (!uid) {
    return;
  }

  const nowIso = new Date().toISOString();
  const xp = Math.max(0, Number(student.points) || 0);
  const level = calculateLevelFromXp(xp);
  const completedQuests = (student.completedModules || []).slice(0, 200);
  const bridgesRestoredCount = Object.values(student.progressByModule || {}).filter(
    (p) => p.isBridgeRestored
  ).length;
  const coins = xp * 2 + bridgesRestoredCount * 25;
  const gems = (student.badges?.length || 0) * 5 + bridgesRestoredCount * 2;
  const streak = Math.max(1, completedQuests.length);
  const { currentIsland, unlockedIslands } = deriveIslandsFromStudent(student);

  const progressDoc: FirestoreProgressDoc = {
    uid,
    userId: uid,
    xp,
    level,
    coins,
    gems,
    streak,
    currentIsland: currentIsland.slice(0, 120),
    unlockedIslands: unlockedIslands.slice(0, 50),
    completedQuests,
    badges: student.badges || [],
    progressByModule: student.progressByModule || {},
    updatedAt: nowIso,
  };

  // Always cache locally for offline fallback
  try {
    localStorage.setItem(`lingoquest_progress_${uid}`, JSON.stringify(progressDoc));
  } catch {}

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }

  try {
    await setDoc(doc(db, 'progress', uid), progressDoc, { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `progress/${uid}`);
    } catch {}
  }

  // Also sync public leaderboard entry (`leaderboard/{uid}`)
  await syncLeaderboardEntryToFirestore(uid, student);
}

export async function loadStudentProgressFromFirestore(
  uid: string
): Promise<FirestoreProgressDoc | null> {
  if (!uid) return null;

  try {
    if (auth.currentUser && auth.currentUser.uid === uid) {
      const snap = await getDoc(doc(db, 'progress', uid));
      if (snap.exists()) {
        const data = snap.data() as FirestoreProgressDoc;
        try {
          localStorage.setItem(`lingoquest_progress_${uid}`, JSON.stringify(data));
        } catch {}
        return data;
      }
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, `progress/${uid}`);
    } catch {}
  }

  // Offline localStorage fallback
  try {
    const cached = localStorage.getItem(`lingoquest_progress_${uid}`);
    if (cached) {
      return JSON.parse(cached) as FirestoreProgressDoc;
    }
  } catch {}

  return null;
}

/**
 * Merges cached offline progress and Firestore progress into the
 * authenticated student's account on login/signup, then persists to Firestore.
 */
export async function mergeLocalGuestProgressIntoStudent(
  uid: string,
  student: StudentAccount
): Promise<StudentAccount> {
  const remoteProgress = await loadStudentProgressFromFirestore(uid);

  let mergedPoints = student.points || 0;
  const mergedBadges = new Set<string>(student.badges || []);
  const mergedCompleted = new Set<string>(student.completedModules || []);
  const mergedProgressByModule: Record<string, ModuleProgress> = {
    ...(student.progressByModule || {}),
  };

  // Merge remote Firestore progress if available
  if (remoteProgress) {
    mergedPoints = Math.max(mergedPoints, remoteProgress.xp || 0);
    (remoteProgress.badges || []).forEach((b) => mergedBadges.add(b));
    (remoteProgress.completedQuests || []).forEach((q) => mergedCompleted.add(q));

    if (remoteProgress.progressByModule) {
      Object.entries(remoteProgress.progressByModule).forEach(([modId, remProg]) => {
        const existing = mergedProgressByModule[modId];
        if (!existing) {
          mergedProgressByModule[modId] = remProg;
        } else {
          mergedProgressByModule[modId] = {
            ...existing,
            lessonCompleted: existing.lessonCompleted || remProg.lessonCompleted,
            isBridgeRestored: existing.isBridgeRestored || remProg.isBridgeRestored,
            bestScorePercent: Math.max(
              existing.bestScorePercent || 0,
              remProg.bestScorePercent || 0
            ),
            attemptsCount: Math.max(existing.attemptsCount || 0, remProg.attemptsCount || 0),
          };
        }
      });
    }
  }

  const mergedStudent: StudentAccount = {
    ...student,
    points: mergedPoints,
    badges: Array.from(mergedBadges),
    completedModules: Array.from(mergedCompleted),
    progressByModule: mergedProgressByModule,
  };

  await syncStudentProgressToFirestore(uid, mergedStudent);
  return mergedStudent;
}

// ============================================================================
// 3. `quizResults/{autoId}` Firestore Operations
// ============================================================================
export async function recordQuizResultToFirestore(params: {
  uid: string;
  questId: string;
  moduleTitle?: string;
  difficulty?: string;
  score: number;
  total: number;
  percentage?: number;
  passed?: boolean;
  timeSpent?: number;
}): Promise<void> {
  if (!params.uid || !auth.currentUser || auth.currentUser.uid !== params.uid) {
    return;
  }

  const nowIso = new Date().toISOString();
  const payload: FirestoreQuizResultDoc = {
    uid: params.uid,
    questId: params.questId.slice(0, 100),
    moduleTitle: (params.moduleTitle || '').slice(0, 150),
    difficulty: params.difficulty || 'easy',
    score: Math.max(0, Number(params.score) || 0),
    total: Math.max(1, Number(params.total) || 1),
    percentage: params.percentage ?? Math.round((params.score / Math.max(1, params.total)) * 100),
    passed: Boolean(params.passed),
    timeSpent: Math.max(0, Number(params.timeSpent) || 45),
    createdAt: nowIso,
  };

  try {
    await addDoc(collection(db, 'quizResults'), payload);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.CREATE, 'quizResults');
    } catch {}
  }
}

export async function getStudentQuizResultsFromFirestore(
  uid: string
): Promise<FirestoreQuizResultDoc[]> {
  if (!uid || !auth.currentUser) {
    return [];
  }
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('uid', '==', uid),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreQuizResultDoc) }));
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'quizResults');
    } catch {}
    return [];
  }
}

// ============================================================================
// 4. `leaderboard/{uid}` Firestore Operations (Public Read, Owner Write)
// ============================================================================
export async function syncLeaderboardEntryToFirestore(
  uid: string,
  student: StudentAccount
): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }

  const xp = Math.max(0, Number(student.points) || 0);
  const level = calculateLevelFromXp(xp);
  const bridgesRestoredCount = Object.values(student.progressByModule || {}).filter(
    (p) => p.isBridgeRestored
  ).length;

  const entry: FirestoreLeaderboardDoc = {
    uid,
    displayName: (student.name || 'Student Explorer').slice(0, 120),
    school: (student.schoolName || 'DepEd Davao Oriental').slice(0, 180),
    xp,
    level,
    gradeLevel: student.gradeLevel || 8,
    section: (student.section || '').slice(0, 80),
    bridgesRestoredCount,
    completedQuestsCount: student.completedModules?.length || 0,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'leaderboard', uid), entry, { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `leaderboard/${uid}`);
    } catch {}
  }
}

export async function getPublicLeaderboardFromFirestore(): Promise<FirestoreLeaderboardDoc[]> {
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as FirestoreLeaderboardDoc),
    }));
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'leaderboard');
    } catch {}
    return [];
  }
}
