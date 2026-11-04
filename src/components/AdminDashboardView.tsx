import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Award,
  BarChart2,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Crown,
  Edit,
  Eye,
  Feather,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Inbox,
  Info,
  Key,
  Layers,
  ListFilter,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import {
  AdminAccount,
  AuditLogEntry,
  DifficultyLevel,
  FeedbackStatus,
  GradeLevel,
  Module,
  QuarterNumber,
  QuizGameType,
  QuizQuestion,
  StudentAccount,
  SystemFeedbackRecord,
  TeacherAccount,
  UserAccount,
} from '../types/lingoquest';
import { InabelHeaderStrip } from './InabelHeaderStrip';
import { BADGE_DEFINITIONS } from '../data/seedData';
import { generateUniqueClassCode } from '../services/firestoreService';
import { soundFX } from '../utils/soundEffects';
import { AdminFeedbackConsoleView } from './AdminFeedbackConsoleView';
import { ComprehensiveCurriculumView } from './ComprehensiveCurriculumView';
import { CurriculumBottlenecksView } from './CurriculumBottlenecksView';
import { InteractiveIslandMap, IslandStationData } from './InteractiveIslandMap';

interface AdminDashboardViewProps {
  currentAdmin: AdminAccount;
  admins?: AdminAccount[];
  allUsers: UserAccount[];
  modules: Module[];
  auditLogs: AuditLogEntry[];
  onApproveTeacher: (teacherId: string, customClassCode?: string) => Promise<{ success: boolean; classCode: string }>;
  onUpdateTeacherClassCode?: (teacherId: string, newClassCode: string) => Promise<{ success: boolean; classCode: string; error?: string }>;
  onRejectTeacher: (teacherId: string, reason: string) => Promise<boolean>;
  onSuspendUser: (userId: string, reason: string) => Promise<boolean>;
  onReactivateUser: (userId: string) => Promise<boolean>;
  onCreateModule: (moduleData: Module) => Promise<Module>;
  onUpdateModule: (moduleData: Module) => Promise<Module>;
  onDeleteModule: (moduleId: string, moduleTitle: string) => Promise<boolean>;
  onDeleteTeacher?: (teacherId: string, reason?: string) => Promise<boolean>;
  onDeleteStudent?: (studentId: string, reason?: string) => Promise<boolean>;
  onAddSubAdmin?: (subAdminData: {
    name: string;
    email: string;
    username: string;
    password?: string;
    adminTitle: string;
    employeeId: string;
  }) => Promise<{ success: boolean; subAdmin?: AdminAccount; error?: string }>;
  onUpdateSubAdmin?: (
    subAdminId: string,
    updates: Partial<AdminAccount>
  ) => Promise<{ success: boolean; subAdmin?: AdminAccount; error?: string }>;
  onDeleteSubAdmin?: (subAdminId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  onArchiveAuditLog?: (logId: string) => Promise<boolean>;
  onUnarchiveAuditLog?: (logId: string) => Promise<boolean>;
  onDeleteAuditLog?: (logId: string) => Promise<boolean>;
  onBulkArchiveAuditLogs?: (logIds: string[]) => Promise<boolean>;
  onBulkDeleteAuditLogs?: (logIds: string[]) => Promise<boolean>;
  feedbackItems?: SystemFeedbackRecord[];
  onUpdateFeedbackStatus?: (
    feedbackId: string,
    updates: { status: FeedbackStatus; adminResponse?: string }
  ) => Promise<void>;
  onDeleteFeedback?: (feedbackId: string) => Promise<void>;
  onRefreshData: () => void;
  onPreviewAsStudent?: (targetGrade?: GradeLevel) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentAdmin,
  admins,
  allUsers,
  modules,
  auditLogs,
  onApproveTeacher,
  onUpdateTeacherClassCode,
  onRejectTeacher,
  onSuspendUser,
  onReactivateUser,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  onDeleteTeacher,
  onDeleteStudent,
  onAddSubAdmin,
  onUpdateSubAdmin,
  onDeleteSubAdmin,
  onArchiveAuditLog,
  onUnarchiveAuditLog,
  onDeleteAuditLog,
  onBulkArchiveAuditLogs,
  onBulkDeleteAuditLogs,
  feedbackItems = [],
  onUpdateFeedbackStatus,
  onDeleteFeedback,
  onRefreshData,
  onPreviewAsStudent,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    | 'ACCOUNT_MANAGEMENT'
    | 'APPROVAL_QUEUE'
    | 'STUDENT_ROSTER'
    | 'MODULE_MANAGER'
    | 'SUB_ADMINS'
    | 'AUDIT_LOG'
    | 'CURRICULUM_ANALYTICS'
    | 'ARCHIPELAGO_MAP'
    | 'FEEDBACK_CONSOLE'
  >('APPROVAL_QUEUE');

  // Unified Account Management State (Suspend & Remove Accounts)
  const [accountRoleFilter, setAccountRoleFilter] = useState<'all' | 'teacher' | 'student' | 'admin'>('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'all' | 'approved' | 'suspended' | 'pending' | 'rejected'>('all');
  const [accountSearch, setAccountSearch] = useState('');

  // School-wide Archipelago Map Overview States
  const [mapGradeFilter, setMapGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [mapSectionFilter, setMapSectionFilter] = useState<string>('all');
  const [mapTeacherFilter, setMapTeacherFilter] = useState<string>('all');
  const [selectedAdminMapIsland, setSelectedAdminMapIsland] = useState<IslandStationData | null>(null);

  // Authority calculation: Main Admin vs Sub-Admin
  const isMainAdmin = Boolean(
    currentAdmin.isMainAdmin ??
      (currentAdmin.adminLevel === 'main' ||
        currentAdmin.id === 'admin-deped-davao-oriental' ||
        currentAdmin.id === 'admin-elena-reyes' ||
        !currentAdmin.createdByAdminId)
  );

  // Consolidated administrators list
  const allAdmins = useMemo<AdminAccount[]>(() => {
    if (admins && admins.length > 0) return admins;
    return allUsers.filter((u): u is AdminAccount => u.role === 'admin');
  }, [admins, allUsers]);

  // Main Administrator reference
  const mainAdmin = useMemo(() => {
    return (
      allAdmins.find(
        (a) =>
          a.isMainAdmin ??
          (a.adminLevel === 'main' ||
            a.id === 'admin-deped-davao-oriental' ||
            a.id === 'admin-elena-reyes' ||
            !a.createdByAdminId)
      ) || currentAdmin
    );
  }, [allAdmins, currentAdmin]);

  // Sub-Admin Management state
  const [showAddSubAdminModal, setShowAddSubAdminModal] = useState(false);
  const [subAdminName, setSubAdminName] = useState('');
  const [subAdminEmail, setSubAdminEmail] = useState('');
  const [subAdminUsername, setSubAdminUsername] = useState('');
  const [subAdminPassword, setSubAdminPassword] = useState('subadmin123');
  const [subAdminTitle, setSubAdminTitle] = useState('Assistant Curriculum Coordinator');
  const [subAdminEmployeeId, setSubAdminEmployeeId] = useState('');
  const [subAdminFormError, setSubAdminFormError] = useState<string | null>(null);
  const [isSubmittingSubAdmin, setIsSubmittingSubAdmin] = useState(false);

  // Edit sub-admin modal state
  const [editingSubAdmin, setEditingSubAdmin] = useState<AdminAccount | null>(null);
  const [editAdminTitle, setEditAdminTitle] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editAdminIsActive, setEditAdminIsActive] = useState(true);
  const [editAdminError, setEditAdminError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete sub-admin modal state
  const [deletingSubAdmin, setDeletingSubAdmin] = useState<AdminAccount | null>(null);
  const [deleteSubAdminReason, setDeleteSubAdminReason] = useState('');
  const [isDeletingSubAdmin, setIsDeletingSubAdmin] = useState(false);

  // Student roster filters & drilldown modal state (Read-Only)
  const [studentGradeFilter, setStudentGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [studentTeacherFilter, setStudentTeacherFilter] = useState<string | 'all'>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all');
  const [studentPerformanceFilter, setStudentPerformanceFilter] = useState<'all' | 'restored' | 'high_mastery' | 'needs_support'>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForDrillDown, setSelectedStudentForDrillDown] = useState<StudentAccount | null>(null);

  // Approval queue filters
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Modal states for action reasons
  const [rejectingTeacher, setRejectingTeacher] = useState<TeacherAccount | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [suspendingUser, setSuspendingUser] = useState<UserAccount | null>(null);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('');
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherAccount | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState('');
  const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentAccount | null>(null);
  const [deleteStudentReasonInput, setDeleteStudentReasonInput] = useState('');
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Module Manager states
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [quarterFilter, setQuarterFilter] = useState<QuarterNumber | 'all'>('all');
  const [moduleSearch, setModuleSearch] = useState('');
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);

  // Form state for creating / editing module
  const [formTitle, setFormTitle] = useState('');
  const [formGrade, setFormGrade] = useState<GradeLevel>(8);
  const [formQuarter, setFormQuarter] = useState<QuarterNumber>(1);
  const [formModuleNumber, setFormModuleNumber] = useState(1);
  const [formIslandName, setFormIslandName] = useState('Pujada Island');
  const [formIslandColor, setFormIslandColor] = useState('#0284C7');
  const [formPassingScore, setFormPassingScore] = useState(75);
  const [formTopicType, setFormTopicType] = useState('grammar');
  const [formMelc, setFormMelc] = useState('EN8G-Ia-7: Use parallel structures.');
  const [formOverview, setFormOverview] = useState('');
  const [formKeyRules, setFormKeyRules] = useState('Rule 1: Keep grammatical elements symmetrical.\nRule 2: Balance nouns with nouns, verbs with verbs.');
  const [formCulturalConnection, setFormCulturalConnection] = useState('Davao Oriental coastal heritage reflection.');
  const [formQuizQuestions, setFormQuizQuestions] = useState<QuizQuestion[]>([]);

  // Audit log filter & archive states
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditViewMode, setAuditViewMode] = useState<'active' | 'archived' | 'all'>('active');
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);
  const [confirmDeleteAudit, setConfirmDeleteAudit] = useState<AuditLogEntry | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isProcessingAuditAction, setIsProcessingAuditAction] = useState(false);

  // Toast / notification message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleSelectAudit = (id: string) => {
    soundFX.playClick();
    setSelectedAuditIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (filteredIds: string[]) => {
    soundFX.playClick();
    if (filteredIds.length > 0 && filteredIds.every((id) => selectedAuditIds.includes(id))) {
      setSelectedAuditIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedAuditIds(Array.from(new Set([...selectedAuditIds, ...filteredIds])));
    }
  };

  const handleArchiveSingleAudit = async (log: AuditLogEntry) => {
    soundFX.playClick();
    if (!onArchiveAuditLog) return;
    setIsProcessingAuditAction(true);
    await onArchiveAuditLog(log.id);
    setIsProcessingAuditAction(false);
    showNotice(`Audit record archived.`);
  };

  const handleUnarchiveSingleAudit = async (log: AuditLogEntry) => {
    soundFX.playClick();
    if (!onUnarchiveAuditLog) return;
    setIsProcessingAuditAction(true);
    await onUnarchiveAuditLog(log.id);
    setIsProcessingAuditAction(false);
    showNotice(`Audit record restored to active trail.`);
  };

  const handleConfirmFullDeleteSingle = async () => {
    if (!confirmDeleteAudit || !onDeleteAuditLog) return;
    soundFX.playPass();
    setIsProcessingAuditAction(true);
    await onDeleteAuditLog(confirmDeleteAudit.id);
    setIsProcessingAuditAction(false);
    setSelectedAuditIds((prev) => prev.filter((id) => id !== confirmDeleteAudit.id));
    showNotice(`Audit record permanently deleted.`);
    setConfirmDeleteAudit(null);
  };

  const handleBulkArchive = async () => {
    if (selectedAuditIds.length === 0 || !onBulkArchiveAuditLogs) return;
    soundFX.playClick();
    setIsProcessingAuditAction(true);
    await onBulkArchiveAuditLogs(selectedAuditIds);
    setIsProcessingAuditAction(false);
    showNotice(`${selectedAuditIds.length} audit records archived.`);
    setSelectedAuditIds([]);
  };

  const handleBulkRestore = async () => {
    if (selectedAuditIds.length === 0 || !onUnarchiveAuditLog) return;
    soundFX.playClick();
    setIsProcessingAuditAction(true);
    for (const id of selectedAuditIds) {
      await onUnarchiveAuditLog(id);
    }
    setIsProcessingAuditAction(false);
    showNotice(`${selectedAuditIds.length} audit records restored to active trail.`);
    setSelectedAuditIds([]);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedAuditIds.length === 0 || !onBulkDeleteAuditLogs) return;
    soundFX.playPass();
    setIsProcessingAuditAction(true);
    await onBulkDeleteAuditLogs(selectedAuditIds);
    setIsProcessingAuditAction(false);
    showNotice(`Permanently deleted ${selectedAuditIds.length} audit records.`);
    setSelectedAuditIds([]);
    setShowBulkDeleteModal(false);
  };

  // Teachers and students list
  const teachers = allUsers.filter((u): u is TeacherAccount => u.role === 'teacher');
  const students = allUsers.filter((u): u is StudentAccount => u.role === 'student');

  // Account Management computed lists & stats
  const totalSuspendedUsersCount = useMemo(() => {
    return allUsers.filter((u) => u.status === 'suspended').length;
  }, [allUsers]);

  const filteredAccounts = useMemo(() => {
    return allUsers.filter((user) => {
      // Role filter
      if (accountRoleFilter !== 'all' && user.role !== accountRoleFilter) return false;

      // Status filter
      if (accountStatusFilter !== 'all') {
        if (accountStatusFilter === 'approved' && user.status !== 'approved') return false;
        if (accountStatusFilter === 'suspended' && user.status !== 'suspended') return false;
        if (accountStatusFilter === 'pending' && user.status !== 'pending') return false;
        if (accountStatusFilter === 'rejected' && user.status !== 'rejected') return false;
      }

      // Search filter
      if (accountSearch.trim()) {
        const q = accountSearch.toLowerCase().trim();
        const name = (user.name || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        const email = (user.email || (user as any).depEdEmail || '').toLowerCase();
        const school = ((user as any).schoolName || '').toLowerCase();
        const lrn = ((user as any).lrn || (user as any).learnerId || '').toLowerCase();
        const empId = ((user as any).employeeId || '').toLowerCase();

        return (
          name.includes(q) ||
          username.includes(q) ||
          email.includes(q) ||
          school.includes(q) ||
          lrn.includes(q) ||
          empId.includes(q)
        );
      }

      return true;
    });
  }, [allUsers, accountRoleFilter, accountStatusFilter, accountSearch]);

  const getStudentsForTeacher = (classCode?: string) => {
    if (!classCode) return [];
    const clean = classCode.trim().toUpperCase();
    return students.filter((s) => s.classCode && s.classCode.toUpperCase() === clean);
  };

  // Compute school-wide / division aggregate stats for the 6 islands
  const adminIslandStats = useMemo(() => {
    // Filter students by selected criteria
    const filtered = students.filter((s) => {
      if (mapGradeFilter !== 'all' && s.gradeLevel !== mapGradeFilter) return false;
      if (mapSectionFilter !== 'all' && s.section !== mapSectionFilter) return false;
      if (mapTeacherFilter !== 'all' && s.teacherId !== mapTeacherFilter && s.classCode !== mapTeacherFilter) return false;
      return true;
    });

    const totalStudents = filtered.length || 1;

    // Helper to count completions and active learners per quarter
    const getQuarterStats = (qNum: number) => {
      const completedCount = filtered.filter((s) => {
        const comp = s.completedModules || [];
        return comp.some((id) => id.includes(`-q${qNum}-`));
      }).length;

      const completionRate = Math.round((completedCount / totalStudents) * 100);
      const assignedTeachers = teachers.filter((t: TeacherAccount) => {
        if (!t.gradeLevels || t.gradeLevels.length === 0) return true;
        return mapGradeFilter === 'all' || t.gradeLevels.includes(mapGradeFilter as GradeLevel);
      }).length;

      return { completedCount, completionRate, assignedTeachers };
    };

    const q1 = getQuarterStats(1);
    const q2 = getQuarterStats(2);
    const q3 = getQuarterStats(3);
    const q4 = getQuarterStats(4);
    const dinosaurActive = filtered.filter((s) => (s.points || 0) > 100).length;
    const writingActive = filtered.filter((s) => (s.writingSubmissions?.length || 0) > 0).length;

    // Distinct sections for dropdown
    const availableSections = Array.from(new Set(students.map((s) => s.section).filter(Boolean))) as string[];

    return {
      filteredCount: filtered.length,
      availableSections,
      customData: {
        'q1-san-victor': {
          badgeText: `${q1.completedCount} (${q1.completionRate}%)`,
          badgeType: (q1.completionRate >= 75 ? 'success' : q1.completionRate >= 50 ? 'warning' : 'default') as 'success' | 'warning' | 'default',
          statA: { label: 'Active Students', value: q1.completedCount },
          statB: { label: 'Completion Rate', value: `${q1.completionRate}%` },
          statC: { label: 'Teachers Assigned', value: q1.assignedTeachers },
        },
        'q2-oak': {
          badgeText: `${q2.completedCount} (${q2.completionRate}%)`,
          badgeType: (q2.completionRate >= 75 ? 'success' : q2.completionRate >= 50 ? 'warning' : 'default') as 'success' | 'warning' | 'default',
          statA: { label: 'Active Students', value: q2.completedCount },
          statB: { label: 'Completion Rate', value: `${q2.completionRate}%` },
          statC: { label: 'Teachers Assigned', value: q2.assignedTeachers },
        },
        'q3-waniban': {
          badgeText: `${q3.completedCount} (${q3.completionRate}%)`,
          badgeType: (q3.completionRate >= 75 ? 'success' : q3.completionRate >= 50 ? 'warning' : 'default') as 'success' | 'warning' | 'default',
          statA: { label: 'Active Students', value: q3.completedCount },
          statB: { label: 'Completion Rate', value: `${q3.completionRate}%` },
          statC: { label: 'Teachers Assigned', value: q3.assignedTeachers },
        },
        'q4-pujada': {
          badgeText: `${q4.completedCount} (${q4.completionRate}%)`,
          badgeType: (q4.completionRate >= 75 ? 'success' : q4.completionRate >= 50 ? 'warning' : 'default') as 'success' | 'warning' | 'default',
          statA: { label: 'Active Students', value: q4.completedCount },
          statB: { label: 'Completion Rate', value: `${q4.completionRate}%` },
          statC: { label: 'Teachers Assigned', value: q4.assignedTeachers },
        },
        'discovery-dinosaur': {
          badgeText: `${dinosaurActive} Active`,
          badgeType: 'info' as const,
          statA: { label: 'Participating Students', value: dinosaurActive },
          statB: { label: 'Engagement Rate', value: `${Math.round((dinosaurActive / totalStudents) * 100)}%` },
          statC: { label: 'Vocabulary & Writing', value: `${writingActive} Submissions` },
        },
      },
    };
  }, [students, teachers, mapGradeFilter, mapSectionFilter, mapTeacherFilter]);

  // Compute student stats & filtered list for Admin Student Monitor (Read-Only)
  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.isActive && s.status !== 'suspended').length;
  const suspendedStudentsCount = students.filter((s) => s.status === 'suspended').length;
  const inactiveStudentsCount = students.filter((s) => !s.isActive && s.status !== 'suspended').length;
  const totalBridgesRestored = students.reduce(
    (acc, st) =>
      acc + Object.values(st.progressByModule).filter((p) => p.isBridgeRestored).length,
    0
  );

  const allScores = students.flatMap((st) =>
    Object.values(st.progressByModule)
      .map((p) => p.bestScorePercent)
      .filter((s) => s > 0)
  );
  const divisionAvgQuizScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const totalWritingSubmissions = students.reduce(
    (acc, st) => acc + (st.writingSubmissions?.length || 0),
    0
  );

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // Grade filter
      if (studentGradeFilter !== 'all' && st.gradeLevel !== studentGradeFilter) {
        return false;
      }

      // Teacher / Classroom filter
      if (studentTeacherFilter !== 'all') {
        const matchedTeacher = teachers.find(
          (t) => t.id === studentTeacherFilter || t.classCode === studentTeacherFilter
        );
        if (matchedTeacher) {
          if (!st.classCode || st.classCode.toUpperCase() !== matchedTeacher.classCode?.toUpperCase()) {
            return false;
          }
        }
      }

      // Status filter
      if (studentStatusFilter === 'active' && (!st.isActive || st.status === 'suspended')) return false;
      if (studentStatusFilter === 'suspended' && st.status !== 'suspended') return false;
      if (studentStatusFilter === 'inactive' && st.isActive) return false;

      // Performance filter
      const bridgesCount = Object.values(st.progressByModule).filter((p) => p.isBridgeRestored).length;
      const stScores = Object.values(st.progressByModule)
        .map((p) => p.bestScorePercent)
        .filter((sc) => sc > 0);
      const stAvg =
        stScores.length > 0 ? Math.round(stScores.reduce((a, b) => a + b, 0) / stScores.length) : 0;

      if (studentPerformanceFilter === 'restored' && bridgesCount === 0) return false;
      if (studentPerformanceFilter === 'high_mastery' && stAvg < 75) return false;
      if (studentPerformanceFilter === 'needs_support' && (stAvg >= 75 || stScores.length === 0)) return false;

      // Search query
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matchesName = st.name?.toLowerCase().includes(q);
        const matchesLrn = (st.learnerId || '').toLowerCase().includes(q);
        const matchesUser = (st.username || '').toLowerCase().includes(q);
        const matchesSchool = (st.schoolName || '').toLowerCase().includes(q);
        const matchesSec = (st.section || '').toLowerCase().includes(q);
        const matchesCode = (st.classCode || '').toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesLrn &&
          !matchesUser &&
          !matchesSchool &&
          !matchesSec &&
          !matchesCode
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    students,
    studentGradeFilter,
    studentTeacherFilter,
    studentStatusFilter,
    studentPerformanceFilter,
    studentSearch,
    teachers,
  ]);

  // Class code review and approval modal states
  const [approvingTeacher, setApprovingTeacher] = useState<TeacherAccount | null>(null);
  const [approvalClassCodeInput, setApprovalClassCodeInput] = useState('');
  const [editingCodeTeacher, setEditingCodeTeacher] = useState<TeacherAccount | null>(null);
  const [editClassCodeInput, setEditClassCodeInput] = useState('');
  const [classCodeError, setClassCodeError] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const pendingCount = teachers.filter((t) => t.status === 'pending').length;
  const approvedCount = teachers.filter((t) => t.status === 'approved').length;
  const rejectedCount = teachers.filter((t) => t.status === 'rejected').length;
  const suspendedCount = teachers.filter((t) => t.status === 'suspended').length;

  const filteredTeachers = teachers.filter((t) => {
    if (teacherStatusFilter !== 'all' && t.status !== teacherStatusFilter) return false;
    if (teacherSearch.trim()) {
      const q = teacherSearch.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchEmp = t.employeeId.toLowerCase().includes(q);
      const matchEmail = (t.depEdEmail || '').toLowerCase().includes(q);
      const matchCode = (t.classCode || '').toLowerCase().includes(q);
      return matchName || matchEmp || matchEmail || matchCode;
    }
    return true;
  });

  // Handle Quick 1-Click Approve (activates the teacher's assigned class code)
  const handleApprove = async (teacher: TeacherAccount) => {
    soundFX.playPass();
    const codeToUse = teacher.classCode || generateUniqueClassCode(allUsers);
    const result = await onApproveTeacher(teacher.id, codeToUse);
    if (result.success) {
      showNotice(`Approved ${teacher.name}! Class code ${result.classCode} is now active.`);
    }
  };

  // Open modal to review / customize code before approving
  const openApproveModal = (teacher: TeacherAccount) => {
    soundFX.playClick();
    setApprovingTeacher(teacher);
    setApprovalClassCodeInput(teacher.classCode || generateUniqueClassCode(allUsers));
    setClassCodeError('');
  };

  const handleConfirmApproveWithCode = async () => {
    if (!approvingTeacher || !approvalClassCodeInput.trim()) return;
    const cleanCode = approvalClassCodeInput.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setClassCodeError('Class code must be at least 4 characters.');
      return;
    }
    const duplicate = teachers.some(
      (t) => t.id !== approvingTeacher.id && t.classCode?.toUpperCase() === cleanCode
    );
    if (duplicate) {
      setClassCodeError(`Class code ${cleanCode} is already assigned to another teacher.`);
      return;
    }

    soundFX.playPass();
    const result = await onApproveTeacher(approvingTeacher.id, cleanCode);
    if (result.success) {
      showNotice(`Approved ${approvingTeacher.name}! Activated class code: ${result.classCode}`);
      setApprovingTeacher(null);
    }
  };

  // Open modal to edit/reassign code for an approved teacher
  const openEditCodeModal = (teacher: TeacherAccount) => {
    soundFX.playClick();
    setEditingCodeTeacher(teacher);
    setEditClassCodeInput(teacher.classCode || generateUniqueClassCode(allUsers));
    setClassCodeError('');
  };

  const handleConfirmUpdateCode = async () => {
    if (!editingCodeTeacher || !editClassCodeInput.trim() || !onUpdateTeacherClassCode) return;
    const cleanCode = editClassCodeInput.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setClassCodeError('Class code must be at least 4 characters.');
      return;
    }
    const duplicate = teachers.some(
      (t) => t.id !== editingCodeTeacher.id && t.classCode?.toUpperCase() === cleanCode
    );
    if (duplicate) {
      setClassCodeError(`Class code ${cleanCode} is already assigned to another teacher.`);
      return;
    }

    soundFX.playPass();
    const res = await onUpdateTeacherClassCode(editingCodeTeacher.id, cleanCode);
    if (res.success) {
      showNotice(`Updated class code for ${editingCodeTeacher.name} to ${res.classCode}.`);
      setEditingCodeTeacher(null);
    } else {
      setClassCodeError(res.error || 'Failed to update class code.');
    }
  };

  // Open Reject Modal
  const openRejectModal = (teacher: TeacherAccount) => {
    soundFX.playClick();
    setRejectingTeacher(teacher);
    setRejectionReasonInput('Unverified DepEd employee record in Division roster.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingTeacher || !rejectionReasonInput.trim()) return;
    soundFX.playIncorrect();
    await onRejectTeacher(rejectingTeacher.id, rejectionReasonInput.trim());
    showNotice(`Application for ${rejectingTeacher.name} rejected.`);
    setRejectingTeacher(null);
  };

  // Open Suspend Modal
  const openSuspendModal = (user: UserAccount) => {
    soundFX.playClick();
    setSuspendingUser(user);
    const defaultReason =
      user.role === 'student'
        ? 'Account suspended pending academic compliance review.'
        : user.role === 'admin'
        ? 'Sub-administrator access suspended pending security compliance audit.'
        : 'Under routine compliance audit by Division Office.';
    setSuspensionReasonInput(defaultReason);
  };

  const handleConfirmSuspend = async () => {
    if (!suspendingUser || !suspensionReasonInput.trim()) return;
    soundFX.playIncorrect();
    await onSuspendUser(suspendingUser.id, suspensionReasonInput.trim());
    showNotice(`Account for ${suspendingUser.name} suspended.`);
    setSuspendingUser(null);
  };

  const handleReactivate = async (user: UserAccount) => {
    soundFX.playPass();
    await onReactivateUser(user.id);
    showNotice(`Account for ${user.name} restored to Approved & Active.`);
  };

  const openDeleteTeacherModal = (teacher: TeacherAccount) => {
    soundFX.playClick();
    setDeletingTeacher(teacher);
    setDeleteReasonInput(
      teacher.status === 'suspended'
        ? `Suspended account removed from division records. ${teacher.suspensionReason || ''}`.trim()
        : teacher.status === 'rejected'
        ? `Rejected application permanently deleted. ${teacher.rejectionReason || ''}`.trim()
        : 'Faculty account removed from division records upon administrative review.'
    );
  };

  const handleConfirmDeleteTeacher = async () => {
    if (!deletingTeacher) return;
    try {
      setIsDeletingTeacher(true);
      soundFX.playPass();
      if (onDeleteTeacher) {
        const success = await onDeleteTeacher(deletingTeacher.id, deleteReasonInput.trim());
        if (success) {
          showNotice(`Permanently deleted teacher account for ${deletingTeacher.name}.`);
          setDeletingTeacher(null);
        } else {
          showNotice('Failed to delete teacher account. Please try again.');
        }
      } else {
        showNotice(`Account for ${deletingTeacher.name} removed.`);
        setDeletingTeacher(null);
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      showNotice('An error occurred while deleting teacher account.');
    } finally {
      setIsDeletingTeacher(false);
    }
  };

  // Open Delete Student Modal
  const openDeleteStudentModal = (student: StudentAccount) => {
    soundFX.playClick();
    setDeletingStudent(student);
    setDeleteStudentReasonInput(
      student.status === 'suspended'
        ? `Suspended student account removed from division records. ${student.suspensionReason || ''}`.trim()
        : 'Student record removed from division roster upon administrative review.'
    );
  };

  const handleConfirmDeleteStudent = async () => {
    if (!deletingStudent) return;
    try {
      setIsDeletingStudent(true);
      soundFX.playPass();
      if (onDeleteStudent) {
        const success = await onDeleteStudent(deletingStudent.id, deleteStudentReasonInput.trim());
        if (success) {
          showNotice(`Permanently deleted learner account for ${deletingStudent.name}.`);
          setDeletingStudent(null);
        } else {
          showNotice('Failed to delete learner account. Please try again.');
        }
      } else {
        showNotice(`Account for ${deletingStudent.name} removed.`);
        setDeletingStudent(null);
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      showNotice('An error occurred while deleting learner account.');
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // Module Manager Handlers
  const openCreateModuleModal = () => {
    soundFX.playClick();
    setIsCreatingModule(true);
    setEditingModule(null);
    setFormTitle('New English Competency Module');
    setFormGrade(8);
    setFormQuarter(1);
    setFormModuleNumber(modules.length + 1);
    setFormIslandName('San Victor Island');
    setFormIslandColor('#0284C7');
    setFormPassingScore(75);
    setFormTopicType('grammar');
    setFormMelc('EN8G-Ib-1: Cohesive devices in discourse.');
    setFormOverview('Master cohesive transitions and connectors in standard written English.');
    setFormKeyRules('Use conjunctive adverbs to link related sentences.\nMaintain semantic coherence.');
    setFormCulturalConnection('Exploration of historical Davao Oriental lighthouses.');
    setFormQuizQuestions([
      {
        id: `q-${Date.now()}-1`,
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: 'Identify the transition word that signals an addition of thought.',
        options: ['Furthermore', 'However', 'Therefore', 'Consequently'],
        answer: 'Furthermore',
        explanation: '"Furthermore" introduces complementary or additional supporting details.',
        timeLimitSeconds: 30,
      },
      {
        id: `q-${Date.now()}-2`,
        type: 'missingPiece',
        difficulty: 'moderate',
        prompt: 'Choose the correct cohesive device: "The storm was fierce; _____, the lighthouse beacon remained lit."',
        options: ['nevertheless', 'similarly', 'because', 'namely'],
        answer: 'nevertheless',
        explanation: '"Nevertheless" shows contrast between the fierce storm and the steadfast beacon.',
        timeLimitSeconds: 25,
      },
    ]);
  };

  const openEditModuleModal = (mod: Module) => {
    soundFX.playClick();
    setEditingModule(mod);
    setIsCreatingModule(false);
    setFormTitle(mod.title);
    setFormGrade(mod.gradeLevel);
    setFormQuarter(mod.quarter);
    setFormModuleNumber(mod.moduleNumber);
    setFormIslandName(mod.islandName);
    setFormIslandColor(mod.islandThemeColor);
    setFormPassingScore(mod.requiredPassingScore);
    setFormTopicType(mod.topicType);
    setFormMelc(mod.lessonContent.melcCompetency);
    setFormOverview(mod.lessonContent.overview);
    setFormKeyRules(mod.lessonContent.keyRules.join('\n'));
    setFormCulturalConnection(mod.lessonContent.culturalConnection);
    setFormQuizQuestions([...mod.quizQuestions]);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const modulePayload: Module = {
      id: editingModule ? editingModule.id : `g${formGrade}-q${formQuarter}-m${formModuleNumber}`,
      gradeLevel: formGrade,
      quarter: formQuarter,
      moduleNumber: formModuleNumber,
      quarterModuleIndex: (((formModuleNumber - 1) % 4) + 1) as 1 | 2 | 3 | 4,
      islandName: formIslandName.trim() || 'LingoQuest Island',
      islandThemeColor: formIslandColor,
      title: formTitle.trim(),
      topicType: formTopicType as any,
      requiredPassingScore: formPassingScore,
      lessonContent: {
        overview: formOverview.trim() || 'Comprehensive competency lesson content.',
        melcCompetency: formMelc.trim(),
        keyRules: formKeyRules
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
        examples: editingModule?.lessonContent?.examples || [],
        culturalConnection: '',
        warmupQuestion: { question: '', options: [], correctAnswer: '', feedback: '' },
        writingPrompt: { title: '', instructions: '', sampleStarter: '' },
      },
      quizQuestions: formQuizQuestions.length > 0 ? formQuizQuestions : editingModule?.quizQuestions || [],
    };

    if (editingModule) {
      soundFX.playPass();
      await onUpdateModule(modulePayload);
      showNotice(`Successfully updated module "${modulePayload.title}"!`);
      setEditingModule(null);
    } else {
      soundFX.playPass();
      await onCreateModule(modulePayload);
      showNotice(`Created new curriculum module "${modulePayload.title}"!`);
      setIsCreatingModule(false);
    }
  };

  const handleConfirmDeleteModule = async () => {
    if (!deletingModule) return;
    soundFX.playIncorrect();
    await onDeleteModule(deletingModule.id, deletingModule.title);
    showNotice(`Deleted module "${deletingModule.title}".`);
    setDeletingModule(null);
  };

  // Sub-Admin Management Handlers
  const handleSaveNewSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMainAdmin) {
      setSubAdminFormError('Security Restriction: Only the Main Administrator has the authority to add sub-administrators.');
      return;
    }
    if (!subAdminName.trim() || !subAdminUsername.trim() || !subAdminEmail.trim() || !subAdminEmployeeId.trim()) {
      setSubAdminFormError('Please fill in all required fields (Full Name, DepEd Email, Username, Employee ID).');
      return;
    }

    setIsSubmittingSubAdmin(true);
    setSubAdminFormError(null);

    try {
      if (onAddSubAdmin) {
        const res = await onAddSubAdmin({
          name: subAdminName.trim(),
          email: subAdminEmail.trim(),
          username: subAdminUsername.trim(),
          password: subAdminPassword || 'subadmin123',
          adminTitle: subAdminTitle.trim(),
          employeeId: subAdminEmployeeId.trim(),
        });

        if (!res.success) {
          setSubAdminFormError(res.error || 'Failed to create sub-administrator.');
          setIsSubmittingSubAdmin(false);
          return;
        }
      }

      soundFX.playCorrect();
      showNotice(`Added sub-administrator ${subAdminName.trim()} with delegated permissions.`);
      setShowAddSubAdminModal(false);
    } catch (err: any) {
      setSubAdminFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmittingSubAdmin(false);
    }
  };

  const handleSaveEditSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubAdmin || !isMainAdmin) return;

    setIsSubmittingEdit(true);
    setEditAdminError(null);

    try {
      if (onUpdateSubAdmin) {
        const res = await onUpdateSubAdmin(editingSubAdmin.id, {
          adminTitle: editAdminTitle.trim(),
          email: editAdminEmail.trim(),
          isActive: editAdminIsActive,
          ...(editAdminPassword.trim() ? { password: editAdminPassword.trim() } : {}),
        });

        if (!res.success) {
          setEditAdminError(res.error || 'Failed to update sub-administrator.');
          setIsSubmittingEdit(false);
          return;
        }
      }

      soundFX.playCorrect();
      showNotice(`Updated sub-administrator ${editingSubAdmin.name}.`);
      setEditingSubAdmin(null);
    } catch (err: any) {
      setEditAdminError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleConfirmDeleteSubAdmin = async () => {
    if (!deletingSubAdmin || !isMainAdmin) return;
    setIsDeletingSubAdmin(true);

    try {
      if (onDeleteSubAdmin) {
        const res = await onDeleteSubAdmin(deletingSubAdmin.id, deleteSubAdminReason.trim() || undefined);
        if (!res.success) {
          alert(res.error || 'Failed to remove sub-administrator.');
          setIsDeletingSubAdmin(false);
          return;
        }
      }

      soundFX.playCorrect();
      showNotice(`Removed sub-administrator ${deletingSubAdmin.name}.`);
      setDeletingSubAdmin(null);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsDeletingSubAdmin(false);
    }
  };

  // Filter modules
  const filteredModules = modules.filter((m) => {
    if (gradeFilter !== 'all' && m.gradeLevel !== gradeFilter) return false;
    if (quarterFilter !== 'all' && m.quarter !== quarterFilter) return false;
    if (moduleSearch.trim()) {
      const q = moduleSearch.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.islandName.toLowerCase().includes(q) ||
        m.lessonContent.melcCompetency.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Compute audit log counts
  const activeAuditCount = useMemo(() => auditLogs.filter((l) => !l.isArchived).length, [auditLogs]);
  const archivedAuditCount = useMemo(() => auditLogs.filter((l) => Boolean(l.isArchived)).length, [auditLogs]);

  // Filter audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Archive mode filter
      if (auditViewMode === 'active' && log.isArchived) return false;
      if (auditViewMode === 'archived' && !log.isArchived) return false;

      // Action filter
      if (auditFilter !== 'all' && log.actionType !== auditFilter) return false;

      // Search filter
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        return (
          log.adminName.toLowerCase().includes(q) ||
          log.targetName.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.actionType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, auditViewMode, auditFilter, auditSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1E36] text-white border border-sky-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-bold">{actionNotice}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] rounded-3xl text-white relative overflow-hidden border-2 border-[#231F20] linocut-card animate-dashboard-hero">
        <InabelHeaderStrip variant="amber" label="DepEd Davao Oriental • Executive Division Governance" />
        <div className="p-6 sm:p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isMainAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  Division Main Administrator (Executive Control)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-400 text-slate-950 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Division Sub-Administrator (Delegated Access)
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-sky-200 border border-white/20">
                DepEd Davao Oriental
              </span>
              {totalSuspendedUsersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab('ACCOUNT_MANAGEMENT');
                    setAccountStatusFilter('suspended');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm hover:bg-amber-300 transition cursor-pointer"
                  title="View accounts currently suspended"
                >
                  <AlertTriangle className="w-3.5 h-3.5 fill-slate-950" />
                  {totalSuspendedUsersCount} Suspended Account{totalSuspendedUsersCount === 1 ? '' : 's'}
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">
              LingoQuest Governance & Faculty Oversight
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              DepEd Davao Oriental Division • {isMainAdmin ? 'Executive Administrator' : 'Sub-Administrator'}:{' '}
              <strong>{currentAdmin.name}</strong> ({currentAdmin.adminTitle || currentAdmin.employeeId})
              {!isMainAdmin && (
                <span className="block mt-1 text-sky-200 text-xs font-medium">
                  Delegated Access: Teacher applications & approvals, curriculum module/quiz editing, and student progress records.
                  Sub-administrators do not have rights to add or modify administrator accounts.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('ACCOUNT_MANAGEMENT');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              title="Open full accounts directory to suspend or permanently remove accounts"
            >
              <UserX className="w-4 h-4" /> Suspend & Remove Accounts
            </button>
            {onPreviewAsStudent && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onPreviewAsStudent();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-sky-300" /> Preview Islands Map (Grades 7–10)
              </button>
            )}
            <button
              onClick={() => {
                soundFX.playClick();
                onRefreshData();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('ACCOUNT_MANAGEMENT');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'ACCOUNT_MANAGEMENT'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Accounts (Suspend & Remove)
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {allUsers.length}
            </span>
            {totalSuspendedUsersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {totalSuspendedUsersCount} Suspended
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('APPROVAL_QUEUE');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'APPROVAL_QUEUE'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Teacher Approval Queue
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('STUDENT_ROSTER');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'STUDENT_ROSTER'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Learner Progress & Rosters
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('MODULE_MANAGER');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'MODULE_MANAGER'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Module Manager (Admins Only)
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {modules.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('CURRICULUM_ANALYTICS');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'CURRICULUM_ANALYTICS'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Curriculum Bottlenecks &amp; Analytics
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              Visual Chart
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('ARCHIPELAGO_MAP');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'ARCHIPELAGO_MAP'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Compass className="w-4 h-4" />
            Division Archipelago Map
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('SUB_ADMINS');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'SUB_ADMINS'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Shield className="w-4 h-4" />
            Division Administrators & Sub-Admins
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {allAdmins.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('AUDIT_LOG');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'AUDIT_LOG'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            Admin Audit Trail
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('FEEDBACK_CONSOLE');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeTab === 'FEEDBACK_CONSOLE'
                ? 'bg-sky-400 text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Feedback &amp; Bug Reports
            {feedbackItems.filter((f) => f.status === 'open').length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {feedbackItems.filter((f) => f.status === 'open').length} Open
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
                {feedbackItems.length}
              </span>
            )}
          </button>
        </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 0: UNIFIED ACCOUNT MANAGEMENT (SUSPEND & REMOVE ACCOUNTS) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'ACCOUNT_MANAGEMENT' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Executive Header Banner */}
          <div className="bg-gradient-to-r from-[#07172C] via-[#0F3460] to-[#1E3E62] text-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
            <InabelHeaderStrip variant="royal" label="User Accounts Directory & Division Security" />
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-400/30">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <h2 className="text-xl font-display font-black">
                  User Accounts Directory & Governance
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Division Control
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Centralized administration to search, inspect, <strong>suspend</strong>, <strong>unlock</strong>, or <strong>permanently remove</strong> accounts across DepEd Davao Oriental. Actions revoke login access and record permanent audit trail entries.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              {totalSuspendedUsersCount > 0 ? (
                <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{totalSuspendedUsersCount} account{totalSuspendedUsersCount === 1 ? '' : 's'} suspended</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All accounts active</span>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div
              onClick={() => {
                soundFX.playClick();
                setAccountRoleFilter('all');
                setAccountStatusFilter('all');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                accountRoleFilter === 'all' && accountStatusFilter === 'all'
                  ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>All Accounts</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black font-display text-slate-900 mt-2">
                {allUsers.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Total database users</div>
            </div>

            <div
              onClick={() => {
                soundFX.playClick();
                setAccountRoleFilter('teacher');
                setAccountStatusFilter('all');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                accountRoleFilter === 'teacher'
                  ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>Faculty Members</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black font-display text-emerald-700 mt-2">
                {teachers.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">English teachers</div>
            </div>

            <div
              onClick={() => {
                soundFX.playClick();
                setAccountRoleFilter('student');
                setAccountStatusFilter('all');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                accountRoleFilter === 'student'
                  ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
                <span>Learners</span>
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black font-display text-blue-700 mt-2">
                {students.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Grades 7–10</div>
            </div>

            <div
              onClick={() => {
                soundFX.playClick();
                setAccountRoleFilter('admin');
                setAccountStatusFilter('all');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                accountRoleFilter === 'admin'
                  ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-indigo-700 font-bold">
                <span>Administrators</span>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black font-display text-indigo-700 mt-2">
                {allAdmins.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Division governance</div>
            </div>

            <div
              onClick={() => {
                soundFX.playClick();
                setAccountStatusFilter('suspended');
                setAccountRoleFilter('all');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition col-span-2 sm:col-span-1 ${
                accountStatusFilter === 'suspended'
                  ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
                <span>Suspended</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-display text-amber-800 mt-2">
                {totalSuspendedUsersCount}
              </div>
              <div className="text-[10px] text-amber-700 mt-1">Access locked</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accounts by name, @username, DepEd email, LRN, employee ID, or school..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                />
                {accountSearch && (
                  <button
                    onClick={() => setAccountSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Counter Pill */}
              <div className="text-xs font-bold text-slate-500 shrink-0 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Showing <strong>{filteredAccounts.length}</strong> of {allUsers.length}</span>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {/* Role Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Role:
                </span>
                {(
                  [
                    { id: 'all', label: 'All Roles' },
                    { id: 'teacher', label: 'Faculty' },
                    { id: 'student', label: 'Learners' },
                    { id: 'admin', label: 'Administrators' },
                  ] as const
                ).map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => {
                      soundFX.playClick();
                      setAccountRoleFilter(rf.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      accountRoleFilter === rf.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <ListFilter className="w-3 h-3" /> Status:
                </span>
                {(
                  [
                    { id: 'all', label: 'All Statuses' },
                    { id: 'approved', label: 'Active / Approved' },
                    { id: 'suspended', label: 'Suspended' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'rejected', label: 'Rejected' },
                  ] as const
                ).map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => {
                      soundFX.playClick();
                      setAccountStatusFilter(sf.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      accountStatusFilter === sf.id
                        ? sf.id === 'suspended'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sf.label}
                    {sf.id === 'suspended' && totalSuspendedUsersCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                        {totalSuspendedUsersCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accounts List / Table */}
          {filteredAccounts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching accounts found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No user accounts matched your current search query or filter combination.
              </p>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setAccountRoleFilter('all');
                  setAccountStatusFilter('all');
                  setAccountSearch('');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Account Holder</th>
                      <th className="py-3.5 px-3">Role & Placement</th>
                      <th className="py-3.5 px-3">DepEd Identifier</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Account Governance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map((user) => {
                      const isTargetMain =
                        user.role === 'admin' &&
                        (user.id === mainAdmin.id ||
                          (user as AdminAccount).isMainAdmin ||
                          (user as AdminAccount).adminLevel === 'main');
                      const isSuspended = user.status === 'suspended';

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50/60 transition ${
                            isSuspended ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          {/* Column 1: Account Holder */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                                  user.role === 'admin'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : user.role === 'teacher'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                                }`}
                              >
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                  <span>{user.name}</span>
                                  {isTargetMain && (
                                    <span className="p-0.5 rounded bg-amber-400 text-slate-950" title="Primary Main Administrator">
                                      <Crown className="w-3 h-3 fill-slate-950 text-slate-950" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                                  <span>@{user.username}</span>
                                  {(user as any).schoolName && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[180px]">{(user as any).schoolName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Role & Placement */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              {user.role === 'teacher' ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <UserCheck className="w-3 h-3" /> Faculty
                                  </span>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    Code: {(user as TeacherAccount).classCode}
                                  </div>
                                </>
                              ) : user.role === 'student' ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    <GraduationCap className="w-3 h-3" /> Grade {(user as StudentAccount).gradeLevel}
                                  </span>
                                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                                    {(user as StudentAccount).section ? `Sec: ${(user as StudentAccount).section}` : 'General Enrollment'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      isTargetMain
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    }`}
                                  >
                                    <Shield className="w-3 h-3" />
                                    {isTargetMain ? 'Main Administrator' : 'Sub-Administrator'}
                                  </span>
                                  <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                    {(user as AdminAccount).adminTitle || 'Division Admin'}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Column 3: DepEd Identifier & Email */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <div className="font-mono text-[11px] text-slate-700 font-semibold">
                                {user.role === 'student'
                                  ? `LRN: ${(user as StudentAccount).lrn || (user as StudentAccount).learnerId || 'N/A'}`
                                  : `EMP: ${(user as any).employeeId || 'N/A'}`}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {user.email || (user as any).depEdEmail || 'No email specified'}
                              </div>
                            </div>
                          </td>

                          {/* Column 4: Status */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              {isSuspended ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                  <ShieldAlert className="w-3 h-3 text-amber-600" /> Suspended
                                </span>
                              ) : user.status === 'approved' || (user.isActive && user.status !== 'pending' && user.status !== 'rejected') ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                                </span>
                              ) : user.status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                  <Clock className="w-3 h-3 text-sky-600" /> Pending Approval
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                                </span>
                              )}

                              {isSuspended && user.suspensionReason && (
                                <div className="text-[10px] text-amber-800 bg-amber-100/70 p-1.5 rounded-lg border border-amber-200 max-w-[220px] leading-tight">
                                  <strong>Reason:</strong> {user.suspensionReason}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Column 5: Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {isTargetMain ? (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 inline-flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-600" /> Protected Primary
                                </span>
                              ) : (
                                <>
                                  {/* Suspend or Reactivate */}
                                  {isSuspended || !user.isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleReactivate(user)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                                      title="Reactivate and unlock this account"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>Reactivate</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openSuspendModal(user)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition cursor-pointer"
                                      title="Suspend account access and lock login"
                                    >
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Suspend</span>
                                    </button>
                                  )}

                                  {/* Remove Account */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundFX.playClick();
                                      if (user.role === 'teacher') {
                                        openDeleteTeacherModal(user as TeacherAccount);
                                      } else if (user.role === 'student') {
                                        openDeleteStudentModal(user as StudentAccount);
                                      } else if (user.role === 'admin') {
                                        if (isMainAdmin) {
                                          setDeletingSubAdmin(user as AdminAccount);
                                          setDeleteSubAdminReason('');
                                        } else {
                                          showNotice('Only the Main Administrator can remove administrator accounts.');
                                        }
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                                    title="Permanently remove account from division database"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Remove</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 1: TEACHER APPROVAL QUEUE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'APPROVAL_QUEUE' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setTeacherStatusFilter('pending')}
              className={`p-5 rounded-2xl border cursor-pointer transition ${
                teacherStatusFilter === 'pending'
                  ? 'bg-amber-50 border-amber-400 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-display text-amber-600 mt-2">{pendingCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awaiting credential check</div>
            </div>

            <div
              onClick={() => setTeacherStatusFilter('approved')}
              className={`p-5 rounded-2xl border cursor-pointer transition ${
                teacherStatusFilter === 'approved'
                  ? 'bg-emerald-50 border-emerald-400 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Approved Faculty</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black font-display text-emerald-600 mt-2">{approvedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">With active class codes</div>
            </div>

            <div
              onClick={() => setTeacherStatusFilter('suspended')}
              className={`p-5 rounded-2xl border cursor-pointer transition ${
                teacherStatusFilter === 'suspended'
                  ? 'bg-amber-50 border-amber-400 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Suspended</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-display text-amber-700 mt-2">{suspendedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Temporarily locked</div>
            </div>

            <div
              onClick={() => setTeacherStatusFilter('rejected')}
              className={`p-5 rounded-2xl border cursor-pointer transition ${
                teacherStatusFilter === 'rejected'
                  ? 'bg-rose-50 border-rose-400 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Rejected</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black font-display text-rose-600 mt-2">{rejectedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Declined applications</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teacher, employee ID, class code..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {(['all', 'pending', 'approved', 'suspended', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    soundFX.playClick();
                    setTeacherStatusFilter(st);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    teacherStatusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Cards / Table */}
          {filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No teachers found</h3>
              <p className="text-xs text-slate-400">
                No faculty members match the selected filter ({teacherStatusFilter}).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-200 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            teacher.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : teacher.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : teacher.status === 'suspended'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{teacher.department}</div>
                    </div>

                    {teacher.status === 'pending' ? (
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
                          Assigned Class Code
                        </span>
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 inline-block">
                          {teacher.classCode || 'LQ-ENG-ASSIGNED'}
                        </span>
                        <span className="text-[9.5px] text-amber-600 block mt-0.5 font-medium">Pending Admin Activation</span>
                      </div>
                    ) : teacher.classCode ? (
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Active Class Code
                        </span>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            {teacher.classCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              navigator.clipboard.writeText(teacher.classCode);
                              setCopiedCodeId(teacher.id);
                              setTimeout(() => setCopiedCodeId(null), 2000);
                            }}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Copy class code"
                          >
                            {copiedCodeId === teacher.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          {getStudentsForTeacher(teacher.classCode).length} Enrolled Students
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Employee ID:</span>
                      <strong className="text-slate-700 font-mono">{teacher.employeeId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">DepEd Email:</span>
                      <span className="text-slate-700 truncate block">{teacher.depEdEmail || teacher.username}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Username:</span>
                      <span className="text-slate-700">{teacher.username}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Joined Date:</span>
                      <span className="text-slate-700">{teacher.joinedDate}</span>
                    </div>
                  </div>

                  {/* Rejection / Suspension Notice */}
                  {teacher.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      <strong>Rejection Reason:</strong> {teacher.rejectionReason}
                    </div>
                  )}
                  {teacher.suspensionReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      <strong>Suspension Notice:</strong> {teacher.suspensionReason}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {teacher.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(teacher)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                          title="Approve immediately and activate assigned class code"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Activate Code
                        </button>
                        <button
                          onClick={() => openApproveModal(teacher)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs transition cursor-pointer"
                          title="Customize or generate a new class code before approval"
                        >
                          <Key className="w-3.5 h-3.5" /> Review Code
                        </button>
                        <button
                          onClick={() => openRejectModal(teacher)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => openSuspendModal(teacher)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs transition cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" /> Suspend
                        </button>
                      </>
                    )}

                    {teacher.status === 'approved' && (
                      <>
                        <button
                          onClick={() => openEditCodeModal(teacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition cursor-pointer"
                          title="Reassign or edit teacher's class code"
                        >
                          <Key className="w-3.5 h-3.5" /> Reassign Code
                        </button>
                        <button
                          onClick={() => openSuspendModal(teacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs transition cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Suspend Faculty
                        </button>
                        <button
                          onClick={() => openDeleteTeacherModal(teacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                          title="Permanently remove faculty account from division database"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Account
                        </button>
                      </>
                    )}

                    {(teacher.status === 'rejected' || teacher.status === 'suspended') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReactivate(teacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reactivate & Approve
                        </button>
                        <button
                          onClick={() => openDeleteTeacherModal(teacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                          title={`Permanently delete ${teacher.status} teacher account`}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Account
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: STUDENT ROSTER & PROGRESS MONITOR (Admins Read-Only) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'STUDENT_ROSTER' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Governance Notice Banner */}
          <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white p-5 rounded-3xl border border-sky-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
                <ShieldCheck className="w-6 h-6 text-slate-950" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-400 text-slate-950">
                    Division Admin Learner Governance
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Account Suspension & Removal Enabled
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  DepEd Davao Oriental Learner Academic Progress & Roster Governance
                </h3>
                <p className="text-xs text-sky-200 leading-relaxed max-w-3xl">
                  Division administrators have comprehensive oversight of all learner progress, quiz scores, restored bridges, and AI writing submissions across Grades 7 to 10. You can inspect learner competencies, preview curriculum maps, and suspend or permanently remove learner accounts when necessary with full audit trail logging.
                </p>
              </div>
            </div>

            {onPreviewAsStudent && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onPreviewAsStudent(studentGradeFilter !== 'all' ? studentGradeFilter : undefined);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap self-start md:self-auto shadow-md"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>Open Island Map Preview</span>
              </button>
            )}
          </div>

          {/* Division Summary Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Total Learners</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {totalStudentsCount}
              </div>
              <div className="text-[11px] text-slate-500">
                Enrolled across division
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Active Status</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-display">
                {activeStudentsCount}
              </div>
              <div className="text-[11px] text-slate-500">
                {inactiveStudentsCount} deactivated accounts
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Bridges Restored</span>
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 font-display">
                {totalBridgesRestored}
              </div>
              <div className="text-[11px] text-slate-500">
                Total bridges rebuilt
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Quiz Mastery</span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-600 font-display">
                {divisionAvgQuizScore > 0 ? `${divisionAvgQuizScore}%` : '—'}
              </div>
              <div className="text-[11px] text-slate-500">
                Division average score
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Writing Essays</span>
                <Feather className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-indigo-600 font-display">
                {totalWritingSubmissions}
              </div>
              <div className="text-[11px] text-slate-500">
                AI evaluated submissions
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by learner name, 12-digit LRN, username, school, section, or teacher code..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 placeholder:text-slate-400"
                />
                {studentSearch && (
                  <button
                    onClick={() => setStudentSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Teacher / Classroom Selector */}
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Classroom / Teacher:</span>
                <select
                  value={studentTeacherFilter}
                  onChange={(e) => setStudentTeacherFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Classrooms ({teachers.length} Teachers)</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} • {t.classCode || 'No Code'}{t.gradeLevels && t.gradeLevels.length > 0 ? ` (Grades ${t.gradeLevels.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Grade:
                </span>
                {(['all', 7, 8, 9, 10] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      soundFX.playClick();
                      setStudentGradeFilter(g);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      studentGradeFilter === g
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {g === 'all' ? 'All Secondary (7–10)' : `Grade ${g}`}
                  </button>
                ))}

                <span className="font-bold text-slate-500 mx-1">|</span>

                <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
                </span>
                {(
                  [
                    { id: 'all', label: 'All Accounts' },
                    { id: 'active', label: 'Active' },
                    { id: 'suspended', label: 'Suspended' },
                    { id: 'inactive', label: 'Deactivated' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      soundFX.playClick();
                      setStudentStatusFilter(st.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      studentStatusFilter === st.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}

                <span className="font-bold text-slate-500 mx-1">|</span>

                <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Performance:
                </span>
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'restored', label: 'With Restored Bridges' },
                    { id: 'high_mastery', label: 'Mastery ≥ 75%' },
                    { id: 'needs_support', label: 'Needs Support < 75%' },
                  ] as const
                ).map((pf) => (
                  <button
                    key={pf.id}
                    onClick={() => {
                      soundFX.playClick();
                      setStudentPerformanceFilter(pf.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      studentPerformanceFilter === pf.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {pf.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
                <strong>{students.length}</strong> learners
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No students match current filters</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search query or adjusting the grade and status filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStudentSearch('');
                  setStudentGradeFilter('all');
                  setStudentTeacherFilter('all');
                  setStudentStatusFilter('all');
                  setStudentPerformanceFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/70">
                      <th className="py-3 px-4">Student & LRN</th>
                      <th className="py-3 px-3">Grade & Section</th>
                      <th className="py-3 px-3">Assigned Teacher & Code</th>
                      <th className="py-3 px-3">Bridges Restored</th>
                      <th className="py-3 px-3">Quiz Average</th>
                      <th className="py-3 px-3">Writing AI</th>
                      <th className="py-3 px-3">Points</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Progress Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.map((st) => {
                      const scores = Object.values(st.progressByModule)
                        .map((p) => p.bestScorePercent)
                        .filter((sc) => sc > 0);
                      const avg =
                        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                      const bridgesCount = Object.values(st.progressByModule).filter(
                        (p) => p.isBridgeRestored
                      ).length;
                      const matchedTeacher = teachers.find(
                        (t) =>
                          t.classCode &&
                          st.classCode &&
                          t.classCode.toUpperCase() === st.classCode.toUpperCase()
                      );

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">{st.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              LRN: {st.learnerId} • @{st.username}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-800 block">Grade {st.gradeLevel}</span>
                            <span className="text-slate-400 text-[11px] block truncate max-w-[150px]" title={st.schoolName || st.section}>
                              {st.schoolName || (st.section ? `Sec: ${st.section}` : 'DepEd Davao Oriental')}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800 text-xs">
                              {matchedTeacher?.name || 'Classroom Assigned'}
                            </div>
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                              {st.classCode || 'No Code'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {bridgesCount} Restored
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono">
                            {avg > 0 ? (
                              <span
                                className={
                                  avg >= 75 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'
                                }
                              >
                                {avg}%
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="text-slate-700 font-medium">
                              {st.writingSubmissions?.length || 0} essays
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold text-amber-600">
                            {st.points.toLocaleString()} pts
                          </td>

                          <td className="py-3.5 px-3">
                            {st.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                <ShieldAlert className="w-3 h-3 text-amber-600" /> Suspended
                              </span>
                            ) : st.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                Deactivated
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Analytics Drilldown */}
                              <button
                                type="button"
                                onClick={() => {
                                  soundFX.playClick();
                                  setSelectedStudentForDrillDown(st);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer border border-indigo-200 shadow-2xs"
                                title="View detailed learner performance analytics"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Progress</span>
                              </button>

                              {/* Preview Grade Island Map */}
                              {onPreviewAsStudent && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFX.playClick();
                                    onPreviewAsStudent(st.gradeLevel);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs transition cursor-pointer border border-sky-200"
                                  title={`Preview Grade ${st.gradeLevel} island map`}
                                >
                                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Map</span>
                                </button>
                              )}

                              {/* Administrative Suspend / Reactivate */}
                              {st.status === 'suspended' || !st.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleReactivate(st)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer border border-emerald-200"
                                  title="Reactivate learner account"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Reactivate</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openSuspendModal(st)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition cursor-pointer border border-amber-200"
                                  title="Suspend learner account"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>Suspend</span>
                                </button>
                              )}

                              {/* Administrative Remove Student */}
                              <button
                                type="button"
                                onClick={() => openDeleteStudentModal(st)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer border border-rose-200"
                                title="Permanently remove learner account from division database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: MODULE MANAGER & QUIZZES WITH ANSWERS (Admins Only) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'MODULE_MANAGER' && (
        <div className="space-y-4 animate-dashboard-panel">
          {onPreviewAsStudent && (
            <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-4 sm:p-5 rounded-3xl border border-sky-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
                  <Compass className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">
                    Learner Island Map Archipelago Preview
                  </h3>
                  <p className="text-xs text-slate-200">
                    Switch between all Grade Levels (7, 8, 9, 10) in learner preview mode to inspect broken bridges, lessons, and interactive quiz sessions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onPreviewAsStudent();
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap self-start sm:self-auto shadow-md"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>Open Island Map Preview (Grades 7–10)</span>
              </button>
            </div>
          )}
          <ComprehensiveCurriculumView
            modules={modules}
            userRole="admin"
            onPreviewIslandMap={onPreviewAsStudent}
          />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: DIVISION ADMINISTRATORS & SUB-ADMINS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'SUB_ADMINS' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Access Governance Banner */}
          <div
            className={`p-6 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 text-white ${
              isMainAdmin
                ? 'bg-gradient-to-r from-[#0A1A2F] via-[#102A4C] to-[#1C3E68] border-amber-400/40'
                : 'bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 border-sky-400/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-md ${
                  isMainAdmin ? 'bg-amber-400 text-slate-950' : 'bg-sky-400 text-slate-950'
                }`}
              >
                {isMainAdmin ? (
                  <Crown className="w-6 h-6 fill-slate-950 text-slate-950" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-slate-950" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      isMainAdmin ? 'bg-amber-400 text-slate-950' : 'bg-sky-400 text-slate-950'
                    }`}
                  >
                    {isMainAdmin ? 'Executive Main Administrator Console' : 'Delegated Sub-Administrator Mode'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 border border-white/20">
                    DepEd Davao Oriental Governance Policy
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  Division Administrator Roster & Delegated Control Management
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {isMainAdmin
                    ? 'As the Main Administrator, you have full executive authority to add and manage Sub-Administrators. Sub-administrators can evaluate and approve teachers, modify curriculum modules & quizzes, and review student progress records. In compliance with division policy, sub-administrators cannot create, modify, or remove other administrator accounts.'
                    : `You are logged in as a Sub-Administrator with delegated operational permissions (Teacher Verification, Curriculum Module & Quiz Management, and Student Progress Monitoring). In accordance with Division Security Governance, you do not have permission to add, modify, or remove administrator accounts. Only the Main Administrator (${mainAdmin?.name || 'Department of Education Davao Oriental'}) can manage administrator credentials.`}
                </p>
              </div>
            </div>

            {isMainAdmin && onAddSubAdmin && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSubAdminFormError(null);
                  setSubAdminName('');
                  setSubAdminEmail('');
                  setSubAdminUsername('');
                  setSubAdminPassword('subadmin123');
                  setSubAdminTitle('Assistant Curriculum Coordinator');
                  setSubAdminEmployeeId(`DEPED-DO-SUB-${Math.floor(1000 + Math.random() * 9000)}`);
                  setShowAddSubAdminModal(true);
                }}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap self-start md:self-auto shadow-md"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>Add New Sub-Admin</span>
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Total Administrators</span>
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {allAdmins.length}
              </div>
              <div className="text-[11px] text-slate-500">Division admin accounts</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Main Administrator</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 font-display">
                1
              </div>
              <div className="text-[11px] text-slate-500">Executive authority</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Sub-Administrators</span>
                <UserCheck className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-sky-600 font-display">
                {allAdmins.filter((a) => !a.isMainAdmin && a.id !== 'admin-deped-davao-oriental' && a.id !== 'admin-elena-reyes').length}
              </div>
              <div className="text-[11px] text-slate-500">Delegated operational roles</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Active Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-display">
                {allAdmins.filter((a) => a.isActive).length}
              </div>
              <div className="text-[11px] text-slate-500">Operational accounts</div>
            </div>
          </div>

          {/* Administrators Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  DepEd Division Administrators
                </h4>
                <p className="text-xs text-slate-500">
                  Roster of main administrators and sub-administrators with delegated operational controls.
                </p>
              </div>
              {isMainAdmin && onAddSubAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSubAdminFormError(null);
                    setSubAdminName('');
                    setSubAdminEmail('');
                    setSubAdminUsername('');
                    setSubAdminPassword('subadmin123');
                    setSubAdminTitle('Assistant Curriculum Coordinator');
                    setSubAdminEmployeeId(`DEPED-DO-SUB-${Math.floor(1000 + Math.random() * 9000)}`);
                    setShowAddSubAdminModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Sub-Admin</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/70">
                    <th className="py-3 px-4">Administrator & ID</th>
                    <th className="py-3 px-3">Role Tier</th>
                    <th className="py-3 px-3">Designation / Title</th>
                    <th className="py-3 px-3">Username & Email</th>
                    <th className="py-3 px-3">Delegated Permissions</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allAdmins.map((adm) => {
                    const isTargetMain = Boolean(
                      adm.isMainAdmin ??
                        (adm.adminLevel === 'main' ||
                          adm.id === 'admin-deped-davao-oriental' ||
                          adm.id === 'admin-elena-reyes' ||
                          !adm.createdByAdminId)
                    );
                    return (
                      <tr key={adm.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isTargetMain
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-sky-100 text-sky-900 border border-sky-300'
                              }`}
                            >
                              {isTargetMain ? (
                                <Crown className="w-4 h-4 fill-amber-700 text-amber-700" />
                              ) : (
                                <Shield className="w-4 h-4 text-sky-700" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{adm.name}</span>
                                {adm.id === currentAdmin.id && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{adm.employeeId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {isTargetMain ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              <Crown className="w-3 h-3 fill-amber-700 text-amber-700" /> Main Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-300">
                              <Shield className="w-3 h-3 text-sky-700" /> Sub-Admin
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-slate-700 font-semibold max-w-xs">
                          {adm.adminTitle || (isTargetMain ? 'Division English Supervisor' : 'Assistant Administrator')}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-mono text-slate-800 text-[11px]">@{adm.username}</div>
                          <div className="text-[11px] text-slate-400">{adm.email}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center gap-1 text-emerald-700">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Teacher Approvals</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-700">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Module & Quiz Editing</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-700">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Student Progress Records</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                isTargetMain ? 'text-amber-800 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {isTargetMain ? (
                                <>
                                  <Check className="w-3 h-3 text-amber-600" />
                                  <span>Manage Sub-Admins: Enabled</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>Manage Sub-Admins: Restricted</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {adm.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Deactivated
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isMainAdmin ? (
                            isTargetMain ? (
                              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                                Primary (Protected)
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {adm.status === 'suspended' || !adm.isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => handleReactivate(adm)}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer flex items-center gap-1 border border-emerald-200"
                                    title="Reactivate sub-administrator privileges"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Reactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openSuspendModal(adm)}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition cursor-pointer flex items-center gap-1 border border-amber-200"
                                    title="Suspend sub-administrator privileges"
                                  >
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>Suspend</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFX.playClick();
                                    setEditingSubAdmin(adm);
                                    setEditAdminTitle(adm.adminTitle || '');
                                    setEditAdminEmail(adm.email || '');
                                    setEditAdminPassword('');
                                    setEditAdminIsActive(adm.isActive);
                                    setEditAdminError(null);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                                  title="Edit sub-administrator title, email or password"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFX.playClick();
                                    setDeletingSubAdmin(adm);
                                    setDeleteSubAdminReason('');
                                  }}
                                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                                  title="Remove sub-administrator"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              Main Admin Only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: ADMIN AUDIT TRAIL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Top Controls: View Mode Tabs & Search & Filter */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Division Administrative Audit Trail
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track governance actions, approvals, module publications, and sub-admin operations.
                </p>
              </div>

              {/* View Mode Switcher: Active vs Archived vs All */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setAuditViewMode('active');
                    setSelectedAuditIds([]);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    auditViewMode === 'active'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Active Trail</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-black">
                    {activeAuditCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setAuditViewMode('archived');
                    setSelectedAuditIds([]);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    auditViewMode === 'archived'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archived</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 font-black">
                    {archivedAuditCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setAuditViewMode('all');
                    setSelectedAuditIds([]);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    auditViewMode === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All Records</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-black">
                    {auditLogs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter by Action + Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by administrator, entity, details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Filter:
                </span>
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Approved', value: 'teacher_approved' },
                  { label: 'Rejected', value: 'teacher_rejected' },
                  { label: 'Suspended', value: 'teacher_suspended' },
                  { label: 'Modules', value: 'module_created' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setAuditFilter(opt.value);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      auditFilter === opt.value
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Selection Action Toolbar */}
          {selectedAuditIds.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-lg border border-blue-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <span className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-black">
                  {selectedAuditIds.length}
                </span>
                <span>Audit Records Selected</span>
                <button
                  type="button"
                  onClick={() => setSelectedAuditIds([])}
                  className="text-xs text-blue-300 hover:text-white underline ml-2 cursor-pointer"
                >
                  Deselect All
                </button>
              </div>

              <div className="flex items-center gap-2">
                {auditViewMode === 'archived' ? (
                  <button
                    type="button"
                    disabled={isProcessingAuditAction}
                    onClick={handleBulkRestore}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Restore Selected ({selectedAuditIds.length})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessingAuditAction}
                    onClick={handleBulkArchive}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Selected ({selectedAuditIds.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isProcessingAuditAction}
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedAuditIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredAuditLogs.length > 0 &&
                          filteredAuditLogs.every((l) => selectedAuditIds.includes(l.id))
                        }
                        onChange={() =>
                          handleSelectAllFiltered(filteredAuditLogs.map((l) => l.id))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Select/Deselect All Filtered"
                      />
                    </th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Administrator</th>
                    <th className="py-3.5 px-4">Target Entity</th>
                    <th className="py-3.5 px-4">Details / Reason</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Archive className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="font-bold text-xs text-slate-600">No Audit Trail Records</p>
                          <p className="text-[11px] text-slate-400">
                            {auditViewMode === 'archived'
                              ? 'No records currently archived in the vault.'
                              : 'No audit records match the current filter criteria.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const isSelected = selectedAuditIds.includes(log.id);
                      return (
                        <tr
                          key={log.id}
                          className={`transition ${
                            isSelected
                              ? 'bg-blue-50/80'
                              : log.isArchived
                              ? 'bg-amber-50/30 hover:bg-amber-50/50'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectAudit(log.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                log.actionType.includes('approved')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.actionType.includes('rejected')
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.actionType.includes('suspended')
                                  ? 'bg-amber-100 text-amber-800'
                                  : log.actionType.includes('sub_admin')
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {log.actionType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {log.adminName}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {log.targetName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-md">
                            <div>{log.details}</div>
                            {log.isArchived && log.archivedAt && (
                              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                Archived on {log.archivedAt.slice(0, 10)} by {log.archivedBy || 'Administrator'}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {log.isArchived ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <Archive className="w-3 h-3" />
                                Archived
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Check className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {log.isArchived ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnarchiveSingleAudit(log)}
                                  disabled={isProcessingAuditAction}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                  title="Restore to Active Trail"
                                  aria-label="Restore to Active Trail"
                                >
                                  <ArchiveRestore className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleArchiveSingleAudit(log)}
                                  disabled={isProcessingAuditAction}
                                  className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                                  title="Archive this log"
                                  aria-label="Archive this log"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  soundFX.playClick();
                                  setConfirmDeleteAudit(log);
                                }}
                                disabled={isProcessingAuditAction}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                title="Permanently Delete Record"
                                aria-label="Permanently Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: CURRICULUM BOTTLENECKS & PASS/FAIL ANALYTICS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'CURRICULUM_ANALYTICS' && (
        <div className="animate-dashboard-panel">
          <CurriculumBottlenecksView
            students={students}
            modules={modules}
            onSelectModuleForReview={(mod) => {
              soundFX.playClick();
              setEditingModule(mod);
              setActiveTab('MODULE_MANAGER');
            }}
          />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 7: SCHOOL-WIDE ARCHIPELAGO MAP (Davao Oriental) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'ARCHIPELAGO_MAP' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Top Control Bar: Filters by Grade, Section, Teacher */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  Division Archipelago Overview &amp; Island Progression
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  School-wide live visualization across Davao Oriental. Filter by grade, section, or teacher to inspect localized performance.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Showing {adminIslandStats.filteredCount} Evaluated Learners</span>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Grade Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Grade Level
                </label>
                <select
                  value={mapGradeFilter}
                  onChange={(e) => setMapGradeFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as GradeLevel))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Grades (Grades 7–10)</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Class Section
                </label>
                <select
                  value={mapSectionFilter}
                  onChange={(e) => setMapSectionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sections ({adminIslandStats.availableSections.length || 'All'})</option>
                  {adminIslandStats.availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section: {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Assigned Teacher / Faculty
                </label>
                <select
                  value={mapTeacherFilter}
                  onChange={(e) => setMapTeacherFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Assigned Teachers ({teachers.length})</option>
                  {teachers.map((t: TeacherAccount) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.classCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Archipelago Map */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <InteractiveIslandMap
              mode="admin"
              activeIslandId={selectedAdminMapIsland?.id || 'discovery-dinosaur'}
              islandCustomData={adminIslandStats.customData}
              onSelectIsland={(isl) => setSelectedAdminMapIsland(isl)}
            />
          </div>

          {/* Island Detail Report Panel */}
          {selectedAdminMapIsland && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-lg space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {selectedAdminMapIsland.cardKicker} • {selectedAdminMapIsland.location}
                  </span>
                  <h4 className="text-xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {selectedAdminMapIsland.name} Division Report
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAdminMapIsland.curriculumFocus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveTab('STUDENT_ROSTER');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Student Roster</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAdminMapIsland(null)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3 Real Aggregate Metrics for this Island */}
              {(() => {
                const stats = (adminIslandStats.customData as Record<string, any>)[selectedAdminMapIsland.id];
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                      <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                        {stats?.statA?.label || 'Active Learners'}
                      </span>
                      <div className="text-2xl font-black text-blue-900 mt-1">
                        {stats?.statA?.value ?? '0'}
                      </div>
                      <span className="text-[10px] text-blue-600">Students registered on island</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        {stats?.statB?.label || 'Completion Rate'}
                      </span>
                      <div className="text-2xl font-black text-emerald-900 mt-1">
                        {stats?.statB?.value ?? '0%'}
                      </div>
                      <span className="text-[10px] text-emerald-600">Division mastery benchmark</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                      <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                        {stats?.statC?.label || 'Teachers Assigned'}
                      </span>
                      <div className="text-2xl font-black text-purple-900 mt-1">
                        {stats?.statC?.value ?? '0'}
                      </div>
                      <span className="text-[10px] text-purple-600">Faculty handling this tier</span>
                    </div>
                  </div>
                );
              })()}

              {/* Geographic and DepEd Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <strong className="text-slate-800 font-bold block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Real-Life Geography (Davao Oriental):
                  </strong>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedAdminMapIsland.realLifeGeography}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <strong className="text-slate-800 font-bold block flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Tested DepEd Competencies:
                  </strong>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedAdminMapIsland.competencySnippet}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 8: FEEDBACK, BUG REPORTS & FEATURE REQUESTS      */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'FEEDBACK_CONSOLE' && (
        <AdminFeedbackConsoleView
          feedbackItems={feedbackItems}
          onUpdateFeedbackStatus={async (feedbackId, updates) => {
            if (onUpdateFeedbackStatus) {
              await onUpdateFeedbackStatus(feedbackId, updates);
            }
          }}
          onDeleteFeedback={async (feedbackId) => {
            if (onDeleteFeedback) {
              await onDeleteFeedback(feedbackId);
            }
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Reject Teacher Reason */}
      {/* ---------------------------------------------------- */}
      {rejectingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <AlertCircle className="w-5 h-5" /> Reject Teacher Application
              </div>
              <button
                onClick={() => setRejectingTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the official reason for rejecting <strong>{rejectingTeacher.name}</strong> (Employee ID:{' '}
              {rejectingTeacher.employeeId}). The applicant will see this explanation.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Employee ID does not match Davao Oriental division faculty database..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingTeacher(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Suspend Account Reason */}
      {/* ---------------------------------------------------- */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <ShieldAlert className="w-5 h-5" /> Suspend {suspendingUser.role === 'student' ? 'Learner' : suspendingUser.role === 'admin' ? 'Sub-Administrator' : 'Faculty'} Account
              </div>
              <button
                onClick={() => setSuspendingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide the administrative justification for suspending <strong>{suspendingUser.name}</strong> ({suspendingUser.role}). This will temporarily lock login access for this account.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Suspension Reason</label>
              <textarea
                rows={3}
                value={suspensionReasonInput}
                onChange={(e) => setSuspensionReasonInput(e.target.value)}
                placeholder="e.g. Account suspended pending faculty credential audit..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Delete Suspended / Rejected Teacher Confirmation */}
      {/* ---------------------------------------------------- */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                Remove Faculty Account ({deletingTeacher.status})
              </div>
              <button
                onClick={() => setDeletingTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Teacher:</span>
                <strong className="text-slate-800">{deletingTeacher.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="font-mono text-slate-700">{deletingTeacher.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DepEd Email:</span>
                <span className="text-slate-700">{deletingTeacher.depEdEmail || deletingTeacher.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    deletingTeacher.status === 'suspended'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {deletingTeacher.status}
                </span>
              </div>
              {deletingTeacher.rejectionReason && (
                <div className="pt-1 text-[11px] text-rose-700">
                  <strong>Rejection Reason:</strong> {deletingTeacher.rejectionReason}
                </div>
              )}
              {deletingTeacher.suspensionReason && (
                <div className="pt-1 text-[11px] text-amber-800">
                  <strong>Suspension Reason:</strong> {deletingTeacher.suspensionReason}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Permanent Account Removal:</strong>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  This will permanently delete the teacher record, credentials, and access from the Division of Davao Oriental database. This action cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Administrative Deletion Reason (Audit Log)
              </label>
              <textarea
                rows={2}
                value={deleteReasonInput}
                onChange={(e) => setDeleteReasonInput(e.target.value)}
                placeholder="State administrative justification for account removal..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                disabled={isDeletingTeacher}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeacher}
                disabled={isDeletingTeacher}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeletingTeacher ? 'Deleting...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Delete Student Confirmation */}
      {/* ---------------------------------------------------- */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                Remove Learner Account
              </div>
              <button
                onClick={() => setDeletingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <strong className="text-slate-800">{deletingStudent.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LRN (Learner ID):</span>
                <span className="font-mono text-slate-700">{deletingStudent.lrn || deletingStudent.learnerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grade Level:</span>
                <span className="font-bold text-blue-700">Grade {deletingStudent.gradeLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">School:</span>
                <span className="text-slate-700 truncate max-w-[200px]">{deletingStudent.schoolName || 'Davao Oriental High School'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    deletingStudent.status === 'suspended'
                      ? 'bg-amber-100 text-amber-800'
                      : deletingStudent.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {deletingStudent.status || (deletingStudent.isActive ? 'active' : 'inactive')}
                </span>
              </div>
              {deletingStudent.suspensionReason && (
                <div className="pt-1 text-[11px] text-amber-800">
                  <strong>Suspension Reason:</strong> {deletingStudent.suspensionReason}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Permanent Account Removal:</strong>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  This will permanently delete this student record from the Division of Davao Oriental database, removing all learning progress, quiz attempts, and writing submissions. This action cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Administrative Deletion Reason (Audit Log)
              </label>
              <textarea
                rows={2}
                value={deleteStudentReasonInput}
                onChange={(e) => setDeleteStudentReasonInput(e.target.value)}
                placeholder="State administrative justification for learner removal..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                disabled={isDeletingStudent}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={isDeletingStudent}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeletingStudent ? 'Removing...' : 'Confirm Permanent Removal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Delete Module Confirmation */}
      {/* ---------------------------------------------------- */}
      {deletingModule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <Trash2 className="w-5 h-5" /> Confirm Module Deletion
              </div>
              <button
                onClick={() => setDeletingModule(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete module <strong>"{deletingModule.title}"</strong> (Grade{' '}
              {deletingModule.gradeLevel}, Quarter {deletingModule.quarter})? This action will be logged in the system audit trail.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingModule(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteModule}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Create / Edit Module Form */}
      {/* ---------------------------------------------------- */}
      {(isCreatingModule || editingModule) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black font-display text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {editingModule ? `Edit Module: ${editingModule.title}` : 'Create New Curriculum Module'}
                </h3>
                <p className="text-xs text-slate-400">
                  Manage lesson instruction, DepEd competencies, and interactive quiz questions.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreatingModule(false);
                  setEditingModule(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Module Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Context Clues & Figurative Language"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Grade Level</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={7}>Grade 7</option>
                    <option value={8}>Grade 8</option>
                    <option value={9}>Grade 9</option>
                    <option value={10}>Grade 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quarter</label>
                  <select
                    value={formQuarter}
                    onChange={(e) => setFormQuarter(Number(e.target.value) as QuarterNumber)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>Quarter 1</option>
                    <option value={2}>Quarter 2</option>
                    <option value={3}>Quarter 3</option>
                    <option value={4}>Quarter 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gamified Island Name</label>
                  <input
                    type="text"
                    required
                    value={formIslandName}
                    onChange={(e) => setFormIslandName(e.target.value)}
                    placeholder="e.g. Pujada Island or Waniban Island"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Required Passing Score (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formPassingScore}
                    onChange={(e) => setFormPassingScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">DepEd MELC Competency Code</label>
                  <input
                    type="text"
                    required
                    value={formMelc}
                    onChange={(e) => setFormMelc(e.target.value)}
                    placeholder="e.g. EN8G-Ia-7: Use parallel structures..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lesson Overview / Instruction</label>
                  <textarea
                    rows={3}
                    value={formOverview}
                    onChange={(e) => setFormOverview(e.target.value)}
                    placeholder="Detailed explanation of the grammatical or literary concept..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Key Rules (One per line)</label>
                  <textarea
                    rows={3}
                    value={formKeyRules}
                    onChange={(e) => setFormKeyRules(e.target.value)}
                    placeholder="Rule 1: ...&#10;Rule 2: ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quiz Questions Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">
                    Quiz Questions ({formQuizQuestions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newQ: QuizQuestion = {
                        id: `q-${Date.now()}`,
                        type: 'typeHunter',
                        difficulty: 'moderate',
                        prompt: 'Enter prompt for this challenge...',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        answer: 'Option A',
                        explanation: 'Explanation of correct answer.',
                        timeLimitSeconds: 25,
                      };
                      setFormQuizQuestions([...formQuizQuestions, newQ]);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                <div className="space-y-3">
                  {formQuizQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-blue-600">Question #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setFormQuizQuestions(formQuizQuestions.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Prompt</label>
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) => {
                              const updated = [...formQuizQuestions];
                              updated[idx].prompt = e.target.value;
                              setFormQuizQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Correct Answer</label>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => {
                              const updated = [...formQuizQuestions];
                              updated[idx].answer = e.target.value;
                              setFormQuizQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Game Type</label>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const updated = [...formQuizQuestions];
                              updated[idx].type = e.target.value as QuizGameType;
                              setFormQuizQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          >
                            <option value="typeHunter">Type Hunter</option>
                            <option value="pictureHunt">Picture Hunt</option>
                            <option value="missingPiece">Missing Piece</option>
                            <option value="analogyMaster">Analogy Master</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingModule(false);
                    setEditingModule(null);
                  }}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                >
                  {editingModule ? 'Save Module Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Teacher with Unique Class Code Modal */}
      {approvingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Approve Faculty Application</h3>
                  <p className="text-xs text-slate-500">Activate credentials & assign class code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovingTeacher(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Teacher:</span>
                <strong className="text-slate-800">{approvingTeacher.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="text-slate-700 font-mono">{approvingTeacher.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">School:</span>
                <span className="text-slate-700 truncate max-w-[200px]">{approvingTeacher.schoolName || approvingTeacher.department}</span>
              </div>
            </div>

            {/* Class code assignment input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Assigned Unique Class Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setApprovalClassCodeInput(generateUniqueClassCode(allUsers));
                    setClassCodeError('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-Generate
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={approvalClassCodeInput}
                  onChange={(e) => {
                    setApprovalClassCodeInput(e.target.value.toUpperCase());
                    setClassCodeError('');
                  }}
                  placeholder="e.g. LQ-ENG-8492"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 font-mono font-bold text-sm text-slate-900 uppercase"
                />
              </div>

              {classCodeError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {classCodeError}
                </p>
              )}

              <p className="text-[11px] text-slate-500 leading-normal">
                Students will enter this unique code during student registration to join {approvingTeacher.name}&apos;s classroom.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingTeacher(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproveWithCode}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                Activate & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Reassign Class Code Modal */}
      {editingCodeTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reassign Unique Class Code</h3>
                  <p className="text-xs text-slate-500">Update code for {editingCodeTeacher.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCodeTeacher(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  New Unique Class Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setEditClassCodeInput(generateUniqueClassCode(allUsers));
                    setClassCodeError('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="w-3 h-3" /> Generate Unique
                </button>
              </div>

              <input
                type="text"
                value={editClassCodeInput}
                onChange={(e) => {
                  setEditClassCodeInput(e.target.value.toUpperCase());
                  setClassCodeError('');
                }}
                placeholder="e.g. LQ-ENG-9102"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 font-mono font-bold text-sm text-slate-900 uppercase"
              />

              {classCodeError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {classCodeError}
                </p>
              )}

              <p className="text-[11px] text-slate-500 leading-normal">
                Currently has <strong>{getStudentsForTeacher(editingCodeTeacher.classCode).length} students</strong> enrolled under current code ({editingCodeTeacher.classCode}).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCodeTeacher(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdateCode}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                Save New Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Drill-Down Performance Modal (Admin Read-Only) */}
      {selectedStudentForDrillDown && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      {selectedStudentForDrillDown.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-500" /> Read-Only Record
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    LRN: {selectedStudentForDrillDown.learnerId} • Grade {selectedStudentForDrillDown.gradeLevel}
                    {selectedStudentForDrillDown.schoolName ? ` • ${selectedStudentForDrillDown.schoolName}` : selectedStudentForDrillDown.section ? ` - Sec: ${selectedStudentForDrillDown.section}` : ''}
                    {selectedStudentForDrillDown.classCode ? ` • Class: ${selectedStudentForDrillDown.classCode}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onPreviewAsStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      const targetG = selectedStudentForDrillDown.gradeLevel;
                      setSelectedStudentForDrillDown(null);
                      onPreviewAsStudent(targetG);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Preview Grade {selectedStudentForDrillDown.gradeLevel} Map</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStudentForDrillDown(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics in Drill-Down */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Quest Points</div>
                <div className="text-lg font-black font-mono text-amber-600">
                  {selectedStudentForDrillDown.points.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Bridges Restored</div>
                <div className="text-lg font-black font-mono text-emerald-600">
                  {
                    Object.values(selectedStudentForDrillDown.progressByModule).filter(
                      (p) => p.isBridgeRestored
                    ).length
                  }
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Badges Earned</div>
                <div className="text-lg font-black font-mono text-purple-600">
                  {selectedStudentForDrillDown.badges.length} / {BADGE_DEFINITIONS.length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400 font-bold uppercase">AI Submissions</div>
                <div className="text-lg font-black font-mono text-indigo-600">
                  {selectedStudentForDrillDown.writingSubmissions?.length || 0}
                </div>
              </div>
            </div>

            {/* Module Progress Roster */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-display text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Module Competency Record (Grade {selectedStudentForDrillDown.gradeLevel})
              </h4>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Module</th>
                      <th className="py-2.5 px-3">Topic</th>
                      <th className="py-2.5 px-3">Lesson</th>
                      <th className="py-2.5 px-3">Bridge Status</th>
                      <th className="py-2.5 px-3">Best Score</th>
                      <th className="py-2.5 px-3">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modules
                      .filter((m) => m.gradeLevel === selectedStudentForDrillDown.gradeLevel)
                      .map((mod) => {
                        const prog = selectedStudentForDrillDown.progressByModule[mod.id];
                        const restored = Boolean(
                          prog?.isBridgeRestored ||
                            selectedStudentForDrillDown.completedModules.includes(mod.id)
                        );

                        return (
                          <tr key={mod.id}>
                            <td className="py-2.5 px-3 font-bold text-slate-800">
                              Q{mod.quarter} M{mod.quarterModuleIndex || mod.moduleNumber}: {mod.title}
                            </td>
                            <td className="py-2.5 px-3 capitalize text-slate-600">
                              {mod.topicType.replace('-', ' ')}
                            </td>
                            <td className="py-2.5 px-3">
                              {prog?.lessonCompleted ? (
                                <span className="text-emerald-700 font-semibold">Finished</span>
                              ) : (
                                <span className="text-slate-400">Pending</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {restored ? (
                                <span className="text-emerald-700 font-bold">Restored</span>
                              ) : (
                                <span className="text-slate-400">Broken</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold">
                              {prog?.bestScorePercent ? `${prog.bestScorePercent}%` : '—'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {prog?.attemptsCount || 0}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Writing Submissions for this student */}
            {selectedStudentForDrillDown.writingSubmissions &&
              selectedStudentForDrillDown.writingSubmissions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold font-display text-slate-800 flex items-center gap-2">
                    <Feather className="w-4 h-4 text-emerald-600" />
                    AI Writing Submissions ({selectedStudentForDrillDown.writingSubmissions.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedStudentForDrillDown.writingSubmissions.map((sub, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span>{sub.promptTitle}</span>
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                            {sub.feedback?.clarityScore}/100
                          </span>
                        </div>
                        <p className="italic text-slate-600 font-serif">"{sub.studentText}"</p>
                        {sub.feedback?.overallClarityComment && (
                          <p className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                            AI Comment: {sub.feedback.overallClarityComment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Student records are managed by classroom teachers (Read-Only to Division Admins)
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudentForDrillDown(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 1: ADD SUB-ADMINISTRATOR (Main Admin Authority Only) */}
      {/* ================================================================ */}
      {showAddSubAdminModal && isMainAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-5 my-8">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <UserPlus className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Appoint Division Sub-Administrator
                  </h3>
                  <p className="text-xs text-sky-200">
                    Delegated operational controls for DepEd Davao Oriental
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubAdminModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewSubAdmin} className="p-6 pt-0 space-y-4">
              {subAdminFormError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{subAdminFormError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Roberto P. Alcantara"
                    value={subAdminName}
                    onChange={(e) => setSubAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      DepEd Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="roberto.alcantara@deped.gov.ph"
                      value={subAdminEmail}
                      onChange={(e) => setSubAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="roberto.alcantara"
                      value={subAdminUsername}
                      onChange={(e) => setSubAdminUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Employee ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="DEPED-DO-SUB-5192"
                      value={subAdminEmployeeId}
                      onChange={(e) => setSubAdminEmployeeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Initial Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subAdminPassword}
                      onChange={(e) => setSubAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono bg-slate-50/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Designation / Official Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Curriculum Coordinator"
                    value={subAdminTitle}
                    onChange={(e) => setSubAdminTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                  />
                </div>

                {/* Delegated Access Notice */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Delegated Control Scope & Policy:</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Teacher applications review, class code setup & approvals
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Curriculum module creation, quiz editing, and answer checking
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Student progress, bridge restoration & essay records monitoring
                    </li>
                    <li className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50/80 p-1.5 rounded-lg border border-rose-100">
                      <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Sub-admins CANNOT add another sub admin or modify admin accounts
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSubAdmin}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmittingSubAdmin ? 'Creating...' : 'Create Sub-Administrator'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 2: EDIT SUB-ADMINISTRATOR (Main Admin Authority Only) */}
      {/* ================================================================ */}
      {editingSubAdmin && isMainAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-5">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-display text-white">
                  Edit Sub-Administrator: {editingSubAdmin.name}
                </h3>
                <p className="text-[11px] text-slate-300">Employee ID: {editingSubAdmin.employeeId}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubAdmin(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubAdmin} className="p-5 pt-0 space-y-4">
              {editAdminError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {editAdminError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Designation / Title</label>
                  <input
                    type="text"
                    required
                    value={editAdminTitle}
                    onChange={(e) => setEditAdminTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">DepEd Email</label>
                  <input
                    type="email"
                    required
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reset Password (leave empty to keep current)</label>
                  <input
                    type="text"
                    placeholder="Enter new password or leave blank"
                    value={editAdminPassword}
                    onChange={(e) => setEditAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700">Account Operational Status</span>
                  <button
                    type="button"
                    onClick={() => setEditAdminIsActive(!editAdminIsActive)}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                      editAdminIsActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                    }`}
                  >
                    {editAdminIsActive ? 'Active' : 'Deactivated'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 3: DELETE SUB-ADMINISTRATOR (Main Admin Authority Only) */}
      {/* ================================================================ */}
      {deletingSubAdmin && isMainAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Remove Sub-Administrator Account?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove <strong>{deletingSubAdmin.name}</strong> ({deletingSubAdmin.employeeId}) from the Division administration roster? This will revoke their administrative credentials.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Removal (Logged in Audit Trail)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Completed division assignment or reassigned to school."
                value={deleteSubAdminReason}
                onChange={(e) => setDeleteSubAdminReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingSubAdmin(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingSubAdmin}
                onClick={handleConfirmDeleteSubAdmin}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isDeletingSubAdmin ? 'Removing...' : 'Confirm Remove Sub-Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 4: SINGLE AUDIT LOG PERMANENT DELETE (Full Delete Option) */}
      {/* ================================================================ */}
      {confirmDeleteAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Permanently Delete Audit Record?
                </h3>
                <span className="text-[11px] text-rose-600 font-bold uppercase tracking-wider">
                  Full Delete Option
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove this audit trail record from the database? This action cannot be reversed.
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>{confirmDeleteAudit.timestamp}</span>
                <span className="font-bold uppercase text-slate-700">{confirmDeleteAudit.actionType}</span>
              </div>
              <div className="font-bold text-slate-800">
                Admin: {confirmDeleteAudit.adminName}
              </div>
              <div className="text-slate-600 italic">
                “{confirmDeleteAudit.details}”
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              💡 <strong>Compliance Note:</strong> For official DepEd records management, <strong>Archiving</strong> is recommended over permanent deletion so records can be audited if requested.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteAudit(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAuditAction}
                onClick={handleConfirmFullDeleteSingle}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessingAuditAction ? 'Deleting...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 5: BULK AUDIT LOGS PERMANENT DELETE */}
      {/* ================================================================ */}
      {showBulkDeleteModal && selectedAuditIds.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Delete {selectedAuditIds.length} Audit Records?
                </h3>
                <span className="text-[11px] text-rose-600 font-bold uppercase tracking-wider">
                  Bulk Permanent Deletion
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to permanently purge <strong>{selectedAuditIds.length}</strong> selected audit records from the Division audit trail. This data cannot be recovered once purged.
            </p>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              💡 Consider archiving these records instead of permanently deleting them to preserve administrative compliance history.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAuditAction}
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessingAuditAction ? 'Purging...' : `Permanently Delete (${selectedAuditIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
