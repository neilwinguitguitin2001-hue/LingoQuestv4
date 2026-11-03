import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('student'),
  status: text('status').notNull().default('approved'),
  name: text('name').notNull().default(''),
  username: text('username').notNull().default(''),
  password: text('password'),
  schoolName: text('school_name'),
  classCode: text('class_code'),
  teacherId: text('teacher_id'),
  lrn: text('lrn'),
  gradeLevel: integer('grade_level'),
  points: integer('points').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  accountData: jsonb('account_data').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customModules = pgTable('custom_modules', {
  id: serial('id').primaryKey(),
  moduleId: text('module_id').notNull().unique(),
  title: text('title').notNull(),
  gradeLevel: integer('grade_level').notNull(),
  quarter: integer('quarter').notNull(),
  moduleNumber: integer('module_number').notNull(),
  topicType: text('topic_type').notNull(),
  moduleData: jsonb('module_data').notNull(),
  updatedBy: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studentProgress = pgTable('student_progress', {
  id: serial('id').primaryKey(),
  progressKey: text('progress_key').notNull().unique(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  moduleId: text('module_id').notNull(),
  lessonCompleted: boolean('lesson_completed').notNull().default(false),
  isBridgeRestored: boolean('is_bridge_restored').notNull().default(false),
  bestScorePercent: integer('best_score_percent').notNull().default(0),
  attemptsCount: integer('attempts_count').notNull().default(0),
  pointsEarned: integer('points_earned').notNull().default(0),
  lastAttemptDate: text('last_attempt_date'),
  progressData: jsonb('progress_data').notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  logId: text('log_id').notNull().unique(),
  adminId: text('admin_id').notNull(),
  adminName: text('admin_name').notNull(),
  adminEmail: text('admin_email'),
  actionType: text('action_type').notNull(),
  targetId: text('target_id').notNull(),
  targetName: text('target_name').notNull(),
  details: text('details').notNull(),
  timestamp: text('timestamp').notNull(),
  isArchived: boolean('is_archived').notNull().default(false),
  archivedAt: text('archived_at'),
  archivedBy: text('archived_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailNotifications = pgTable('email_notifications', {
  id: serial('id').primaryKey(),
  notificationId: text('notification_id').notNull().unique(),
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name').notNull(),
  recipientRole: text('recipient_role').notNull(),
  recipientUserId: text('recipient_user_id').notNull(),
  notificationType: text('notification_type').notNull(),
  subject: text('subject').notNull(),
  headline: text('headline').notNull(),
  messageBody: text('message_body').notNull(),
  actionButtonLabel: text('action_button_label').notNull(),
  canDirectLogin: boolean('can_direct_login').notNull().default(false),
  credentialsSummary: jsonb('credentials_summary').notNull().default({}),
  isRead: boolean('is_read').notNull().default(false),
  sentAt: text('sent_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemFeedback = pgTable('system_feedback', {
  id: serial('id').primaryKey(),
  feedbackId: text('feedback_id').notNull().unique(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  userEmail: text('user_email').notNull(),
  schoolName: text('school_name'),
  gradeLevel: integer('grade_level'),
  classCode: text('class_code'),
  category: text('category').notNull(),
  priority: text('priority').notNull().default('medium'),
  targetArea: text('target_area').notNull().default('General System'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('open'),
  adminResponse: text('admin_response'),
  respondedBy: text('responded_by'),
  respondedAt: text('responded_at'),
  createdAtText: text('created_at_text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  progressRecords: many(studentProgress),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  student: one(users, {
    fields: [studentProgress.userUid],
    references: [users.uid],
  }),
}));

