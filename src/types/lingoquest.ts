import type { PdfLesson } from '../data/curriculum/pdfCurriculum';
import type { DigitalBlock } from '../data/curriculum/digitalContent';
export type GradeLevel = 7 | 8 | 9 | 10;
export type QuarterNumber = 1 | 2 | 3 | 4;

export interface DavaoOrientalIslandInfo {
  quarter: QuarterNumber;
  name: string;
  tagline: string;
  municipality: string;
  landmark: string;
  description: string;
  themeColor: string;
}

export const DAVAO_ORIENTAL_QUARTER_ISLANDS: Record<QuarterNumber, DavaoOrientalIslandInfo> = {
  1: {
    quarter: 1,
    name: 'San Victor Island',
    tagline: 'Pacific Gem & Marine Sanctuary',
    municipality: 'Baganga, Davao Oriental',
    landmark: 'San Victor Marine Reserve',
    description: 'A world-famous 3-hectare pristine island surrounded by vibrant coral reefs, powdery white beaches, and preserved giant clams.',
    themeColor: '#0284C7',
  },
  2: {
    quarter: 2,
    name: 'Oak Island',
    tagline: 'The Vanishing Sandbar Island',
    municipality: 'Mati City, Davao Oriental',
    landmark: 'Pujada Bay Shifting Sandbar',
    description: 'An iconic islet famous for disappearing beneath high tide and emerging as a pure white sandbar at low tide.',
    themeColor: '#059669',
  },
  3: {
    quarter: 3,
    name: 'Waniban Island',
    tagline: 'Coral White-Sand Sanctuary',
    municipality: 'Mati City, Davao Oriental',
    landmark: 'Outer Pujada Bay Marine Sanctuary',
    description: 'A serene 4-hectare paradise with gentle turquoise waters, coral reefs, and tranquil sandbanks.',
    themeColor: '#D97706',
  },
  4: {
    quarter: 4,
    name: 'Pujada Island',
    tagline: 'Queen Jewel of Pujada Bay',
    municipality: 'Mati City, Davao Oriental',
    landmark: 'Pujada Bay Protected Seascape',
    description: 'A 156-hectare lush island famous for its powdery white beaches and crystal azure waters.',
    themeColor: '#7C3AED',
  },
};

export function getDavaoOrientalIsland(quarter: number): DavaoOrientalIslandInfo {
  const q = (quarter >= 1 && quarter <= 4 ? quarter : 1) as QuarterNumber;
  return DAVAO_ORIENTAL_QUARTER_ISLANDS[q];
}

export type TopicType =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'spelling'
  | 'sentence-construction'
  | 'literature'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'viewing'
  | 'research'
  | 'multimodal';

export type QuizGameType =
  | 'typeHunter'
  | 'pictureHunt'
  | 'missingPiece'
  | 'analogyMaster'
  | 'crosswordGame';

export type DifficultyLevel = 'easy' | 'moderate' | 'hard';

export type PictureSceneId =
  | 'lighthouse_storm'
  | 'bamboo_bridge'
  | 'ancient_scroll'
  | 'philippine_eagle'
  | 'festival_dancers'
  | 'library_scholar'
  | 'planting_mangroves'
  | 'mountain_campfire'
  | 'fishing_vinta'
  | 'science_microscope'
  | 'handshake_harmony'
  | 'hourglass_time'
  | 'magnifying_clue'
  | 'scales_justice'
  | 'megaphone_speech'
  | 'compass_voyage'
  | 'opposites_contrast'
  | 'cause_effect_rain'
  | 'part_whole_puzzle'
  | 'location_habitat'
  | 'anchor_bay'
  | 'coral_reef'
  | 'restored_bridge'
  | 'campfire_circle'
  | 'cultural_heritage'
  | 'coastal_horizon';

export interface PictureOption {
  conceptVisual?: {tokens:string[];variant:number};
  sourceImageUrl?: string;
  sourceGraphic?: DigitalBlock;
  id: string;
  sceneId: PictureSceneId;
  label: string;
  caption: string;
}

export interface CrosswordClueInfo {
  direction: 'ACROSS' | 'DOWN';
  clueNumber: number;
  wordLength: number;
  cluePrompt: string;
  letterGrid?: Array<{ index: number; letter: string; isGiven?: boolean }>;
}

export interface QuizQuestion {
  assessmentStyle?: 'restore-excerpt';
  learningTargetId?: string;
  assessmentKey?: string;
  sourceGraphic?: DigitalBlock;
  sourceImageUrl?: string;
  source?: { pdfSha256?: string; fileId: string; page: number; quote: string; answerQuote: string; sourceId: string; kind: string; answerSpans?: string[]; instructionPage?: number; answerKeyPage?: number; answerKeyQuote?: string };
  id: string;
  type: QuizGameType;
  difficulty: DifficultyLevel;
  prompt: string;
  contextSentence?: string;
  hint?: string;
  options?: string[];
  pictureOptions?: PictureOption[];
  analogyPair?: {
    firstA: string;
    firstB: string;
    secondC: string;
    relationshipType: string;
  };
  crosswordClue?: CrosswordClueInfo;
  answer: string;
  explanation: string;
  timeLimitSeconds: number;
}

export interface LessonExampleCard {
  title: string;
  example: string;
  analysis: string;
}

export interface LessonContent {
  overview: string;
  melcCompetency: string;
  keyRules: string[];
  examples: LessonExampleCard[];
  culturalConnection: string;
  warmupQuestion: {
    question: string;
    options: string[];
    correctAnswer: string;
    feedback: string;
  };
  writingPrompt: {
    title: string;
    instructions: string;
    sampleStarter: string;
  };
  // Detailed & Comprehensive Lesson Additions
  detailedGuideSections?: {
    heading: string;
    subheading?: string;
    content: string;
    bulletPoints?: string[];
    formulaOrStructure?: string;
    signalWords?: string[];
  }[];
  vocabularyGlossary?: {
    term: string;
    partOfSpeech?: string;
    definition: string;
    exampleSentence: string;
  }[];
  commonMistakesAndTips?: {
    mistake: string;
    correction: string;
    why: string;
  }[];
  studyChecklist?: string[];
  studyNotesSummary?: string;
}

export interface Module {
  pdfLesson?: PdfLesson;
  id: string;
  gradeLevel: GradeLevel;
  quarter: QuarterNumber;
  moduleNumber: number; // 1 to N within grade
  quarterModuleIndex: number; // 1 to N within quarter (supports quarters with 4, 6, 10+ modules)
  islandName: string;
  islandThemeColor: string;
  title: string;
  topicType: TopicType;
  lessonContent: LessonContent;
  quizQuestions: QuizQuestion[];
  requiredPassingScore: number; // e.g., 75 (percentage)
  isBridgeRestored?: boolean;
}

export interface QuizAttemptRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  gradeLevel: GradeLevel;
  quarter: QuarterNumber;
  difficulty: DifficultyLevel;
  gameModeFilter: QuizGameType | 'all';
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  pointsEarned: number;
  timestamp: string;
  isPersonalization: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  lessonCompleted: boolean;
  isBridgeRestored: boolean;
  bestScorePercent: number;
  attemptsCount: number;
  completedDifficulties: DifficultyLevel[];
  lastAttemptDate: string;
  quizHistory: QuizAttemptRecord[];
  visualInteractionsCompleted?: string[]; // IDs of completed visual items (e.g., 'explainer', 'diagram', 'minigame', 'stepper', 'pitfalls', 'hotspots', 'vocabFlip', 'selfCheck', 'cheatsheet')
  visualXpEarned?: number;
}

export interface PersonalizationRecord {
  id: string;
  exploredGrade: GradeLevel;
  moduleId: string;
  moduleTitle: string;
  scorePercent: number;
  pointsEarned: number;
  timestamp: string;
}

export interface GrammarIssue {
  originalPhrase: string;
  suggestion: string;
  explanation: string;
  ruleCategory: string;
}

export interface WritingFeedbackResult {
  overallClarityComment: string;
  clarityScore: number;
  correctedVersion: string;
  strengthsHighlighted: string[];
  grammarIssues: GrammarIssue[];
  constructionSuggestions: string[];
}

export interface WritingSubmissionRecord {
  id: string;
  moduleId?: string;
  promptTitle: string;
  studentText: string;
  feedback: WritingFeedbackResult;
  timestamp: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'lesson' | 'quiz' | 'bridge' | 'milestone' | 'writing';
  iconType:
    | 'scroll'
    | 'compass'
    | 'bridge'
    | 'crown'
    | 'lightning'
    | 'star'
    | 'trophy'
    | 'feather'
    | 'globe'
    | 'shield';
  pointsBonus: number;
}

export type UserRole = 'student' | 'teacher' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface StudentAccount {
  id: string;
  role: 'student';
  status: UserStatus;
  name: string;
  email: string; // Required for password recovery and notifications
  learnerId: string; // LRN
  lrn: string; // 12-digit DepEd Learner Reference Number
  gradeLevel: GradeLevel;
  schoolName?: string; // Complete name of school in DepEd Davao Oriental
  section?: string;
  classCode: string; // Teacher class code linking student to their teacher
  teacherId: string;
  username: string;
  password?: string;
  photoUrl?: string; // Base64 or image URL for profile picture
  points: number;
  questCoins?: number;
  badges: string[]; // array of BadgeDefinition IDs
  completedModules: string[]; // array of Module IDs
  progressByModule: Record<string, ModuleProgress>;
  personalizationHistory: PersonalizationRecord[];
  writingSubmissions: WritingSubmissionRecord[];
  isActive: boolean;
  joinedDate: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  enrollmentStatus?: 'pending_review' | 'approved' | 'rejected';
  enrollmentReviewedAt?: string;
  enrollmentReviewerId?: string;
  enrollmentReviewNote?: string;
}

export interface TeacherAccount {
  id: string;
  role: 'teacher';
  status: UserStatus;
  name: string;
  schoolName?: string; // Complete name of school in DepEd Davao Oriental
  department: string;
  employeeId: string;
  depEdEmail: string;
  email?: string; // Alias for depEdEmail for uniform recovery handling
  classCode: string; // Unique class code for students to join
  gradeLevels?: GradeLevel[]; // Grade levels handled by teacher (e.g., [7, 8])
  gradeClassCodes?: Partial<Record<GradeLevel, string>>; // Unique class code per handled grade level (e.g. { 7: 'LQP-G7-492', 8: 'LQP-G8-183' })
  staffRole?: 'Teacher' | 'Administrator';
  username: string;
  password?: string;
  photoUrl?: string;
  rejectionReason?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  isActive: boolean;
  joinedDate: string;
}

export interface AdminPermissions {
  canApproveTeachers: boolean; // Teacher applications, verification & approvals
  canManageModules: boolean; // Modification of modules and quizzes
  canViewStudentProgress: boolean; // Watch student progress and competency records
  canManageSubAdmins: boolean; // Only Main Admin can add, modify, or remove sub-admins
}

export interface AdminAccount {
  id: string;
  role: 'admin';
  status: UserStatus;
  name: string;
  email: string;
  username: string;
  password?: string;
  photoUrl?: string;
  adminTitle: string;
  employeeId: string;
  isActive: boolean;
  joinedDate: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  isMainAdmin?: boolean; // true for Main Admin (Super Admin), false for Sub-Admin
  adminLevel?: 'main' | 'sub';
  permissions?: AdminPermissions;
  createdByAdminId?: string;
  createdByName?: string;
}

export type UserAccount = StudentAccount | TeacherAccount | AdminAccount;

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail?: string;
  actionType:
    | 'teacher_approved'
    | 'teacher_rejected'
    | 'teacher_suspended'
    | 'teacher_reactivated'
    | 'teacher_deleted'
    | 'student_suspended'
    | 'student_reactivated'
    | 'student_deleted'
    | 'student_enrollment_approved'
    | 'student_enrollment_rejected'
    | 'sub_admin_created'
    | 'sub_admin_updated'
    | 'sub_admin_suspended'
    | 'sub_admin_reactivated'
    | 'sub_admin_deleted'
    | 'sub_admin_status_changed'
    | 'module_created'
    | 'module_updated'
    | 'module_deleted'
    | 'admin_login'
    | 'user_password_recovered'
    | 'audit_log_archived'
    | 'audit_log_unarchived'
    | 'audit_log_deleted'
    | 'audit_logs_cleared'
    | 'feedback_status_updated'
    | 'feedback_deleted';
  targetId: string;
  targetName: string;
  details: string;
  timestamp: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
}

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  learnerId: string;
  gradeLevel: GradeLevel;
  schoolName?: string;
  section: string;
  totalPoints: number;
  completedModulesCount: number;
  bridgesRestoredCount: number;
  averageScore: number;
  rank: number;
}

export type EmailNotificationType =
  | 'teacher_registration_received'
  | 'teacher_approved_confirmation'
  | 'teacher_rejected_notice'
  | 'student_registration_received'
  | 'student_enrollment_approved'
  | 'student_enrollment_rejected';

export interface EmailNotificationRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: 'student' | 'teacher' | 'admin';
  recipientUserId: string;
  notificationType: EmailNotificationType;
  subject: string;
  headline: string;
  messageBody: string;
  actionButtonLabel: string;
  canDirectLogin: boolean;
  credentialsSummary: {
    username: string;
    email: string;
    classCode?: string;
    lrn?: string;
    employeeId?: string;
    gradeLevel?: GradeLevel;
    schoolName?: string;
    approvedBy?: string;
  };
  isRead: boolean;
  sentAt: string;
}

export type FeedbackCategory =
  | 'bug_report'
  | 'feature_request'
  | 'general_comment'
  | 'help_inquiry';

export type FeedbackPriority = 'low' | 'medium' | 'high';

export type FeedbackStatus = 'open' | 'in_review' | 'resolved';

export interface SystemFeedbackRecord {
  id: string;
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
  status: FeedbackStatus;
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}


