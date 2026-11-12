import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart2,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Feather,
  FileCheck,
  Filter,
  GraduationCap,
  History,
  Key,
  Lock,
  Mail,
  MapPin,
  Plus,
  Printer,
  RotateCcw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { BADGE_DEFINITIONS } from '../data/seedData';
import { DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS } from '../data/davaoOrientalSchools';
import { InabelHeaderStrip } from './InabelHeaderStrip';
import {
  GradeLevel,
  Module,
  StudentAccount,
  TeacherAccount,
  getDavaoOrientalIsland,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';
import { BadgeIcon } from './BadgeIcon';
import { ComprehensiveCurriculumView } from './ComprehensiveCurriculumView';
import { InteractiveIslandMap, IslandStationData } from './InteractiveIslandMap';

interface TeacherDashboardViewProps {
  currentTeacher: TeacherAccount;
  students: StudentAccount[];
  allModules: Module[];
  onAddStudent: (newStudent: any) => Promise<any> | any;
  onToggleStudentStatus: (studentId: string) => void;
  onSwitchToStudentView: (student: StudentAccount) => void;
  onUpdateTeacherProfile?: (updates: {
    name?: string;
    depEdEmail?: string;
    password?: string;
    schoolName?: string;
    department?: string;
  }) => Promise<{ success: boolean; teacher?: TeacherAccount; error?: string }>;
  onUpdateStudent?: (
    studentId: string,
    updates: {
      gradeLevel?: GradeLevel;
      lrn?: string;
      learnerId?: string;
      schoolName?: string;
      section?: string;
      name?: string;
    }
  ) => Promise<{ success: boolean; student?: StudentAccount; error?: string }>;
  onReviewStudent?: (
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
  ) => Promise<{ success: boolean; student?: StudentAccount; error?: string }>;
  onPreviewIslandMap?: (targetGrade?: GradeLevel) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentTeacher,
  students,
  allModules,
  onAddStudent,
  onToggleStudentStatus,
  onSwitchToStudentView,
  onUpdateTeacherProfile,
  onUpdateStudent,
  onReviewStudent,
  onPreviewIslandMap,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'class_analytics' | 'review' | 'modules' | 'island_map'>('students');
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForDrillDown, setSelectedStudentForDrillDown] = useState<StudentAccount | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedMapIsland, setSelectedMapIsland] = useState<IslandStationData | null>(null);

  // Class Performance Analytics States
  const [analyticsGradeFilter, setAnalyticsGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [analyticsSectionFilter, setAnalyticsSectionFilter] = useState<string>('all');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'score' | 'points' | 'modules' | 'writing' | 'name'>('score');
  const [analyticsSubView, setAnalyticsSubView] = useState<'summary' | 'competencies' | 'students'>('summary');

  // Compute class-wide progress across the 6 Davao Oriental islands
  const classIslandStats = React.useMemo(() => {
    const classStudents = students.filter(
      (s) => s.classCode === currentTeacher.classCode || s.teacherId === currentTeacher.id
    );
    const totalStudents = classStudents.length || 1;

    // Helper to count students who completed modules in a quarter
    const getQuarterCount = (quarterNum: number) => {
      return classStudents.filter((s) => {
        const completed = s.completedModules || [];
        return completed.some((id) => id.includes(`-q${quarterNum}-`));
      }).length;
    };

    const q1Count = getQuarterCount(1);
    const q2Count = getQuarterCount(2);
    const q3Count = getQuarterCount(3);
    const q4Count = getQuarterCount(4);
    const dinosaurCount = classStudents.filter((s) => (s.points || 0) > 200).length;
    const q1Rate = Math.round((q1Count / totalStudents) * 100);
    const q2Rate = Math.round((q2Count / totalStudents) * 100);
    const q3Rate = Math.round((q3Count / totalStudents) * 100);
    const q4Rate = Math.round((q4Count / totalStudents) * 100);

    const customData: Record<
      string,
      {
        badgeText: string;
        badgeType: 'success' | 'warning' | 'info' | 'default';
        status?: 'completed' | 'current' | 'upcoming' | 'locked';
      }
    > = {
      'q1-san-victor': {
        badgeText: `${q1Count} Passed (${q1Rate}%)`,
        badgeType: q1Rate >= 75 ? 'success' : q1Rate >= 50 ? 'warning' : 'default',
      },
      'q2-oak': {
        badgeText: `${q2Count} Passed (${q2Rate}%)`,
        badgeType: q2Rate >= 75 ? 'success' : q2Rate >= 50 ? 'warning' : 'default',
      },
      'q3-waniban': {
        badgeText: `${q3Count} Passed (${q3Rate}%)`,
        badgeType: q3Rate >= 75 ? 'success' : q3Rate >= 50 ? 'warning' : 'default',
      },
      'q4-pujada': {
        badgeText: `${q4Count} Passed (${q4Rate}%)`,
        badgeType: q4Rate >= 75 ? 'success' : q4Rate >= 50 ? 'warning' : 'default',
      },
      'discovery-dinosaur': {
        badgeText: `${dinosaurCount} Active`,
        badgeType: 'info',
      },
    };

    return {
      classStudents,
      totalClassStudents: classStudents.length,
      customData,
    };
  }, [students, currentTeacher]);

  // Compute teacher assigned grade levels
  const teacherAssignedGrades = React.useMemo(() => {
    if (currentTeacher.gradeLevels && currentTeacher.gradeLevels.length > 0) {
      return currentTeacher.gradeLevels;
    }
    if (currentTeacher.gradeClassCodes) {
      const gKeys = Object.keys(currentTeacher.gradeClassCodes).map(Number) as GradeLevel[];
      if (gKeys.length > 0) return gKeys;
    }
    const studentGrades = Array.from(
      new Set(
        students
          .filter((s) => s.classCode === currentTeacher.classCode)
          .map((s) => s.gradeLevel)
      )
    );
    if (studentGrades.length > 0) {
      return studentGrades as GradeLevel[];
    }
    return [7] as GradeLevel[];
  }, [currentTeacher, students]);

  // Class Performance Analytics: Students strictly under this teacher's class
  const teacherClassStudents = React.useMemo(() => {
    return students.filter((s) => {
      if (s.teacherId === currentTeacher.id) return true;
      if (s.classCode && currentTeacher.classCode && s.classCode.trim().toUpperCase() === currentTeacher.classCode.trim().toUpperCase()) return true;
      if (currentTeacher.gradeClassCodes) {
        return Object.values(currentTeacher.gradeClassCodes).some(
          (code) => code && s.classCode && s.classCode.trim().toUpperCase() === code.trim().toUpperCase()
        );
      }
      return false;
    });
  }, [students, currentTeacher]);

  const classSections = React.useMemo(() => {
    const set = new Set<string>();
    teacherClassStudents.forEach((s) => {
      if (s.section && s.section.trim()) set.add(s.section.trim());
    });
    return Array.from(set).sort();
  }, [teacherClassStudents]);

  const filteredAnalyticsStudents = React.useMemo(() => {
    return teacherClassStudents
      .filter((st) => {
        if (analyticsGradeFilter !== 'all' && st.gradeLevel !== analyticsGradeFilter) return false;
        if (analyticsSectionFilter !== 'all' && st.section !== analyticsSectionFilter) return false;
        if (analyticsSearch.trim()) {
          const q = analyticsSearch.toLowerCase().trim();
          const name = (st.name || '').toLowerCase();
          const lrn = (st.lrn || st.learnerId || '').toLowerCase();
          const section = (st.section || '').toLowerCase();
          return name.includes(q) || lrn.includes(q) || section.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const getAvg = (s: StudentAccount) => {
          const scores = Object.values(s.progressByModule)
            .map((p) => p.bestScorePercent)
            .filter((sc) => sc > 0);
          return scores.length > 0 ? scores.reduce((sum, v) => sum + v, 0) / scores.length : 0;
        };

        if (analyticsSortBy === 'score') return getAvg(b) - getAvg(a);
        if (analyticsSortBy === 'points') return (b.points || 0) - (a.points || 0);
        if (analyticsSortBy === 'modules') return (b.completedModules?.length || 0) - (a.completedModules?.length || 0);
        if (analyticsSortBy === 'writing') return (b.writingSubmissions?.length || 0) - (a.writingSubmissions?.length || 0);
        return a.name.localeCompare(b.name);
      });
  }, [teacherClassStudents, analyticsGradeFilter, analyticsSectionFilter, analyticsSearch, analyticsSortBy]);

  const classAnalyticsKPIs = React.useMemo(() => {
    const total = filteredAnalyticsStudents.length;
    if (total === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        classAverageScore: 0,
        totalCompletedModules: 0,
        totalRestoredBridges: 0,
        totalWritingSubmissions: 0,
        averageWritingClarity: 0,
        highMasteryCount: 0,
        proficientCount: 0,
        needsSupportCount: 0,
        totalPoints: 0,
      };
    }

    let allQuizScores: number[] = [];
    let totalCompleted = 0;
    let totalBridges = 0;
    let totalWriting = 0;
    let totalClaritySum = 0;
    let clarityCount = 0;
    let highMastery = 0;
    let proficient = 0;
    let needsSupport = 0;
    let totalPoints = 0;

    filteredAnalyticsStudents.forEach((st) => {
      totalPoints += st.points || 0;
      totalCompleted += st.completedModules?.length || 0;
      const modValues = Object.values(st.progressByModule);
      const studentBridges = modValues.filter((p) => p.isBridgeRestored).length;
      totalBridges += studentBridges;

      const studentScores = modValues.map((p) => p.bestScorePercent).filter((sc) => sc > 0);
      allQuizScores.push(...studentScores);

      const studentAvg = studentScores.length > 0 ? studentScores.reduce((a, b) => a + b, 0) / studentScores.length : 0;
      if (studentAvg >= 85) highMastery++;
      else if (studentAvg >= 75) proficient++;
      else needsSupport++;

      const writing = st.writingSubmissions || [];
      totalWriting += writing.length;
      writing.forEach((w) => {
        if (w.feedback?.clarityScore) {
          totalClaritySum += w.feedback.clarityScore;
          clarityCount++;
        }
      });
    });

    const classAverageScore =
      allQuizScores.length > 0 ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length) : 0;
    const averageWritingClarity = clarityCount > 0 ? Math.round(totalClaritySum / clarityCount) : 0;
    const activeStudents = filteredAnalyticsStudents.filter((s) => s.isActive).length;

    return {
      totalStudents: total,
      activeStudents,
      classAverageScore,
      totalCompletedModules: totalCompleted,
      totalRestoredBridges: totalBridges,
      totalWritingSubmissions: totalWriting,
      averageWritingClarity,
      highMasteryCount: highMastery,
      proficientCount: proficient,
      needsSupportCount: needsSupport,
      totalPoints,
    };
  }, [filteredAnalyticsStudents]);

  const classModuleAnalytics = React.useMemo(() => {
    const relevantModules = allModules.filter((m) => {
      if (analyticsGradeFilter !== 'all') return m.gradeLevel === analyticsGradeFilter;
      return teacherAssignedGrades.includes(m.gradeLevel);
    });

    return relevantModules.map((mod) => {
      let attemptsCount = 0;
      let completedCount = 0;
      let scoreSum = 0;
      let scoresCount = 0;

      filteredAnalyticsStudents.forEach((st) => {
        const prog = st.progressByModule[mod.id];
        if (prog) {
          attemptsCount += prog.attemptsCount || 0;
          if (prog.lessonCompleted || prog.isBridgeRestored || st.completedModules?.includes(mod.id)) {
            completedCount++;
          }
          if (prog.bestScorePercent > 0) {
            scoreSum += prog.bestScorePercent;
            scoresCount++;
          }
        }
      });

      const avgScore = scoresCount > 0 ? Math.round(scoreSum / scoresCount) : 0;
      const completionRate =
        filteredAnalyticsStudents.length > 0
          ? Math.round((completedCount / filteredAnalyticsStudents.length) * 100)
          : 0;

      const isBottleneck = avgScore > 0 && avgScore < 75;
      const isMastered = avgScore >= 85;

      return {
        module: mod,
        attemptsCount,
        completedCount,
        completionRate,
        avgScore,
        isBottleneck,
        isMastered,
      };
    });
  }, [allModules, analyticsGradeFilter, teacherAssignedGrades, filteredAnalyticsStudents]);

  const classQuarterAnalytics = React.useMemo(() => {
    const quarters = [1, 2, 3, 4] as const;
    return quarters.map((qNum) => {
      const qIsland = getDavaoOrientalIsland(qNum);
      const qModules = allModules.filter(
        (m) => m.quarter === qNum && (analyticsGradeFilter === 'all' || m.gradeLevel === analyticsGradeFilter)
      );

      let studentCompletedAny = 0;
      let scoreSum = 0;
      let scoreCount = 0;

      filteredAnalyticsStudents.forEach((st) => {
        const completed = st.completedModules || [];
        const hasCompletedQ = completed.some((id) => id.includes(`-q${qNum}-`));
        if (hasCompletedQ) studentCompletedAny++;

        qModules.forEach((m) => {
          const prog = st.progressByModule[m.id];
          if (prog && prog.bestScorePercent > 0) {
            scoreSum += prog.bestScorePercent;
            scoreCount++;
          }
        });
      });

      const completionRate =
        filteredAnalyticsStudents.length > 0
          ? Math.round((studentCompletedAny / filteredAnalyticsStudents.length) * 100)
          : 0;
      const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

      return {
        quarter: qNum,
        islandName: qIsland.name,
        municipality: qIsland.municipality,
        landmark: qIsland.landmark,
        themeColor: qIsland.themeColor,
        totalModules: qModules.length,
        studentCompletedAny,
        completionRate,
        avgScore,
      };
    });
  }, [allModules, analyticsGradeFilter, filteredAnalyticsStudents]);

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [editStuGrade, setEditStuGrade] = useState<GradeLevel>(8);
  const [editStuLrn, setEditStuLrn] = useState('');
  const [editStuSchool, setEditStuSchool] = useState('');
  const [editStuSection, setEditStuSection] = useState('');
  const [editStuName, setEditStuName] = useState('');
  const [editStuSaving, setEditStuSaving] = useState(false);
  const [editStuError, setEditStuError] = useState<string | null>(null);
  const [editStuSuccess, setEditStuSuccess] = useState<string | null>(null);

  // Review & Verification states
  const [reviewFilter, setReviewFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [reviewSearch, setReviewSearch] = useState('');
  const [verifyingStudent, setVerifyingStudent] = useState<StudentAccount | null>(null);
  const [verifyName, setVerifyName] = useState('');
  const [verifyLrn, setVerifyLrn] = useState('');
  const [verifyGrade, setVerifyGrade] = useState<GradeLevel>(8);
  const [verifySchool, setVerifySchool] = useState('');
  const [verifySection, setVerifySection] = useState('');
  const [verifyNote, setVerifyNote] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  // Reject / Flag Modal
  const [rejectingStudent, setRejectingStudent] = useState<StudentAccount | null>(null);
  const [rejectReason, setRejectReason] = useState('DepEd LRN could not be verified against the official school learner masterlist.');
  const [isRejecting, setIsRejecting] = useState(false);

  // Form states - Student
  const [newStuName, setNewStuName] = useState('');
  const [newStuEmail, setNewStuEmail] = useState('');
  const [newStuLearnerId, setNewStuLearnerId] = useState('');
  const [newStuGrade, setNewStuGrade] = useState<GradeLevel>(8);
  const [newStuSection, setNewStuSection] = useState('Rizal');
  const [newStuUsername, setNewStuUsername] = useState('');
  const [newStuPassword, setNewStuPassword] = useState('password123');

  // Teacher Profile Edit States
  const [editTchName, setEditTchName] = useState(currentTeacher.name);
  const [editTchEmail, setEditTchEmail] = useState(currentTeacher.depEdEmail || currentTeacher.email || '');
  const [editTchSchool, setEditTchSchool] = useState(currentTeacher.schoolName || '');
  const [editTchDepartment, setEditTchDepartment] = useState(currentTeacher.department || '');
  const [editTchNewPassword, setEditTchNewPassword] = useState('');
  const [editTchConfirmPassword, setEditTchConfirmPassword] = useState('');
  const [showTchModalPassword, setShowTchModalPassword] = useState(false);
  const [editTchSaving, setEditTchSaving] = useState(false);
  const [editTchNotice, setEditTchNotice] = useState<string | null>(null);
  const [editTchError, setEditTchError] = useState<string | null>(null);

  // Sync state if currentTeacher updates externally
  useEffect(() => {
    setEditTchName(currentTeacher.name);
    setEditTchEmail(currentTeacher.depEdEmail || currentTeacher.email || '');
    setEditTchSchool(currentTeacher.schoolName || '');
    setEditTchDepartment(currentTeacher.department || '');
  }, [
    currentTeacher.id,
    currentTeacher.name,
    currentTeacher.depEdEmail,
    currentTeacher.email,
    currentTeacher.schoolName,
    currentTeacher.department,
  ]);

  // Strict Scope: Teachers can view students enrolled in their class code or multi-grade class codes
  const myClassStudents = React.useMemo(() => {
    return students.filter((s) => {
      const directCode = Boolean(
        s.classCode &&
        currentTeacher.classCode &&
        s.classCode.toUpperCase() === currentTeacher.classCode.toUpperCase()
      );
      const multiCode = Boolean(
        currentTeacher.gradeClassCodes &&
        s.classCode &&
        Object.values(currentTeacher.gradeClassCodes).some(
          (c) => c && c.toUpperCase() === s.classCode.toUpperCase()
        )
      );
      const teacherMatch = Boolean(s.teacherId && s.teacherId === currentTeacher.id);
      return directCode || multiCode || teacherMatch;
    });
  }, [students, currentTeacher]);

  const pendingStudents = React.useMemo(() => {
    return myClassStudents.filter(
      (s) => s.status === 'pending' || s.enrollmentStatus === 'pending_review'
    );
  }, [myClassStudents]);

  const approvedStudents = React.useMemo(() => {
    return myClassStudents.filter(
      (s) => s.status === 'approved' && s.enrollmentStatus !== 'pending_review'
    );
  }, [myClassStudents]);

  const rejectedStudents = React.useMemo(() => {
    return myClassStudents.filter(
      (s) => s.status === 'rejected' || s.enrollmentStatus === 'rejected'
    );
  }, [myClassStudents]);

  // Overview metrics scoped strictly to this teacher's classroom
  const activeStudents = approvedStudents.filter((s) => s.isActive);
  const totalBridgesRestored = approvedStudents.reduce(
    (acc, s) =>
      acc +
      Object.values(s.progressByModule).filter((p) => p.isBridgeRestored).length,
    0
  );

  const allScores: number[] = [];
  approvedStudents.forEach((s) => {
    Object.values(s.progressByModule).forEach((p) => {
      if (p.bestScorePercent > 0) allScores.push(p.bestScorePercent);
    });
  });
  const overallAvgScore =
    allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  const totalWritingSubmissions = approvedStudents.reduce(
    (acc, s) => acc + (s.writingSubmissions?.length || 0),
    0
  );

  // Filtered active students within this teacher's class roster
  const filteredStudents = approvedStudents.filter((s) => {
    const matchesGrade = gradeFilter === 'all' || s.gradeLevel === gradeFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? s.isActive
        : !s.isActive;
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.learnerId.includes(searchQuery) ||
      (s.lrn && s.lrn.includes(searchQuery)) ||
      (s.section && s.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.schoolName && s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesStatus && matchesSearch;
  });

  // Filtered students for Enrollment Verification tab
  const filteredReviewStudents = myClassStudents.filter((s) => {
    if (reviewFilter === 'pending') {
      if (s.status !== 'pending' && s.enrollmentStatus !== 'pending_review') return false;
    } else if (reviewFilter === 'approved') {
      if (s.status !== 'approved' || s.enrollmentStatus === 'pending_review') return false;
    } else if (reviewFilter === 'rejected') {
      if (s.status !== 'rejected' && s.enrollmentStatus !== 'rejected') return false;
    }

    if (reviewSearch.trim()) {
      const q = reviewSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.learnerId.includes(q) ||
        (s.lrn && s.lrn.includes(q)) ||
        (s.section && s.section.toLowerCase().includes(q)) ||
        (s.schoolName && s.schoolName.toLowerCase().includes(q)) ||
        s.username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const [stuModalError, setStuModalError] = useState<string | null>(null);

  const handleOpenEditStudentModal = (student: StudentAccount) => {
    soundFX.playClick();
    setEditingStudent(student);
    setEditStuName(student.name);
    setEditStuGrade(student.gradeLevel);
    setEditStuLrn(student.lrn || student.learnerId || '');
    setEditStuSchool(student.schoolName || currentTeacher.schoolName || DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS[0]);
    setEditStuSection(student.section || '');
    setEditStuError(null);
    setEditStuSuccess(null);
  };

  const handleSaveStudentVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    soundFX.playClick();
    setEditStuError(null);
    setEditStuSuccess(null);

    const cleanLrn = editStuLrn.trim();
    if (!cleanLrn || cleanLrn.length !== 12 || !/^\d{12}$/.test(cleanLrn)) {
      setEditStuError('DepEd Learner Reference Number (LRN) must be exactly 12 numeric digits.');
      return;
    }

    if (!editStuSchool.trim()) {
      setEditStuError('Please select or specify the student school in DepEd Davao Oriental.');
      return;
    }

    if (!onUpdateStudent) {
      setEditStuError('Student update service is not available.');
      return;
    }

    setEditStuSaving(true);
    try {
      const res = await onUpdateStudent(editingStudent.id, {
        name: editStuName.trim(),
        gradeLevel: editStuGrade,
        lrn: cleanLrn,
        learnerId: cleanLrn,
        schoolName: editStuSchool.trim(),
        section: editStuSection.trim(),
      });

      if (res.success && res.student) {
        soundFX.playBridgeRestored();
        setEditStuSuccess(`Successfully updated learner details for ${res.student.name}!`);
        // If the drilldown modal is open for this student, sync it
        if (selectedStudentForDrillDown && selectedStudentForDrillDown.id === res.student.id) {
          setSelectedStudentForDrillDown(res.student);
        }
        setTimeout(() => {
          setEditingStudent(null);
          setEditStuSuccess(null);
        }, 1200);
      } else {
        setEditStuError(res.error || 'Failed to update student grade level and verification.');
      }
    } catch (err: any) {
      setEditStuError(err?.message || 'Failed to save student changes.');
    } finally {
      setEditStuSaving(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStuModalError(null);
    if (!newStuName || !newStuLearnerId || !newStuUsername || !newStuPassword) {
      setStuModalError('Please fill out all required fields.');
      return;
    }
    const cleanEmail = newStuEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setStuModalError('Please enter a valid student email address for password recovery.');
      return;
    }
    soundFX.playClick();
    try {
      await onAddStudent({
        name: newStuName.trim(),
        email: cleanEmail,
        gradeLevel: newStuGrade,
        section: newStuSection.trim(),
        username: newStuUsername.trim(),
        password: newStuPassword,
        lrn: newStuLearnerId.trim(),
      });
    } catch (error) {
      setStuModalError((error as Error).message);
      return;
    }
    setShowAddStudentModal(false);
    setNewStuName('');
    setNewStuEmail('');
    setNewStuLearnerId('');
    setNewStuUsername('');
    setStuModalError(null);
  };

  const handleSaveTeacherProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setEditTchError(null);
    setEditTchNotice(null);

    const cleanName = editTchName.trim();
    const cleanEmail = editTchEmail.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setEditTchError('Teacher name must be at least 2 characters long.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEditTchError('Please enter a valid DepEd or official email address for password recovery.');
      return;
    }

    if (editTchNewPassword.trim().length > 0) {
      if (editTchNewPassword.trim().length < 4) {
        setEditTchError('New password must be at least 4 characters long.');
        return;
      }
      if (editTchNewPassword !== editTchConfirmPassword) {
        setEditTchError('New password and confirm password do not match.');
        return;
      }
    }

    if (!onUpdateTeacherProfile) {
      setEditTchError('Profile update function not available.');
      return;
    }

    setEditTchSaving(true);
    try {
      const updates: {
        name?: string;
        depEdEmail?: string;
        password?: string;
        schoolName?: string;
        department?: string;
      } = {
        name: cleanName,
        depEdEmail: cleanEmail,
        schoolName: editTchSchool.trim(),
        department: editTchDepartment.trim(),
      };
      if (editTchNewPassword.trim().length >= 4) {
        updates.password = editTchNewPassword.trim();
      }

      const res = await onUpdateTeacherProfile(updates);
      if (res.success) {
        soundFX.playPass();
        setEditTchNotice('Faculty credentials and recovery email updated successfully!');
        setEditTchNewPassword('');
        setEditTchConfirmPassword('');
        setTimeout(() => {
          setEditTchNotice(null);
          setShowEditProfileModal(false);
        }, 1500);
      } else {
        soundFX.playIncorrect();
        setEditTchError(res.error || 'Failed to update credentials.');
      }
    } catch (err: any) {
      setEditTchError(err?.message || 'An error occurred while updating profile.');
    } finally {
      setEditTchSaving(false);
    }
  };

  const handleOpenVerifyModal = (student: StudentAccount) => {
    soundFX.playClick();
    setVerifyingStudent(student);
    setVerifyName(student.name);
    setVerifyLrn(student.lrn || student.learnerId || '');
    setVerifyGrade(student.gradeLevel);
    setVerifySchool(student.schoolName || currentTeacher.schoolName || DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS[0]);
    setVerifySection(student.section || '');
    setVerifyNote(student.enrollmentReviewNote || '');
    setVerifyError(null);
    setVerifySuccess(null);
  };

  const handleQuickApprove = async (student: StudentAccount) => {
    soundFX.playPass();
    if (onReviewStudent) {
      await onReviewStudent(
        student.id,
        'approve',
        undefined,
        'Learner information verified and enrollment confirmed by class teacher.'
      );
      soundFX.playBridgeRestored();
    } else if (onUpdateStudent) {
      await onUpdateStudent(student.id, { name: student.name });
    }
  };

  const handleSaveVerifiedEnrollment = async (action: 'approve' | 'save_only') => {
    if (!verifyingStudent) return;
    soundFX.playClick();
    setVerifyError(null);
    setVerifySuccess(null);

    const cleanLrn = verifyLrn.trim();
    if (!cleanLrn || cleanLrn.length !== 12 || !/^\d{12}$/.test(cleanLrn)) {
      setVerifyError('DepEd Learner Reference Number (LRN) must be exactly 12 numeric digits.');
      return;
    }

    if (!verifyName.trim()) {
      setVerifyError('Please enter the student\'s complete legal name.');
      return;
    }

    setIsSavingReview(true);
    try {
      if (onReviewStudent) {
        const res = await onReviewStudent(
          verifyingStudent.id,
          action === 'approve' ? 'approve' : 'approve',
          {
            name: verifyName.trim(),
            lrn: cleanLrn,
            gradeLevel: verifyGrade,
            schoolName: verifySchool.trim(),
            section: verifySection.trim(),
          },
          verifyNote.trim() || 'Learner information reviewed, corrected, and verified by class teacher.'
        );

        if (res.success) {
          soundFX.playBridgeRestored();
          setVerifySuccess(`Enrollment verified successfully for ${verifyName.trim()}!`);
          setTimeout(() => {
            setVerifyingStudent(null);
            setVerifySuccess(null);
          }, 1200);
        } else {
          setVerifyError(res.error || 'Failed to verify student enrollment.');
        }
      } else if (onUpdateStudent) {
        await onUpdateStudent(verifyingStudent.id, {
          name: verifyName.trim(),
          lrn: cleanLrn,
          gradeLevel: verifyGrade,
          schoolName: verifySchool.trim(),
          section: verifySection.trim(),
        });
        setVerifySuccess('Student details updated.');
        setTimeout(() => {
          setVerifyingStudent(null);
          setVerifySuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setVerifyError(err?.message || 'An error occurred while saving student details.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleConfirmRejectStudent = async () => {
    if (!rejectingStudent) return;
    try {
      setIsRejecting(true);
      soundFX.playIncorrect();
      if (onReviewStudent) {
        await onReviewStudent(
          rejectingStudent.id,
          'reject',
          undefined,
          rejectReason.trim() || 'Enrollment rejected due to inaccurate information.'
        );
      }
      setRejectingStudent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Top Banner in Deep Navy Theme */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] rounded-3xl text-white relative overflow-hidden border-2 border-[#231F20] linocut-card animate-dashboard-hero">
        <InabelHeaderStrip variant="royal" label="DepEd Davao Oriental • Faculty Academic Monitoring Console" />
        <div className="p-6 sm:p-8 relative">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-950/60 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-800/60">
                DepEd Davao Oriental • Faculty Portal
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {currentTeacher.staffRole}: {currentTeacher.name}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-mono">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                {currentTeacher.depEdEmail || currentTeacher.email || 'Email not linked'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-sky-400" />
              English Academic Monitoring Console
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Track student bridge unlocks, assess quiz mastery distributions, evaluate AI composition submissions, and manage learner credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Prominent Class Code Card */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 border border-white/20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                  Your Unique Class Code
                </span>
                <span className="text-base font-mono font-black text-amber-300 tracking-wider">
                  {currentTeacher.classCode || 'NO CODE'}
                </span>
              </div>
              {currentTeacher.classCode && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    navigator.clipboard.writeText(currentTeacher.classCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-[11px] font-bold border border-sky-400/30 transition cursor-pointer"
                  data-guide-target="class-code"
                  title="Copy class code to share with students"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('class_analytics');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition cursor-pointer"
              title="Inspect class performance analytics, mastery distributions and competencies"
            >
              <BarChart2 className="w-4 h-4 text-white" />
              <span>Class Performance Analytics</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setEditTchName(currentTeacher.name);
                setEditTchEmail(currentTeacher.depEdEmail || currentTeacher.email || '');
                setEditTchSchool(currentTeacher.schoolName || '');
                setEditTchDepartment(currentTeacher.department || '');
                setEditTchNewPassword('');
                setEditTchConfirmPassword('');
                setEditTchError(null);
                setEditTchNotice(null);
                setShowEditProfileModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
              title="Edit Faculty Profile & Recovery Email"
            >
              <Key className="w-4 h-4" />
              <span>Faculty Credentials & Email</span>
            </button>

            {onPreviewIslandMap && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onPreviewIslandMap();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-sm transition cursor-pointer"
                title="Preview student archipelago map, all grade levels, modules, and quizzes"
              >
                <Compass className="w-4 h-4 text-sky-300" />
                <span>Preview Islands Map (Grades 7–10)</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFX.playClick();
                setShowAddStudentModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Enroll Student
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-dashboard-stats">
        {/* Metric 1: Total Enrolled */}
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card transition-all duration-300 hover:-translate-y-0.5">
          <InabelHeaderStrip variant="royal" height={12} />
          <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-[#231F20]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-800">{myClassStudents.length}</span>
            <span className="text-xs text-emerald-600 font-semibold">({activeStudents.length} Active)</span>
          </div>
          <p className="text-[11px] text-slate-400">Linked to Class Code: {currentTeacher.classCode || 'Pending'}</p>
          </div>
        </div>

        {/* Metric 2: Restored Bridges */}
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
          <InabelHeaderStrip variant="emerald" height={12} />
          <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bridges Restored
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-[#231F20]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600">{totalBridgesRestored}</span>
            <span className="text-xs text-slate-400 font-medium">Bridges</span>
          </div>
          <p className="text-[11px] text-slate-400">Successfully unlocked across all islands</p>
          </div>
        </div>

        {/* Metric 3: Class Quiz Average */}
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
          <InabelHeaderStrip variant="indigo" height={12} />
          <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Division Quiz Average
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-[#231F20]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-indigo-600">{overallAvgScore}%</span>
            <span className="text-xs text-emerald-600 font-semibold">Passing Standard: 75%</span>
          </div>
          <p className="text-[11px] text-slate-400">Based on all completed module quizzes</p>
          </div>
        </div>

        {/* Metric 4: AI Writing Reviews */}
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card">
          <InabelHeaderStrip variant="amber" height={12} />
          <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Writing Submissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-[#231F20]">
              <Feather className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600">
              {totalWritingSubmissions}
            </span>
            <span className="text-xs text-slate-400 font-medium">Evaluations</span>
          </div>
          <p className="text-[11px] text-slate-400">Constructive feedback generated by AI</p>
          </div>
        </div>
      </div>

      {/* Main Roster & Staff Management Section */}
      <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-6">
        <InabelHeaderStrip variant="royal" label="Class Roster, Analytics & Faculty Management" />
        <div className="px-6 pb-6 space-y-6">
        {/* Class Code Student Onboarding Guide Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  Unique Class Code for Student Registration
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Approved & Active
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Instruct your students to sign up at LingoQuest and enter this class code. Their accounts will automatically connect to your classroom roster.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-xs shrink-0">
            <span className="text-base font-mono font-black text-blue-700 tracking-wider">
              {currentTeacher.classCode || 'NO CODE'}
            </span>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                if (currentTeacher.classCode) {
                  navigator.clipboard.writeText(currentTeacher.classCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Pending Student Review Alert Banner */}
        {pendingStudents.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Action Required • Student Enrollment Review
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {pendingStudents.length} Pending
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-0.5">
                  {pendingStudents.length} student{pendingStudents.length > 1 ? 's' : ''} recently enrolled using your class code (<strong>{currentTeacher.classCode}</strong>). Review their DepEd LRN, grade level, and school info to confirm accuracy before verifying.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('review');
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Review Enrolled Students ({pendingStudents.length})
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              data-guide-target="roster"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('students');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active Roster ({filteredStudents.length})
            </button>
            <button
              data-guide-target="analytics"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('class_analytics');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'class_analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Class Performance Analytics ({classAnalyticsKPIs.totalStudents})
            </button>
            <button
              data-guide-target="review"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('review');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'review'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Review Enrolled Students
              {pendingStudents.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  {pendingStudents.length}
                </span>
              )}
            </button>
            <button
              data-guide-target="modules"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('modules');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'modules'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Modules & Quiz Answer Keys ({allModules.length})
            </button>
            <button
              data-guide-target="class-map"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('island_map');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'island_map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Class Archipelago Map
            </button>
          </div>

          {activeTab === 'students' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Grade filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 7, 8, 9, 10] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(g)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                      gradeFilter === g
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {g === 'all' ? 'All Grades' : `Gr. ${g}`}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'active', 'inactive'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold capitalize transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, LRN, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Students Roster Table */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto animate-dashboard-panel">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Student & LRN</th>
                  <th className="py-3 px-3">Grade & Section</th>
                  <th className="py-3 px-3">Bridges Restored</th>
                  <th className="py-3 px-3">Quiz Average</th>
                  <th className="py-3 px-3">Writing AI</th>
                  <th className="py-3 px-3">Points</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
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

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-xs">{st.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          LRN: {st.learnerId} • @{st.username}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">Grade {st.gradeLevel}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudentModal(st)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                            title="Change student grade level, verify LRN & school"
                          >
                            <Edit className="w-2.5 h-2.5 text-amber-700" />
                            Change
                          </button>
                        </div>
                        <span className="text-slate-400 text-[11px] block truncate max-w-[160px]" title={st.schoolName || st.section}>
                          {st.schoolName || (st.section ? `Sec: ${st.section}` : 'DepEd Davao Oriental')}
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
                        {st.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditStudentModal(st)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                            title="Edit student grade level, LRN, and school"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              setSelectedStudentForDrillDown(st);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                            title="Drill-down performance analytics"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onSwitchToStudentView(st);
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold transition cursor-pointer"
                            title="Preview student island experience"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onToggleStudentStatus(st.id);
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              st.isActive
                                ? 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title={st.isActive ? 'Deactivate student account' : 'Activate student account'}
                          >
                            {st.isActive ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 1.5: CLASS PERFORMANCE ANALYTICS & MASTERY DASHBOARD */}
        {/* ================================================================ */}
        {activeTab === 'class_analytics' && (
          <div className="space-y-6 animate-dashboard-panel">
            {/* Header & Subview Navigator */}
            <div className="lq-woven-card lq-woven-pad-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-[#0B1E36] text-white p-6 rounded-3xl border border-indigo-400/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                    <BarChart2 className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h2 className="text-xl font-display font-black">
                    Class Performance Analytics & Mastery Console
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    Class {currentTeacher.classCode}
                  </span>
                </div>
                <p className="text-xs text-indigo-200 max-w-3xl leading-relaxed">
                  Real-time academic evaluation for <strong>{currentTeacher.name}</strong> ({currentTeacher.schoolName || 'DepEd Davao Oriental'}). Inspect learning mastery, bridge repairs, quiz bottlenecks, and AI writing scores for your own class.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer shadow-xs"
                  title="Print or save class performance analytics report"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Sub-navigation & Filters Toolbar */}
            <div className="lq-woven-card lq-woven-pad-4 bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* 3 Analytics Sub-tabs */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setAnalyticsSubView('summary');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      analyticsSubView === 'summary'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Class Summary & KPIs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setAnalyticsSubView('competencies');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      analyticsSubView === 'competencies'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Competency Bottlenecks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setAnalyticsSubView('students');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      analyticsSubView === 'students'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Learner Mastery Matrix ({filteredAnalyticsStudents.length})</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search learner name or LRN..."
                    value={analyticsSearch}
                    onChange={(e) => setAnalyticsSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  {analyticsSearch && (
                    <button
                      onClick={() => setAnalyticsSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Row: Grade, Section, and Sorting */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Grade Level Filter */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Grade:
                    </span>
                    {(['all', 7, 8, 9, 10] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          soundFX.playClick();
                          setAnalyticsGradeFilter(g);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                          analyticsGradeFilter === g
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {g === 'all' ? 'All' : `Gr. ${g}`}
                      </button>
                    ))}
                  </div>

                  {/* Section Filter */}
                  {classSections.length > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <School className="w-3 h-3" /> Section:
                      </span>
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setAnalyticsSectionFilter('all');
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                          analyticsSectionFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        All
                      </button>
                      {classSections.map((sec) => (
                        <button
                          key={sec}
                          onClick={() => {
                            soundFX.playClick();
                            setAnalyticsSectionFilter(sec);
                          }}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                            analyticsSectionFilter === sec
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Option for Matrix */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-400">Sort Matrix:</span>
                  <select
                    value={analyticsSortBy}
                    onChange={(e) => setAnalyticsSortBy(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="score">Highest Quiz Mastery %</option>
                    <option value="points">Total Points (XP)</option>
                    <option value="modules">Modules Completed</option>
                    <option value="writing">AI Writing Submissions</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty Class Notice */}
            {filteredAnalyticsStudents.length === 0 ? (
              <div className="lq-woven-card lq-woven-pad-12 bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No learners match your current filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Adjust your grade, section, or search filters above to inspect your class performance.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setAnalyticsGradeFilter('all');
                    setAnalyticsSectionFilter('all');
                    setAnalyticsSearch('');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Reset Analytics Filters
                </button>
              </div>
            ) : (
              <>
                {/* ---------------------------------------------------- */}
                {/* SUBVIEW 1: EXECUTIVE CLASS SUMMARY & KPIS */}
                {/* ---------------------------------------------------- */}
                {analyticsSubView === 'summary' && (
                  <div className="space-y-6">
                    {/* 5 Class KPI Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                      {/* KPI 1: Class Mastery Average */}
                      <div className="lq-woven-card lq-woven-pad-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Class Mastery</span>
                          <Award className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-2xl sm:text-3xl font-black font-mono ${
                              classAnalyticsKPIs.classAverageScore >= 80
                                ? 'text-emerald-600'
                                : classAnalyticsKPIs.classAverageScore >= 70
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {classAnalyticsKPIs.classAverageScore}%
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Avg</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              classAnalyticsKPIs.classAverageScore >= 80
                                ? 'bg-emerald-500'
                                : classAnalyticsKPIs.classAverageScore >= 70
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(classAnalyticsKPIs.classAverageScore, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">All completed quizzes</div>
                      </div>

                      {/* KPI 2: Total Learners */}
                      <div className="lq-woven-card lq-woven-pad-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Enrolled Learners</span>
                          <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                          {classAnalyticsKPIs.totalStudents}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          <span>{classAnalyticsKPIs.activeStudents} active learners</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Under code {currentTeacher.classCode}</div>
                      </div>

                      {/* KPI 3: Modules Completed */}
                      <div className="lq-woven-card lq-woven-pad-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Modules Mastered</span>
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
                          {classAnalyticsKPIs.totalCompletedModules}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          {(classAnalyticsKPIs.totalCompletedModules / (classAnalyticsKPIs.totalStudents || 1)).toFixed(1)} per learner
                        </div>
                        <div className="text-[10px] text-slate-400">English MELC lessons</div>
                      </div>

                      {/* KPI 4: Bridges Restored */}
                      <div className="lq-woven-card lq-woven-pad-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Bridges Restored</span>
                          <Compass className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600">
                          {classAnalyticsKPIs.totalRestoredBridges}
                        </div>
                        <div className="text-[10px] text-amber-800 font-medium">Island milestones</div>
                        <div className="text-[10px] text-slate-400">Passing score threshold</div>
                      </div>

                      {/* KPI 5: AI Writing Lab */}
                      <div className="lq-woven-card lq-woven-pad-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>AI Writing Lab</span>
                          <Feather className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-purple-700">
                          {classAnalyticsKPIs.totalWritingSubmissions}
                        </div>
                        <div className="text-[10px] text-purple-700 font-semibold">
                          Avg Clarity: {classAnalyticsKPIs.averageWritingClarity}/100
                        </div>
                        <div className="text-[10px] text-slate-400">Essays analyzed</div>
                      </div>
                    </div>

                    {/* Class Proficiency Tier Breakdown */}
                    <div className="lq-woven-card lq-woven-pad-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            Class Proficiency & Mastery Distribution
                          </h3>
                          <p className="text-xs text-slate-500">
                            Categorization of your {classAnalyticsKPIs.totalStudents} learners based on DepEd performance thresholds.
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 self-start sm:self-auto">
                          Class Code: {currentTeacher.classCode}
                        </span>
                      </div>

                      {/* Visual Stacked Distribution Bar */}
                      <div className="space-y-1.5">
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          {classAnalyticsKPIs.totalStudents > 0 && (
                            <>
                              <div
                                style={{
                                  width: `${(classAnalyticsKPIs.highMasteryCount / classAnalyticsKPIs.totalStudents) * 100}%`,
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 transition"
                                title={`High Mastery: ${classAnalyticsKPIs.highMasteryCount} students`}
                              />
                              <div
                                style={{
                                  width: `${(classAnalyticsKPIs.proficientCount / classAnalyticsKPIs.totalStudents) * 100}%`,
                                }}
                                className="bg-sky-500 hover:bg-sky-600 transition"
                                title={`Proficient: ${classAnalyticsKPIs.proficientCount} students`}
                              />
                              <div
                                style={{
                                  width: `${(classAnalyticsKPIs.needsSupportCount / classAnalyticsKPIs.totalStudents) * 100}%`,
                                }}
                                className="bg-amber-400 hover:bg-amber-500 transition"
                                title={`Needs Support: ${classAnalyticsKPIs.needsSupportCount} students`}
                              />
                            </>
                          )}
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>0%</span>
                          <span>100% Class Distribution</span>
                        </div>
                      </div>

                      {/* 3 Tier Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                        {/* Tier 1: High Mastery */}
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> High Mastery (85%+)
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-200 text-emerald-900">
                              {classAnalyticsKPIs.totalStudents > 0
                                ? Math.round((classAnalyticsKPIs.highMasteryCount / classAnalyticsKPIs.totalStudents) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="text-2xl font-black font-mono text-emerald-800">
                            {classAnalyticsKPIs.highMasteryCount}{' '}
                            <span className="text-xs font-normal text-emerald-700">learners</span>
                          </div>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            Excellent grasp of Davao Oriental English competencies. Ready for enrichment writing tasks and peer mentoring.
                          </p>
                        </div>

                        {/* Tier 2: Proficient */}
                        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Proficient (75%–84%)
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-sky-200 text-sky-900">
                              {classAnalyticsKPIs.totalStudents > 0
                                ? Math.round((classAnalyticsKPIs.proficientCount / classAnalyticsKPIs.totalStudents) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="text-2xl font-black font-mono text-sky-800">
                            {classAnalyticsKPIs.proficientCount}{' '}
                            <span className="text-xs font-normal text-sky-700">learners</span>
                          </div>
                          <p className="text-[11px] text-sky-800 leading-relaxed">
                            Meeting DepEd curriculum passing criteria reliably. Continue practice on difficult quiz game formats.
                          </p>
                        </div>

                        {/* Tier 3: Developing */}
                        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs Support (&lt;75%)
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900">
                              {classAnalyticsKPIs.totalStudents > 0
                                ? Math.round((classAnalyticsKPIs.needsSupportCount / classAnalyticsKPIs.totalStudents) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="text-2xl font-black font-mono text-amber-800">
                            {classAnalyticsKPIs.needsSupportCount}{' '}
                            <span className="text-xs font-normal text-amber-700">learners</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Recommended for remedial attention. Click "Learner Mastery Matrix" below to inspect their individual bottleneck questions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Davao Oriental Archipelago Island / Quarter Breakdown */}
                    <div className="lq-woven-card lq-woven-pad-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-blue-600" />
                            Curriculum Archipelago Quarter & Island Mastery
                          </h3>
                          <p className="text-xs text-slate-500">
                            Track how your students progress through each quarter's themed island in Davao Oriental.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setActiveTab('island_map');
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
                        >
                          Open Visual Map
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {classQuarterAnalytics.map((qa) => (
                          <div
                            key={qa.quarter}
                            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-xs"
                                style={{ backgroundColor: qa.themeColor }}
                              >
                                Quarter {qa.quarter}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-500">
                                {qa.totalModules} Modules
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-black font-display text-slate-900 truncate">
                                {qa.islandName}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate">{qa.municipality}</p>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-slate-500">Class Progress</span>
                                <span className="text-slate-900">{qa.completionRate}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${qa.completionRate}%`,
                                    backgroundColor: qa.themeColor,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Avg Score</span>
                                <span className="font-bold text-slate-800">
                                  {qa.avgScore > 0 ? `${qa.avgScore}%` : 'No attempts'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Learners</span>
                                <span className="font-bold text-slate-800">
                                  {qa.studentCompletedAny} / {classAnalyticsKPIs.totalStudents}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Teaching Recommendations */}
                    <div className="lq-woven-card lq-woven-pad-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-200 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Teacher Insights & Instructional Recommendations</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                        <div className="p-3.5 bg-white/80 rounded-2xl border border-indigo-100 space-y-1">
                          <strong className="text-indigo-900 block font-bold">Bridge Restoration Velocity</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {classAnalyticsKPIs.totalRestoredBridges > 0
                              ? `Your class has restored ${classAnalyticsKPIs.totalRestoredBridges} bridges. Learners are progressing steadily through Davao Oriental landmarks.`
                              : 'No bridges restored yet. Encourage students to achieve at least 75% on module quizzes to rebuild island bridges.'}
                          </p>
                        </div>

                        <div className="p-3.5 bg-white/80 rounded-2xl border border-indigo-100 space-y-1">
                          <strong className="text-indigo-900 block font-bold">AI Writing Feedback Action</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {classAnalyticsKPIs.totalWritingSubmissions > 0
                              ? `Average composition clarity is ${classAnalyticsKPIs.averageWritingClarity}/100. Review highlighted construction errors in the writing lab tab.`
                              : 'Encourage students to practice in the AI Writing Lab to build sentence variety and vocabulary confidence.'}
                          </p>
                        </div>

                        <div className="p-3.5 bg-white/80 rounded-2xl border border-indigo-100 space-y-1">
                          <strong className="text-indigo-900 block font-bold">Targeted Intervention</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {classAnalyticsKPIs.needsSupportCount > 0
                              ? `${classAnalyticsKPIs.needsSupportCount} learner(s) scored below 75%. Schedule peer pairing with High Mastery students for upcoming quizzes.`
                              : 'All active learners are performing at or above the 75% passing threshold! Excellent instructional delivery.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SUBVIEW 2: MELC COMPETENCIES & BOTTLENECK RADAR */}
                {/* ---------------------------------------------------- */}
                {analyticsSubView === 'competencies' && (
                  <div className="space-y-4">
                    <div className="lq-woven-card lq-woven-pad-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900">
                          English MELC Competencies & Quiz Performance
                        </h3>
                        <p className="text-xs text-slate-500">
                          Class average scores, completion rates, and curriculum bottleneck alerts for each module.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {classModuleAnalytics.filter((m) => m.isBottleneck).length} Bottleneck(s)
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {classModuleAnalytics.filter((m) => m.isMastered).length} Mastered
                        </span>
                      </div>
                    </div>

                    <div className="lq-woven-card lq-woven-pad-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                              <th className="py-3.5 px-4">Module & Topic</th>
                              <th className="py-3.5 px-3">Island / Quarter</th>
                              <th className="py-3.5 px-3">Class Completion</th>
                              <th className="py-3.5 px-3">Average Score</th>
                              <th className="py-3.5 px-3">Competency Status</th>
                              <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {classModuleAnalytics.map((item) => (
                              <tr key={item.module.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900">{item.module.title}</div>
                                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                    {item.module.lessonContent?.melcCompetency || 'MELC Competency'}
                                  </div>
                                </td>

                                <td className="py-3.5 px-3">
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                                    style={{ backgroundColor: getDavaoOrientalIsland(item.module.quarter).themeColor }}
                                  >
                                    Q{item.module.quarter} • {item.module.islandName}
                                  </span>
                                </td>

                                <td className="py-3.5 px-3">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-slate-600">{item.completionRate}%</span>
                                      <span className="text-slate-400">
                                        {item.completedCount}/{filteredAnalyticsStudents.length}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${item.completionRate}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-3">
                                  {item.avgScore > 0 ? (
                                    <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                                      <span
                                        className={
                                          item.avgScore >= 80
                                            ? 'text-emerald-600'
                                            : item.avgScore >= 70
                                            ? 'text-blue-600'
                                            : 'text-rose-600'
                                        }
                                      >
                                        {item.avgScore}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">No attempts</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-3">
                                  {item.isBottleneck ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Bottleneck
                                    </span>
                                  ) : item.isMastered ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> High Mastery
                                    </span>
                                  ) : item.avgScore >= 75 ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                      <Check className="w-3 h-3 text-sky-600" /> On Track
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      In Progress
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundFX.playClick();
                                      setActiveTab('modules');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                                  >
                                    View Key
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SUBVIEW 3: LEARNER MASTERY MATRIX & LEADERBOARD */}
                {/* ---------------------------------------------------- */}
                {analyticsSubView === 'students' && (
                  <div className="space-y-4">
                    <div className="lq-woven-card lq-woven-pad-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900">
                          Learner Performance Roster & Mastery Breakdown
                        </h3>
                        <p className="text-xs text-slate-500">
                          Individual student diagnostic records for class <strong>{currentTeacher.classCode}</strong>. Click any student to drill down into their quiz attempts and AI writing essays.
                        </p>
                      </div>
                      <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        {filteredAnalyticsStudents.length} Assigned records
                      </div>
                    </div>

                    <div className="lq-woven-card lq-woven-pad-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                              <th className="py-3.5 px-4">Student</th>
                              <th className="py-3.5 px-3">LRN / DepEd ID</th>
                              <th className="py-3.5 px-3">Grade & Section</th>
                              <th className="py-3.5 px-3">Quiz Average</th>
                              <th className="py-3.5 px-3">Bridges</th>
                              <th className="py-3.5 px-3">AI Writing</th>
                              <th className="py-3.5 px-3">XP Points</th>
                              <th className="py-3.5 px-3">Proficiency Tier</th>
                              <th className="py-3.5 px-4 text-right">Drill Down</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredAnalyticsStudents.map((st, index) => {
                              const scores = Object.values(st.progressByModule)
                                .map((p) => p.bestScorePercent)
                                .filter((sc) => sc > 0);
                              const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                              const bridges = Object.values(st.progressByModule).filter((p) => p.isBridgeRestored).length;
                              const writingCount = st.writingSubmissions?.length || 0;

                              const isHighMastery = avg >= 85;
                              const isProficient = avg >= 75 && avg < 85;

                              return (
                                <tr key={st.id} className="hover:bg-slate-50/70 transition">
                                  {/* Student */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <div className="font-bold text-slate-900">{st.name}</div>
                                        <div className="text-[11px] text-slate-400">@{st.username}</div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* LRN */}
                                  <td className="py-3.5 px-3">
                                    <span className="font-mono text-slate-700 font-bold">
                                      {st.lrn || st.learnerId || 'N/A'}
                                    </span>
                                  </td>

                                  {/* Grade & Section */}
                                  <td className="py-3.5 px-3">
                                    <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                      Gr. {st.gradeLevel} {st.section ? `• ${st.section}` : ''}
                                    </span>
                                  </td>

                                  {/* Quiz Average */}
                                  <td className="py-3.5 px-3">
                                    {avg > 0 ? (
                                      <div className="space-y-1">
                                        <div className="font-bold font-mono text-xs text-slate-800">{avg}%</div>
                                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${
                                              avg >= 80
                                                ? 'bg-emerald-500'
                                                : avg >= 70
                                                ? 'bg-blue-500'
                                                : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${avg}%` }}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic text-[11px]">No attempts</span>
                                    )}
                                  </td>

                                  {/* Bridges */}
                                  <td className="py-3.5 px-3">
                                    <span className="font-mono font-bold text-amber-600 flex items-center gap-1">
                                      <Compass className="w-3.5 h-3.5" />
                                      {bridges}
                                    </span>
                                  </td>

                                  {/* AI Writing */}
                                  <td className="py-3.5 px-3">
                                    <span className="font-mono font-bold text-purple-700 flex items-center gap-1">
                                      <Feather className="w-3.5 h-3.5" />
                                      {writingCount}
                                    </span>
                                  </td>

                                  {/* XP Points */}
                                  <td className="py-3.5 px-3">
                                    <span className="font-mono font-black text-slate-900">
                                      {(st.points || 0).toLocaleString()}
                                    </span>
                                  </td>

                                  {/* Proficiency Tier */}
                                  <td className="py-3.5 px-3">
                                    {isHighMastery ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        <Sparkles className="w-3 h-3 text-emerald-600" /> High Mastery
                                      </span>
                                    ) : isProficient ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                        <CheckCircle2 className="w-3 h-3 text-sky-600" /> Proficient
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Support
                                      </span>
                                    )}
                                  </td>

                                  {/* Drilldown */}
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        soundFX.playClick();
                                        setSelectedStudentForDrillDown(st);
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer border border-indigo-200"
                                      title="Inspect student quiz answers, module progress, and AI writing submissions"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Drill Down</span>
                                    </button>
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
              </>
            )}
          </div>
        )}

        {/* Tab 2: Review Enrolled Students */}
        {activeTab === 'review' && (
          <div className="space-y-4 animate-dashboard-panel">
            {/* Review filters & search */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {[
                  {
                    id: 'pending',
                    label: 'Pending Review',
                    count: pendingStudents.length,
                    badgeColor: 'bg-amber-500 text-white',
                  },
                  {
                    id: 'approved',
                    label: 'Approved Enrolled',
                    count: approvedStudents.length,
                    badgeColor: 'bg-emerald-600 text-white',
                  },
                  {
                    id: 'rejected',
                    label: 'Flagged / Rejected',
                    count: rejectedStudents.length,
                    badgeColor: 'bg-rose-500 text-white',
                  },
                  {
                    id: 'all',
                    label: 'All Enrolled',
                    count: myClassStudents.length,
                    badgeColor: 'bg-slate-500 text-white',
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      soundFX.playClick();
                      setReviewFilter(f.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      reviewFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${f.badgeColor}`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, LRN, section..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium w-64"
                />
              </div>
            </div>

            {/* Guidance banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>DepEd Order No. 34 / LIS Masterlist Verification Protocol:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Confirm that each student's 12-digit Learner Reference Number (LRN), official grade level ({teacherAssignedGrades.map((g) => `Grade ${g}`).join(', ')}), and school match official enrollment forms. You can correct discrepancies before confirming or reject unauthorized registrations.
                </p>
              </div>
            </div>

            {/* Review Cards list */}
            {filteredReviewStudents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Students in this Review Category</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  {reviewFilter === 'pending'
                    ? 'All student enrollments using your class code have been reviewed and verified!'
                    : 'No student records match the selected review filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredReviewStudents.map((st) => {
                  const isLrnValid12 = Boolean(
                    st.lrn && st.lrn.length === 12 && /^\d{12}$/.test(st.lrn)
                  );
                  const isGradeMatching = teacherAssignedGrades.includes(st.gradeLevel);
                  const isPending =
                    st.status === 'pending' || st.enrollmentStatus === 'pending_review';
                  const isRejected =
                    st.status === 'rejected' || st.enrollmentStatus === 'rejected';

                  return (
                    <div
                      key={st.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition ${
                        isPending
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : isRejected
                          ? 'bg-rose-50/30 border-rose-200'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">
                              @{st.username}
                            </span>

                            {isPending && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                                <Clock className="w-3 h-3" /> Needs Review
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                <XCircle className="w-3 h-3" /> Enrollment Flagged
                              </span>
                            )}
                            {!isPending && !isRejected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Verified & Active
                              </span>
                            )}
                          </div>

                          {/* Data points */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                            {/* LRN Check */}
                            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[11px] text-slate-400 block font-semibold">DepEd LRN:</span>
                              <span className="font-mono font-bold text-slate-800 text-xs block truncate mt-0.5">
                                {st.lrn || st.learnerId || 'Not set'}
                              </span>
                              {isLrnValid12 ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold mt-1">
                                  <Check className="w-2.5 h-2.5" /> 12 Digits Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-600 font-bold mt-1">
                                  <AlertCircle className="w-2.5 h-2.5" /> Invalid LRN Format
                                </span>
                              )}
                            </div>

                            {/* Grade Level Check */}
                            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[11px] text-slate-400 block font-semibold">Enrolled Grade:</span>
                              <span className="font-bold text-slate-800 text-xs block mt-0.5">
                                Grade {st.gradeLevel}
                              </span>
                              {isGradeMatching ? (
                                <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                                  ✓ Matches Class Grade
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-700 font-bold mt-1 block">
                                  ⚠️ Grade Mismatch
                                </span>
                              )}
                            </div>

                            {/* Section */}
                            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[11px] text-slate-400 block font-semibold">Section & Code:</span>
                              <span className="font-bold text-slate-800 text-xs block truncate mt-0.5">
                                {st.section || 'Unassigned'}
                              </span>
                              <span className="text-[10px] font-mono text-blue-700 font-bold truncate block mt-0.5">
                                Code: {st.classCode}
                              </span>
                            </div>

                            {/* School */}
                            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[11px] text-slate-400 block font-semibold">School Station:</span>
                              <span
                                className="font-medium text-slate-700 text-xs block truncate mt-0.5"
                                title={st.schoolName}
                              >
                                {st.schoolName || 'DepEd Davao Oriental'}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Enrolled: {st.joinedDate}
                              </span>
                            </div>
                          </div>

                          {/* Review Note display if any */}
                          {st.enrollmentReviewNote && (
                            <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/80 mt-1.5 flex items-start gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-700">Verification Note:</strong>{' '}
                                {st.enrollmentReviewNote}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col lg:flex-row items-center gap-2 shrink-0">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(st)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Confirm enrollment and activate student"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Enroll
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenVerifyModal(st)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs transition cursor-pointer"
                            title="Review and correct student information before confirming"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-700" />
                            {isPending ? 'Review & Edit Info' : 'Edit Information'}
                          </button>

                          {!isRejected && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setRejectingStudent(st);
                                setRejectReason(
                                  !isLrnValid12
                                    ? 'DepEd Learner Reference Number (LRN) does not match valid 12-digit format.'
                                    : !isGradeMatching
                                    ? `Grade level mismatch: student enrolled in Grade ${st.gradeLevel}, but class handles Grade ${teacherAssignedGrades.join(', ')}.`
                                    : 'Student name or LRN could not be validated on the official school section masterlist.'
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                              title="Flag or decline enrollment with reason"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Flag / Reject
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(st)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Re-Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Curriculum Modules & Master Quiz Answer Keys on Assigned Grade */}
        {activeTab === 'modules' && (
          <div className="pt-2 space-y-4 animate-dashboard-panel">
            {onPreviewIslandMap && (
              <div className="lq-woven-card lq-woven-pad-4 bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-4 sm:p-5 rounded-3xl border border-sky-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
                    <Compass className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white font-display">
                      Interactive Archipelago Island Map Preview
                    </h3>
                    <p className="text-xs text-slate-200">
                      Explore all 4 Grade Archipelagoes (Grades 7, 8, 9, 10), broken bridges, and launch interactive lesson & quiz simulations.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onPreviewIslandMap();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap self-start sm:self-auto shadow-md"
                >
                  <Compass className="w-4 h-4 text-slate-950" />
                  <span>Launch Island Map Preview (Grades 7–10)</span>
                </button>
              </div>
            )}
            <ComprehensiveCurriculumView
              modules={allModules}
              userRole="teacher"
              teacherAssignedGrades={teacherAssignedGrades}
              currentTeacherName={currentTeacher.name}
              onPreviewIslandMap={onPreviewIslandMap}
            />
          </div>
        )}

        {/* Tab 4: Interactive Class Archipelago Map */}
        {activeTab === 'island_map' && (
          <div className="pt-2 space-y-6 animate-dashboard-panel">
            <div className="lq-woven-card lq-woven-pad-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-600" />
                    Class Archipelago Progress Map (Davao Oriental)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live mastery badges show how many students in your class have passed each island's curriculum. Click an island to view the roster.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Total Enrolled: {classIslandStats.totalClassStudents} Learners</span>
                </div>
              </div>

              <InteractiveIslandMap
                mode="teacher"
                activeIslandId={selectedMapIsland?.id || 'q1-san-victor'}
                islandCustomData={classIslandStats.customData}
                onSelectIsland={(island) => setSelectedMapIsland(island)}
              />
            </div>

            {/* Selected Island Roster & Quick Actions Panel */}
            {selectedMapIsland && (
              <div className="lq-woven-card lq-woven-pad-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {selectedMapIsland.cardKicker} • {selectedMapIsland.location}
                    </span>
                    <h4 className="text-lg font-black font-display text-slate-900 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {selectedMapIsland.name} Roster &amp; Interventions
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedMapIsland.curriculumFocus}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setActiveTab('students');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Full Active Roster</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMapIsland(null)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filtered Students List for this Island */}
                {(() => {
                  const qNum = selectedMapIsland.quarterNumber;
                  const relevantStudents = classIslandStats.classStudents.filter((st) => {
                    if (!qNum) return true;
                    const completed = st.completedModules || [];
                    return completed.some((id) => id.includes(`-q${qNum}-`));
                  });

                  return relevantStudents.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <p className="font-bold text-xs text-slate-600">No students have completed this island yet</p>
                      <p className="text-[11px] text-slate-400">
                        Assign preparatory lessons or run a diagnostic quiz in class.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {relevantStudents.map((st) => (
                        <div
                          key={st.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900">{st.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">LRN: {st.learnerId}</div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">
                              Passed Modules
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDrillDown(st)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold text-xs transition cursor-pointer shadow-xs"
                          >
                            Details
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Student Drill-Down Performance Modal */}
      {selectedStudentForDrillDown && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="lq-woven-card lq-woven-pad-6 bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">
                    {selectedStudentForDrillDown.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    LRN: {selectedStudentForDrillDown.learnerId} • Grade {selectedStudentForDrillDown.gradeLevel}{selectedStudentForDrillDown.schoolName ? ` • ${selectedStudentForDrillDown.schoolName}` : selectedStudentForDrillDown.section ? ` - Sec: ${selectedStudentForDrillDown.section}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditStudentModal(selectedStudentForDrillDown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer"
                  title="Verify LRN, change grade level, or update school"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Verify / Change Grade</span>
                </button>
                <button
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
                    {allModules
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
                              Q{mod.quarter} M{mod.quarterModuleIndex}: {mod.title}
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

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentForDrillDown(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="lq-woven-card lq-woven-pad-6 bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Enroll New Student Learner
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              {stuModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{stuModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan De La Cruz"
                  value={newStuName}
                  onChange={(e) => setNewStuName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Student Email Address <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Password Recovery
                  </span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com or deped email"
                  value={newStuEmail}
                  onChange={(e) => setNewStuEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Learner Reference Number (LRN - 12 digits)
                </label>
                <input
                  type="text"
                  required
                  placeholder="129485080001"
                  value={newStuLearnerId}
                  onChange={(e) => setNewStuLearnerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enrolled Grade Level</label>
                  <select
                    value={newStuGrade}
                    onChange={(e) => setNewStuGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value={7}>Grade 7</option>
                    <option value={8}>Grade 8</option>
                    <option value={9}>Grade 9</option>
                    <option value={10}>Grade 10</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Section</label>
                  <input
                    type="text"
                    required
                    placeholder="Rizal / Bonifacio"
                    value={newStuSection}
                    onChange={(e) => setNewStuSection(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="juan.delacruz"
                    value={newStuUsername}
                    onChange={(e) => setNewStuUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Password</label>
                  <input
                    type="password"
                    required
                    placeholder="password123"
                    value={newStuPassword}
                    onChange={(e) => setNewStuPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Verify Student Modal */}
      {verifyingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="lq-woven-card lq-woven-pad-6 bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Review & Verify Learner Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    DepEd Davao Oriental • Enrollment Information Check
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {verifySuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{verifySuccess}</span>
              </div>
            )}

            {verifyError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveVerifiedEnrollment('approve');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Learner Legal Full Name</label>
                <input
                  type="text"
                  required
                  value={verifyName}
                  onChange={(e) => setVerifyName(e.target.value)}
                  placeholder="e.g. Juanito D. Gomez"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    DepEd Learner Reference Number (LRN)
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      verifyLrn.length === 12 && /^\d{12}$/.test(verifyLrn)
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {verifyLrn.length} / 12 digits
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={verifyLrn}
                  onChange={(e) => setVerifyLrn(e.target.value.replace(/\D/g, ''))}
                  placeholder="12-digit DepEd LRN (e.g. 129485080007)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold tracking-wider"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Standard Philippine DepEd LRN is precisely 12 numeric digits.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Grade Level</label>
                  <select
                    value={verifyGrade}
                    onChange={(e) => setVerifyGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    {[7, 8, 9, 10].map((g) => (
                      <option key={g} value={g}>
                        Grade {g} {teacherAssignedGrades.includes(g as GradeLevel) ? '(Your Assigned Level)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={verifySection}
                    onChange={(e) => setVerifySection(e.target.value)}
                    placeholder="e.g. Rizal, Bonifacio..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School Station</label>
                <select
                  value={verifySchool}
                  onChange={(e) => setVerifySchool(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                >
                  {DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teacher Verification Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={verifyNote}
                  onChange={(e) => setVerifyNote(e.target.value)}
                  placeholder="e.g. Information checked against Section Rizal masterlist. LRN verified."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingStudent(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition cursor-pointer"
                  disabled={isSavingReview}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSavingReview ? 'Saving & Verifying...' : 'Save Corrections & Approve Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject / Flag Student Modal */}
      {rejectingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="lq-woven-card lq-woven-pad-6 bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                Flag / Reject Enrollment
              </div>
              <button
                type="button"
                onClick={() => setRejectingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are flagging the registration of <strong>{rejectingStudent.name}</strong> (LRN:{' '}
              {rejectingStudent.lrn || rejectingStudent.learnerId}). Please provide the reason so the learner can correct their registration.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Quick Reasons:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Invalid 12-digit LRN',
                  'Wrong Grade Level',
                  'Not on class masterlist',
                  'Wrong school station',
                ].map((reasonChip) => (
                  <button
                    key={reasonChip}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setRejectReason(
                        reasonChip === 'Invalid 12-digit LRN'
                          ? 'DepEd Learner Reference Number (LRN) does not match valid 12-digit format.'
                          : reasonChip === 'Wrong Grade Level'
                          ? `Student grade level (${rejectingStudent.gradeLevel}) does not match teacher's assigned classes.`
                          : reasonChip === 'Not on class masterlist'
                          ? 'Learner name could not be found on official Section masterlist.'
                          : 'Student belongs to a different school or division station.'
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
                  >
                    {reasonChip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Rejection Note
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why the enrollment information is incorrect..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-xs transition cursor-pointer"
                disabled={isRejecting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectStudent}
                disabled={isRejecting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Faculty Profile & Email Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="lq-woven-card lq-woven-pad-6 bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Faculty Account Management
                </span>
                <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2 mt-0.5">
                  <Key className="w-5 h-5 text-amber-500" />
                  Edit Credentials & Recovery Email
                </h3>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editTchNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editTchNotice}</span>
              </div>
            )}

            {editTchError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editTchError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeacherProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Marco V. Solis"
                  value={editTchName}
                  onChange={(e) => setEditTchName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>DepEd / Recovery Email <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Linked to Password Recovery
                  </span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. marco.solis@deped.gov.ph"
                  value={editTchEmail}
                  onChange={(e) => setEditTchEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for account password recovery and official Division communications.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School / Station</label>
                <input
                  type="text"
                  placeholder="e.g. Mati National Comprehensive High School"
                  value={editTchSchool}
                  onChange={(e) => setEditTchSchool(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 8 English Faculty"
                  value={editTchDepartment}
                  onChange={(e) => setEditTchDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              {/* Read-only system info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{currentTeacher.employeeId || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Assigned Class Code</span>
                  <span className="font-mono font-bold text-sky-700">{currentTeacher.classCode || 'Pending'}</span>
                </div>
              </div>

              {/* Password change section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Change Password
                  </span>
                  <span className="text-[10px] text-slate-400">Leave blank to keep current</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showTchModalPassword ? 'text' : 'password'}
                        placeholder="At least 4 chars"
                        value={editTchNewPassword}
                        onChange={(e) => setEditTchNewPassword(e.target.value)}
                        className="w-full p-2.5 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setShowTchModalPassword(!showTchModalPassword);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showTchModalPassword ? 'Hide password' : 'Show password'}
                        aria-label={showTchModalPassword ? 'Hide password' : 'Show password'}
                      >
                        {showTchModalPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showTchModalPassword ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={editTchConfirmPassword}
                        onChange={(e) => setEditTchConfirmPassword(e.target.value)}
                        className="w-full p-2.5 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setShowTchModalPassword(!showTchModalPassword);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showTchModalPassword ? 'Hide password' : 'Show password'}
                        aria-label={showTchModalPassword ? 'Hide password' : 'Show password'}
                      >
                        {showTchModalPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editTchSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition shadow cursor-pointer disabled:opacity-50"
                >
                  {editTchSaving ? 'Saving Changes...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Action: Change Student Grade Level & School / LRN Verification Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="lq-woven-card lq-woven-pad-6 bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Verify & Change Grade Level
                  </h3>
                  <p className="text-xs text-slate-500">
                    Check correct DepEd LRN, enrolled grade level & school for {editingStudent.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentVerification} className="space-y-4 text-xs">
              {editStuError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editStuError}</span>
                </div>
              )}

              {editStuSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editStuSuccess}</span>
                </div>
              )}

              {/* Student Identification Overview */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Student Account</span>
                  <span className="font-bold text-slate-900 text-sm">{editingStudent.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">@{editingStudent.username}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Class Code</span>
                  <span className="font-bold font-mono text-indigo-600 text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                    {editingStudent.classCode || currentTeacher.classCode}
                  </span>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Learner Name
                </label>
                <input
                  type="text"
                  required
                  value={editStuName}
                  onChange={(e) => setEditStuName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 font-medium"
                  placeholder="Student full name"
                />
              </div>

              {/* Grade Level Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Enrolled Grade Level</span>
                  <span className="text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                    Current: Grade {editingStudent.gradeLevel}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Selecting a new grade level updates the learner's curriculum modules and quest progress map accordingly.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {([7, 8, 9, 10] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditStuGrade(g)}
                      className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        editStuGrade === g
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Grade {g}</span>
                      {editingStudent.gradeLevel === g && (
                        <span className="text-[9px] text-slate-600 font-normal uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12-Digit DepEd LRN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>DepEd Learner Reference Number (LRN)</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {editStuLrn.length}/12 digits
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={editStuLrn}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, '');
                      setEditStuLrn(numeric);
                    }}
                    placeholder="12-digit DepEd LRN (e.g. 104829103948)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 font-mono tracking-wider font-semibold"
                  />
                  {editStuLrn.length === 12 && /^\d{12}$/.test(editStuLrn) && (
                    <span className="absolute right-3 top-2.5 text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                      <Check className="w-3.5 h-3.5" /> Valid
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Learners require a valid 12-digit DepEd LRN matching official division records.
                </p>
              </div>

              {/* School in DepEd Davao Oriental */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-500" />
                  <span>DepEd Davao Oriental School</span>
                </label>
                <select
                  value={editStuSchool}
                  onChange={(e) => setEditStuSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 font-medium truncate"
                >
                  {DEPED_DAVAO_ORIENTAL_HIGH_SCHOOLS.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section / Class Section */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Class Section (Optional)
                </label>
                <input
                  type="text"
                  value={editStuSection}
                  onChange={(e) => setEditStuSection(e.target.value)}
                  placeholder="e.g. Rizal, Mabini, Aguinaldo, Section A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStuSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {editStuSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Verified Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
