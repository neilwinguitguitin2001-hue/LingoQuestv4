import { desc, eq, inArray } from 'drizzle-orm';
import { db, isCloudSqlAvailable } from './index.ts';
import {
  auditLogs,
  customModules,
  emailNotifications,
  studentProgress,
  systemFeedback,
  users,
} from './schema.ts';
import type {
  AdminAccount,
  AuditLogEntry,
  EmailNotificationRecord,
  GradeLevel,
  Module,
  ModuleProgress,
  StudentAccount,
  SystemFeedbackRecord,
  TeacherAccount,
  UserAccount,
} from '../types/lingoquest.ts';
import {
  ALL_MODULES,
  INITIAL_ADMINS,
  INITIAL_AUDIT_LOGS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
} from '../data/seedData.ts';

// ============================================================================
// Server-Side In-Memory Store (Fallback when Cloud SQL Unix socket is offline)
// ============================================================================
const memoryUsersMap = new Map<string, UserAccount>();
const memoryModulesMap = new Map<string, Module>();
const memoryAuditLogsMap = new Map<string, AuditLogEntry>();
const memoryEmailNotificationsMap = new Map<string, EmailNotificationRecord>();
const memoryFeedbackMap = new Map<string, SystemFeedbackRecord>();

function ensureMemoryStoreSeeded(): void {
  if (memoryUsersMap.size === 0) {
    const initialAccounts: UserAccount[] = [
      ...INITIAL_ADMINS,
      ...INITIAL_TEACHERS,
      ...INITIAL_STUDENTS,
    ];
    for (const acc of initialAccounts) {
      memoryUsersMap.set(acc.id, structuredClone(acc));
    }
  }

  if (memoryAuditLogsMap.size === 0) {
    for (const log of INITIAL_AUDIT_LOGS) {
      memoryAuditLogsMap.set(log.id, structuredClone(log));
    }
  }

  if (memoryEmailNotificationsMap.size === 0) {
    for (const t of INITIAL_TEACHERS) {
      const id = `email-seed-tch-${t.id}`;
      memoryEmailNotificationsMap.set(id, {
        id,
        recipientEmail: t.depEdEmail,
        recipientName: t.name,
        recipientRole: 'teacher',
        recipientUserId: t.id,
        notificationType: 'teacher_approved_confirmation',
        subject: `[LingoQuest Approved] Your Faculty Account & Class Code (${t.classCode}) Are Active`,
        headline: 'Faculty Account Approved by DepEd Davao Oriental Admin',
        messageBody: `Dear ${t.name}, your LingoQuest Faculty account for ${t.schoolName || t.department} has been verified and approved by the Division Administrator. Your unique Class Code (${t.classCode}) is now active for student enrollment.`,
        actionButtonLabel: 'Log In to Faculty Portal Now',
        canDirectLogin: false,
        credentialsSummary: {
          username: t.username,
          email: t.depEdEmail,
          classCode: t.classCode,
          employeeId: t.employeeId,
          schoolName: t.schoolName || t.department,
          approvedBy: 'Department of Education Davao Oriental',
        },
        isRead: false,
        sentAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      });
    }

    for (const s of INITIAL_STUDENTS) {
      const id = `email-seed-stu-${s.id}`;
      memoryEmailNotificationsMap.set(id, {
        id,
        recipientEmail: s.email,
        recipientName: s.name,
        recipientRole: 'student',
        recipientUserId: s.id,
        notificationType: 'student_enrollment_approved',
        subject: `[LingoQuest Welcome] Your Grade ${s.gradeLevel} Learner Account is Confirmed & Active`,
        headline: 'Learner Enrollment Confirmed — Start Your Island Quests!',
        messageBody: `Welcome aboard, ${s.name}! Your registration with email ${s.email} and DepEd LRN ${s.lrn} under Class Code ${s.classCode} has been verified.`,
        actionButtonLabel: 'Log In to Student Island Map',
        canDirectLogin: false,
        credentialsSummary: {
          username: s.username,
          email: s.email,
          classCode: s.classCode,
          lrn: s.lrn,
          gradeLevel: s.gradeLevel,
          schoolName: s.schoolName,
        },
        isRead: false,
        sentAt: new Date(Date.now() - 1800 * 1000).toISOString(),
      });
    }
  }

  if (memoryFeedbackMap.size === 0) {
    memoryFeedbackMap.set('fb-seed-001', {
      id: 'fb-seed-001',
      userId: 'stu-grade8',
      userName: 'Maria Clara Santos',
      userRole: 'student',
      userEmail: 'student.grade8@deped-davaoor.edu.ph',
      schoolName: 'Mati National Comprehensive High School (City of Mati)',
      gradeLevel: 8,
      classCode: 'LQ-G8-1008',
      category: 'feature_request',
      priority: 'medium',
      targetArea: 'Lesson & Quiz Game',
      subject: 'Audio Pronunciation Button for Vocabulary Words',
      message:
        'It would be super helpful if we could click a speaker icon next to unfamiliar Afro-Asian vocabulary words in Grade 8 Quarter 1 so we can hear how they are pronounced before taking the Bridge Quiz.',
      status: 'resolved',
      adminResponse:
        'Thank you Maria! Audio pronunciation and interactive 3D flip cards are now live in the Vocabulary Bank tab.',
      respondedBy: 'Department of Education Davao Oriental',
      respondedAt: '2026-10-28 14:20',
      createdAt: '2026-10-28 09:15',
    });
  }
}

ensureMemoryStoreSeeded();

function extractAccountEmail(account: UserAccount): string {
  if (account.role === 'teacher') {
    return (account as TeacherAccount).depEdEmail || (account as TeacherAccount).email || '';
  }
  return account.email || '';
}

function rowToUserAccount(row: typeof users.$inferSelect): UserAccount {
  const stored = (row.accountData || {}) as Partial<UserAccount>;
  const baseRole = (row.role || stored.role || 'student') as UserAccount['role'];

  if (baseRole === 'admin') {
    const adminStored = stored as Partial<AdminAccount>;
    return {
      id: row.uid,
      role: 'admin',
      status: (row.status as AdminAccount['status']) || adminStored.status || 'approved',
      name: row.name || adminStored.name || '',
      email: row.email || adminStored.email || '',
      username: row.username || adminStored.username || '',
      password: row.password ?? adminStored.password,
      photoUrl: adminStored.photoUrl,
      adminTitle: adminStored.adminTitle || 'Division Administrator',
      employeeId: adminStored.employeeId || '',
      isActive: row.isActive ?? adminStored.isActive ?? true,
      joinedDate: adminStored.joinedDate || new Date().toISOString().split('T')[0],
      suspensionReason: adminStored.suspensionReason,
      suspendedAt: adminStored.suspendedAt,
      suspendedBy: adminStored.suspendedBy,
      isMainAdmin: adminStored.isMainAdmin,
      adminLevel: adminStored.adminLevel,
      permissions: adminStored.permissions,
      createdByAdminId: adminStored.createdByAdminId,
      createdByName: adminStored.createdByName,
    };
  }

  if (baseRole === 'teacher') {
    const teacherStored = stored as Partial<TeacherAccount>;
    return {
      id: row.uid,
      role: 'teacher',
      status: (row.status as TeacherAccount['status']) || teacherStored.status || 'pending',
      name: row.name || teacherStored.name || '',
      schoolName: row.schoolName || teacherStored.schoolName,
      department: teacherStored.department || 'English Department',
      employeeId: teacherStored.employeeId || '',
      depEdEmail: row.email || teacherStored.depEdEmail || '',
      email: row.email || teacherStored.email || teacherStored.depEdEmail || '',
      classCode: row.classCode || teacherStored.classCode || '',
      gradeLevels: teacherStored.gradeLevels,
      gradeClassCodes: teacherStored.gradeClassCodes,
      staffRole: teacherStored.staffRole || 'Teacher',
      username: row.username || teacherStored.username || '',
      password: row.password ?? teacherStored.password,
      photoUrl: teacherStored.photoUrl,
      rejectionReason: teacherStored.rejectionReason,
      suspensionReason: teacherStored.suspensionReason,
      suspendedAt: teacherStored.suspendedAt,
      suspendedBy: teacherStored.suspendedBy,
      isActive: row.isActive ?? teacherStored.isActive ?? true,
      joinedDate: teacherStored.joinedDate || new Date().toISOString().split('T')[0],
    };
  }

  const studentStored = stored as Partial<StudentAccount>;
  return {
    id: row.uid,
    role: 'student',
    status: (row.status as StudentAccount['status']) || studentStored.status || 'approved',
    name: row.name || studentStored.name || '',
    email: row.email || studentStored.email || '',
    learnerId: row.lrn || studentStored.learnerId || studentStored.lrn || '',
    lrn: row.lrn || studentStored.lrn || studentStored.learnerId || '',
    gradeLevel: ((row.gradeLevel || studentStored.gradeLevel || 8) as StudentAccount['gradeLevel']),
    schoolName: row.schoolName || studentStored.schoolName,
    section: studentStored.section,
    classCode: row.classCode || studentStored.classCode || '',
    teacherId: row.teacherId || studentStored.teacherId || '',
    username: row.username || studentStored.username || '',
    password: row.password ?? studentStored.password,
    photoUrl: studentStored.photoUrl,
    points: row.points ?? studentStored.points ?? 0,
    badges: Array.isArray(studentStored.badges) ? studentStored.badges : ['first_lesson'],
    completedModules: Array.isArray(studentStored.completedModules) ? studentStored.completedModules : [],
    progressByModule: studentStored.progressByModule || {},
    personalizationHistory: Array.isArray(studentStored.personalizationHistory)
      ? studentStored.personalizationHistory
      : [],
    writingSubmissions: Array.isArray(studentStored.writingSubmissions)
      ? studentStored.writingSubmissions
      : [],
    isActive: row.isActive ?? studentStored.isActive ?? true,
    joinedDate: studentStored.joinedDate || new Date().toISOString().split('T')[0],
    suspensionReason: studentStored.suspensionReason,
    suspendedAt: studentStored.suspendedAt,
    suspendedBy: studentStored.suspendedBy,
    enrollmentStatus: studentStored.enrollmentStatus,
    enrollmentReviewedAt: studentStored.enrollmentReviewedAt,
    enrollmentReviewerId: studentStored.enrollmentReviewerId,
    enrollmentReviewNote: studentStored.enrollmentReviewNote,
  };
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string
): Promise<UserAccount> {
  ensureMemoryStoreSeeded();
  const cleanEmail = email.trim().toLowerCase();

  if (isCloudSqlAvailable()) {
    try {
      const existingByUid = await db.select().from(users).where(eq(users.uid, uid));
      if (existingByUid.length > 0) {
        const currentAccount = rowToUserAccount(existingByUid[0]);
        const updatedAccount: UserAccount = {
          ...currentAccount,
          email: cleanEmail || currentAccount.email,
          ...(photoUrl && !currentAccount.photoUrl ? { photoUrl } : {}),
        } as UserAccount;

        const upserted = await db
          .insert(users)
          .values({
            uid,
            email: cleanEmail,
            role: updatedAccount.role,
            status: updatedAccount.status,
            name: updatedAccount.name || displayName || cleanEmail.split('@')[0],
            username: updatedAccount.username || cleanEmail.split('@')[0],
            accountData: updatedAccount,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: users.uid,
            set: {
              email: cleanEmail,
              accountData: updatedAccount,
              updatedAt: new Date(),
            },
          })
          .returning();

        const acc = rowToUserAccount(upserted[0]);
        memoryUsersMap.set(acc.id, acc);
        return acc;
      }

      if (cleanEmail) {
        const existingByEmail = await db.select().from(users).where(eq(users.email, cleanEmail));
        if (existingByEmail.length > 0) {
          const acc = rowToUserAccount(existingByEmail[0]);
          memoryUsersMap.set(acc.id, acc);
          return acc;
        }
      }
    } catch {
      // Fall through to in-memory store
    }
  }

  const memByUid = memoryUsersMap.get(uid);
  if (memByUid) {
    return memByUid;
  }

  for (const acc of memoryUsersMap.values()) {
    const accEmail = extractAccountEmail(acc).toLowerCase();
    if (accEmail && accEmail === cleanEmail) {
      return acc;
    }
  }

  const defaultTeacher = INITIAL_TEACHERS[0];
  const defaultStudent: StudentAccount = {
    id: uid,
    role: 'student',
    status: 'approved',
    name: displayName || cleanEmail.split('@')[0] || 'DepEd Explorer',
    email: cleanEmail,
    learnerId: '129485000001',
    lrn: '129485000001',
    gradeLevel: 8,
    schoolName: defaultTeacher?.schoolName || 'Mati National Comprehensive High School',
    section: 'Rizal',
    classCode: defaultTeacher?.classCode || 'LQ-G7-1007',
    teacherId: defaultTeacher?.id || 'tch-grade7',
    username: cleanEmail.split('@')[0] || `explorer_${uid.slice(0, 6)}`,
    photoUrl,
    points: 200,
    badges: ['first_lesson'],
    completedModules: [],
    progressByModule: {},
    personalizationHistory: [],
    writingSubmissions: [],
    isActive: true,
    joinedDate: new Date().toISOString().split('T')[0],
    enrollmentStatus: 'approved',
  };

  memoryUsersMap.set(uid, defaultStudent);

  if (isCloudSqlAvailable()) {
    try {
      await upsertUserAccount(defaultStudent);
    } catch {}
  }

  return defaultStudent;
}

export async function upsertUserAccount(account: UserAccount): Promise<UserAccount> {
  ensureMemoryStoreSeeded();
  memoryUsersMap.set(account.id, structuredClone(account));

  if (!isCloudSqlAvailable()) {
    return account;
  }

  try {
    const email = extractAccountEmail(account);
    const schoolName =
      account.role === 'student' || account.role === 'teacher' ? account.schoolName || null : null;
    const classCode =
      account.role === 'student' || account.role === 'teacher' ? account.classCode || null : null;
    const teacherId = account.role === 'student' ? account.teacherId || null : null;
    const lrn = account.role === 'student' ? account.lrn || account.learnerId || null : null;
    const gradeLevel = account.role === 'student' ? Number(account.gradeLevel) || 8 : null;
    const points = account.role === 'student' ? Number(account.points) || 0 : 0;

    const result = await db
      .insert(users)
      .values({
        uid: account.id,
        email,
        role: account.role,
        status: account.status,
        name: account.name,
        username: account.username,
        password: account.password || null,
        schoolName,
        classCode,
        teacherId,
        lrn,
        gradeLevel,
        points,
        isActive: account.isActive ?? true,
        accountData: account,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          role: account.role,
          status: account.status,
          name: account.name,
          username: account.username,
          password: account.password || null,
          schoolName,
          classCode,
          teacherId,
          lrn,
          gradeLevel,
          points,
          isActive: account.isActive ?? true,
          accountData: account,
          updatedAt: new Date(),
        },
      })
      .returning();

    return rowToUserAccount(result[0]);
  } catch {
    return account;
  }
}

export async function getAllUserAccounts(): Promise<UserAccount[]> {
  ensureMemoryStoreSeeded();
  if (!isCloudSqlAvailable()) {
    return Array.from(memoryUsersMap.values());
  }

  try {
    const rows = await db.select().from(users);
    if (rows.length > 0) {
      const list = rows.map(rowToUserAccount);
      memoryUsersMap.clear();
      for (const acc of list) {
        memoryUsersMap.set(acc.id, acc);
      }
      return list;
    }
  } catch {}

  return Array.from(memoryUsersMap.values());
}

export async function getUserAccountByUid(uid: string): Promise<UserAccount | null> {
  ensureMemoryStoreSeeded();
  if (!isCloudSqlAvailable()) {
    return memoryUsersMap.get(uid) || null;
  }

  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    if (rows.length === 0) return memoryUsersMap.get(uid) || null;
    const acc = rowToUserAccount(rows[0]);
    memoryUsersMap.set(acc.id, acc);
    return acc;
  } catch {
    return memoryUsersMap.get(uid) || null;
  }
}

export async function deleteUserAccountByUid(uid: string): Promise<boolean> {
  ensureMemoryStoreSeeded();
  memoryUsersMap.delete(uid);

  if (!isCloudSqlAvailable()) {
    return true;
  }

  try {
    await db.delete(users).where(eq(users.uid, uid));
  } catch {}
  return true;
}

export async function getAllCustomModulesFromDb(): Promise<Module[]> {
  ensureMemoryStoreSeeded();
  if (!isCloudSqlAvailable()) {
    return Array.from(memoryModulesMap.values());
  }

  try {
    const rows = await db.select().from(customModules);
    const list = rows.map((r) => r.moduleData as Module);
    for (const m of list) {
      memoryModulesMap.set(m.id, m);
    }
    return list;
  } catch {
    return Array.from(memoryModulesMap.values());
  }
}

export async function upsertCustomModuleInDb(
  moduleData: Module,
  updatedBy?: string
): Promise<Module> {
  ensureMemoryStoreSeeded();
  memoryModulesMap.set(moduleData.id, structuredClone(moduleData));

  if (!isCloudSqlAvailable()) {
    return moduleData;
  }

  try {
    await db
      .insert(customModules)
      .values({
        moduleId: moduleData.id,
        title: moduleData.title,
        gradeLevel: Number(moduleData.gradeLevel),
        quarter: Number(moduleData.quarter),
        moduleNumber: Number(moduleData.moduleNumber),
        topicType: moduleData.topicType,
        moduleData,
        updatedBy: updatedBy || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: customModules.moduleId,
        set: {
          title: moduleData.title,
          gradeLevel: Number(moduleData.gradeLevel),
          quarter: Number(moduleData.quarter),
          moduleNumber: Number(moduleData.moduleNumber),
          topicType: moduleData.topicType,
          moduleData,
          updatedBy: updatedBy || null,
          updatedAt: new Date(),
        },
      });
  } catch {}

  return moduleData;
}

export async function deleteCustomModuleFromDb(moduleId: string): Promise<boolean> {
  ensureMemoryStoreSeeded();
  memoryModulesMap.delete(moduleId);

  if (!isCloudSqlAvailable()) {
    return true;
  }

  try {
    await db.delete(customModules).where(eq(customModules.moduleId, moduleId));
  } catch {}
  return true;
}

export async function upsertStudentProgressInDb(
  student: StudentAccount,
  moduleId: string,
  prog: ModuleProgress
): Promise<void> {
  ensureMemoryStoreSeeded();
  memoryUsersMap.set(student.id, structuredClone(student));

  if (!isCloudSqlAvailable()) {
    return;
  }

  try {
    await upsertUserAccount(student);
    const progressKey = `${student.id}_${moduleId}`;
    await db
      .insert(studentProgress)
      .values({
        progressKey,
        userUid: student.id,
        moduleId,
        lessonCompleted: prog.lessonCompleted,
        isBridgeRestored: prog.isBridgeRestored,
        bestScorePercent: Math.round(prog.bestScorePercent || 0),
        attemptsCount: prog.attemptsCount || 0,
        pointsEarned: student.points || 0,
        lastAttemptDate: prog.lastAttemptDate || '',
        progressData: prog,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: studentProgress.progressKey,
        set: {
          lessonCompleted: prog.lessonCompleted,
          isBridgeRestored: prog.isBridgeRestored,
          bestScorePercent: Math.round(prog.bestScorePercent || 0),
          attemptsCount: prog.attemptsCount || 0,
          pointsEarned: student.points || 0,
          lastAttemptDate: prog.lastAttemptDate || '',
          progressData: prog,
          updatedAt: new Date(),
        },
      });
  } catch {}
}

export async function getAllAuditLogsFromDb(): Promise<AuditLogEntry[]> {
  ensureMemoryStoreSeeded();
  if (!isCloudSqlAvailable()) {
    return Array.from(memoryAuditLogsMap.values()).sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
  }

  try {
    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
    if (rows.length > 0) {
      const list = rows.map((r) => ({
        id: r.logId,
        adminId: r.adminId,
        adminName: r.adminName,
        adminEmail: r.adminEmail || undefined,
        actionType: r.actionType as AuditLogEntry['actionType'],
        targetId: r.targetId,
        targetName: r.targetName,
        details: r.details,
        timestamp: r.timestamp,
        isArchived: r.isArchived,
        archivedAt: r.archivedAt || undefined,
        archivedBy: r.archivedBy || undefined,
      }));
      for (const l of list) {
        memoryAuditLogsMap.set(l.id, l);
      }
      return list;
    }
  } catch {}

  return Array.from(memoryAuditLogsMap.values()).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );
}

export async function insertAuditLogInDb(entry: AuditLogEntry): Promise<AuditLogEntry> {
  ensureMemoryStoreSeeded();
  memoryAuditLogsMap.set(entry.id, structuredClone(entry));

  if (!isCloudSqlAvailable()) {
    return entry;
  }

  try {
    await db
      .insert(auditLogs)
      .values({
        logId: entry.id,
        adminId: entry.adminId,
        adminName: entry.adminName,
        adminEmail: entry.adminEmail || null,
        actionType: entry.actionType,
        targetId: entry.targetId,
        targetName: entry.targetName,
        details: entry.details,
        timestamp: entry.timestamp,
        isArchived: entry.isArchived ?? false,
        archivedAt: entry.archivedAt || null,
        archivedBy: entry.archivedBy || null,
      })
      .onConflictDoUpdate({
        target: auditLogs.logId,
        set: {
          isArchived: entry.isArchived ?? false,
          archivedAt: entry.archivedAt || null,
          archivedBy: entry.archivedBy || null,
        },
      });
  } catch {}
  return entry;
}

export async function updateAuditLogsArchiveInDb(
  logIds: string[],
  isArchived: boolean,
  archivedBy?: string
): Promise<boolean> {
  ensureMemoryStoreSeeded();
  if (logIds.length === 0) return true;
  const now = isArchived ? new Date().toISOString() : undefined;

  for (const id of logIds) {
    const existing = memoryAuditLogsMap.get(id);
    if (existing) {
      memoryAuditLogsMap.set(id, {
        ...existing,
        isArchived,
        archivedAt: now,
        archivedBy: isArchived ? archivedBy : undefined,
      });
    }
  }

  if (!isCloudSqlAvailable()) {
    return true;
  }

  try {
    await db
      .update(auditLogs)
      .set({
        isArchived,
        archivedAt: now || null,
        archivedBy: isArchived ? archivedBy || null : null,
      })
      .where(inArray(auditLogs.logId, logIds));
  } catch {}
  return true;
}

export async function deleteAuditLogsFromDb(logIds: string[]): Promise<boolean> {
  ensureMemoryStoreSeeded();
  if (logIds.length === 0) return true;
  for (const id of logIds) {
    memoryAuditLogsMap.delete(id);
  }

  if (!isCloudSqlAvailable()) {
    return true;
  }

  try {
    await db.delete(auditLogs).where(inArray(auditLogs.logId, logIds));
  } catch {}
  return true;
}

// ----------------------------------------------------
// Email Notification Persistence (Cloud SQL + Memory Fallback)
// ----------------------------------------------------
export async function getAllEmailNotificationsFromDb(): Promise<EmailNotificationRecord[]> {
  ensureMemoryStoreSeeded();
  if (!isCloudSqlAvailable()) {
    return Array.from(memoryEmailNotificationsMap.values()).sort((a, b) =>
      b.sentAt.localeCompare(a.sentAt)
    );
  }

  try {
    const rows = await db
      .select()
      .from(emailNotifications)
      .orderBy(desc(emailNotifications.sentAt));
    if (rows.length > 0) {
      const list = rows.map((r) => ({
        id: r.notificationId,
        recipientEmail: r.recipientEmail,
        recipientName: r.recipientName,
        recipientRole: r.recipientRole as EmailNotificationRecord['recipientRole'],
        recipientUserId: r.recipientUserId,
        notificationType: r.notificationType as EmailNotificationRecord['notificationType'],
        subject: r.subject,
        headline: r.headline,
        messageBody: r.messageBody,
        actionButtonLabel: r.actionButtonLabel,
        canDirectLogin: r.canDirectLogin,
        credentialsSummary: (r.credentialsSummary || {}) as EmailNotificationRecord['credentialsSummary'],
        isRead: r.isRead,
        sentAt: r.sentAt,
      }));
      for (const item of list) {
        memoryEmailNotificationsMap.set(item.id, item);
      }
      return list;
    }
  } catch {}

  return Array.from(memoryEmailNotificationsMap.values()).sort((a, b) =>
    b.sentAt.localeCompare(a.sentAt)
  );
}

export async function insertEmailNotificationInDb(
  record: EmailNotificationRecord
): Promise<EmailNotificationRecord> {
  ensureMemoryStoreSeeded();
  memoryEmailNotificationsMap.set(record.id, structuredClone(record));

  if (!isCloudSqlAvailable()) {
    return record;
  }

  try {
    await db
      .insert(emailNotifications)
      .values({
        notificationId: record.id,
        recipientEmail: record.recipientEmail,
        recipientName: record.recipientName,
        recipientRole: record.recipientRole,
        recipientUserId: record.recipientUserId,
        notificationType: record.notificationType,
        subject: record.subject,
        headline: record.headline,
        messageBody: record.messageBody,
        actionButtonLabel: record.actionButtonLabel,
        canDirectLogin: record.canDirectLogin,
        credentialsSummary: record.credentialsSummary,
        isRead: record.isRead,
        sentAt: record.sentAt,
      })
      .onConflictDoUpdate({
        target: emailNotifications.notificationId,
        set: {
          isRead: record.isRead,
          canDirectLogin: record.canDirectLogin,
          credentialsSummary: record.credentialsSummary,
        },
      });
  } catch {}
  return record;
}

export async function markEmailNotificationReadInDb(notificationId: string): Promise<boolean> {
  ensureMemoryStoreSeeded();
  const existing = memoryEmailNotificationsMap.get(notificationId);
  if (existing) {
    memoryEmailNotificationsMap.set(notificationId, { ...existing, isRead: true });
  }

  if (!isCloudSqlAvailable()) {
    return true;
  }

  try {
    await db
      .update(emailNotifications)
      .set({ isRead: true })
      .where(eq(emailNotifications.notificationId, notificationId));
  } catch {}
  return true;
}

// ----------------------------------------------------
// System Feedback, Bug Reports & Feature Requests
// ----------------------------------------------------
export async function getAllSystemFeedbackFromDb(): Promise<SystemFeedbackRecord[]> {
  ensureMemoryStoreSeeded();
  if (!isCloudSqlAvailable()) {
    return Array.from(memoryFeedbackMap.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  try {
    const rows = await db
      .select()
      .from(systemFeedback)
      .orderBy(desc(systemFeedback.createdAtText));
    if (rows.length > 0) {
      const list = rows.map((r) => ({
        id: r.feedbackId,
        userId: r.userId,
        userName: r.userName,
        userRole: r.userRole as SystemFeedbackRecord['userRole'],
        userEmail: r.userEmail,
        schoolName: r.schoolName || undefined,
        gradeLevel: (r.gradeLevel as GradeLevel) || undefined,
        classCode: r.classCode || undefined,
        category: r.category as SystemFeedbackRecord['category'],
        priority: (r.priority as SystemFeedbackRecord['priority']) || 'medium',
        targetArea: r.targetArea || 'General System',
        subject: r.subject,
        message: r.message,
        status: (r.status as SystemFeedbackRecord['status']) || 'open',
        adminResponse: r.adminResponse || undefined,
        respondedBy: r.respondedBy || undefined,
        respondedAt: r.respondedAt || undefined,
        createdAt: r.createdAtText,
      }));
      for (const f of list) {
        memoryFeedbackMap.set(f.id, f);
      }
      return list;
    }
  } catch {}

  return Array.from(memoryFeedbackMap.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function upsertSystemFeedbackInDb(
  record: SystemFeedbackRecord
): Promise<SystemFeedbackRecord> {
  ensureMemoryStoreSeeded();
  memoryFeedbackMap.set(record.id, structuredClone(record));

  if (!isCloudSqlAvailable()) {
    return record;
  }

  try {
    await db
      .insert(systemFeedback)
      .values({
        feedbackId: record.id,
        userId: record.userId,
        userName: record.userName,
        userRole: record.userRole,
        userEmail: record.userEmail,
        schoolName: record.schoolName || null,
        gradeLevel: record.gradeLevel ? Number(record.gradeLevel) : null,
        classCode: record.classCode || null,
        category: record.category,
        priority: record.priority || 'medium',
        targetArea: record.targetArea || 'General System',
        subject: record.subject,
        message: record.message,
        status: record.status || 'open',
        adminResponse: record.adminResponse || null,
        respondedBy: record.respondedBy || null,
        respondedAt: record.respondedAt || null,
        createdAtText: record.createdAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemFeedback.feedbackId,
        set: {
          status: record.status,
          priority: record.priority,
          adminResponse: record.adminResponse || null,
          respondedBy: record.respondedBy || null,
          respondedAt: record.respondedAt || null,
          updatedAt: new Date(),
        },
      });
  } catch {}
  return record;
}

export async function deleteSystemFeedbackFromDb(feedbackId: string): Promise<boolean> {
  ensureMemoryStoreSeeded();
  memoryFeedbackMap.delete(feedbackId);

  if (!isCloudSqlAvailable()) {
    return true;
  }

  try {
    await db.delete(systemFeedback).where(eq(systemFeedback.feedbackId, feedbackId));
  } catch {}
  return true;
}

let isCloudSqlSeeded = false;

export async function seedInitialCloudSqlData(): Promise<{
  usersCount: number;
  auditLogsCount: number;
  modulesCount: number;
}> {
  ensureMemoryStoreSeeded();

  if (!isCloudSqlAvailable()) {
    return {
      usersCount: memoryUsersMap.size,
      auditLogsCount: memoryAuditLogsMap.size,
      modulesCount: memoryModulesMap.size,
    };
  }

  try {
    const legacyUids = [
      'stu-maria-santos',
      'stu-carlo-mendoza',
      'stu-althea-villanueva',
      'stu-danica-magbanua',
      'stu-joshua-dizon',
      'stu-katrina-bautista',
      'stu-rafael-aquino',
      'stu-juanito-gomez',
      'stu-kyla-santos',
      'tch-marco-solis',
      'tch-sarah-morales',
      'tch-danilo-castro',
      'tch-alicia-vega',
    ];
    await db.delete(users).where(inArray(users.uid, legacyUids));

    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0 || !isCloudSqlSeeded) {
      const seedAccounts: UserAccount[] = [
        ...INITIAL_ADMINS,
        ...INITIAL_TEACHERS,
        ...INITIAL_STUDENTS,
      ];
      for (const account of seedAccounts) {
        const alreadyExists = existingUsers.some((u) => u.uid === account.id);
        if (!alreadyExists) {
          await upsertUserAccount(account);
        }
      }
    }

    const existingLogs = await db.select().from(auditLogs);
    if (existingLogs.length === 0) {
      for (const logItem of INITIAL_AUDIT_LOGS) {
        await insertAuditLogInDb(logItem);
      }
    }

    const existingModules = await db.select().from(customModules);
    if (existingModules.length === 0) {
      for (const mod of ALL_MODULES.slice(0, 8)) {
        await upsertCustomModuleInDb(mod, INITIAL_ADMINS[0]?.id || 'admin-deped-davao-oriental');
      }
    }

    const existingEmails = await db.select().from(emailNotifications);
    if (existingEmails.length === 0) {
      for (const emailItem of memoryEmailNotificationsMap.values()) {
        await insertEmailNotificationInDb(emailItem);
      }
    }

    const existingFeedback = await db.select().from(systemFeedback);
    if (existingFeedback.length === 0) {
      for (const fbItem of memoryFeedbackMap.values()) {
        await upsertSystemFeedbackInDb(fbItem);
      }
    }

    isCloudSqlSeeded = true;
    const finalUsers = await db.select().from(users);
    const finalLogs = await db.select().from(auditLogs);
    const finalMods = await db.select().from(customModules);

    return {
      usersCount: finalUsers.length,
      auditLogsCount: finalLogs.length,
      modulesCount: finalMods.length,
    };
  } catch {
    return {
      usersCount: memoryUsersMap.size,
      auditLogsCount: memoryAuditLogsMap.size,
      modulesCount: memoryModulesMap.size,
    };
  }
}
