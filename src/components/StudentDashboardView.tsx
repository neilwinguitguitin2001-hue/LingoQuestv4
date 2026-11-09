import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Copy,
  Crop,
  Eye,
  EyeOff,
  GraduationCap,
  History,
  Key,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Save,
  School,
  Shield,
  ShieldCheck,
  Trash2,
  Trophy,
  Upload,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { BADGE_DEFINITIONS } from '../data/seedData';
import { BadgeDefinition, StudentAccount, TeacherAccount } from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';
import { BadgeIcon } from './BadgeIcon';
import { CirclePhotoCropModal } from './CirclePhotoCropModal';
import {
  CelebrationOverlay,
  CelebrationEvent,
  getStudentLevelInfo,
  STUDENT_LEVEL_TIERS,
} from './CelebrationOverlay';
import { InteractiveIslandMap, IslandStationData } from './InteractiveIslandMap';
import { InabelHeaderStrip } from './InabelHeaderStrip';

// Pre-made cheerful island explorer avatar presets (SVG-based Data URLs)
export const ISLAND_AVATAR_PRESETS = [
  {
    id: 'captain',
    name: 'Captain Navigator',
    bg: '#0284C7',
    emoji: '⚓',
    role: 'Pujada Bay Sailor',
  },
  {
    id: 'scholar',
    name: 'Island Scholar',
    bg: '#10B981',
    emoji: '📚',
    role: 'Grammar Master',
  },
  {
    id: 'pathfinder',
    name: 'Coastal Pathfinder',
    bg: '#F59E0B',
    emoji: '🧭',
    role: 'Trail Explorer',
  },
  {
    id: 'diver',
    name: 'Pearl Diver',
    bg: '#06B6D4',
    emoji: '🤿',
    role: 'Reef Discoverer',
  },
  {
    id: 'guardian',
    name: 'Mangrove Guardian',
    bg: '#16A34A',
    emoji: '🌿',
    role: 'Eco Scholar',
  },
  {
    id: 'watcher',
    name: 'Lighthouse Watcher',
    bg: '#6366F1',
    emoji: '🗼',
    role: 'Beacon Keeper',
  },
  {
    id: 'writer',
    name: 'Essay Bard',
    bg: '#EC4899',
    emoji: '✍️',
    role: 'Writing Lab Virtuoso',
  },
  {
    id: 'hornbill',
    name: 'Kalaw Scout',
    bg: '#8B5CF6',
    emoji: '🦜',
    role: 'Canopy Soarer',
  },
];

// Helper to compress local image files for smooth storage
function compressImageFile(file: File, maxWidth = 360, maxHeight = 360, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            width = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Could not decode image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

interface StudentDashboardViewProps {
  student: StudentAccount;
  teachers?: TeacherAccount[];
  onUpdateStudent: (updates: {
    name?: string;
    email?: string;
    password?: string;
    photoUrl?: string;
    section?: string;
  }) => Promise<{ success: boolean; student?: StudentAccount; error?: string }>;
  onBackToMap: () => void;
  onNavigateToLeaderboard?: () => void;
  onNavigateToProgress?: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  teachers = [],
  onUpdateStudent,
  onBackToMap,
  onNavigateToLeaderboard,
  onNavigateToProgress,
}) => {
  // Active Dashboard Sub-view: 'overview' | 'credentials' | 'badges'
  const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'badges'>('overview');
  const [isMuted, setIsMuted] = useState(() => soundFX.isMuted());

  // Credentials form state
  const [nameInput, setNameInput] = useState(student.name);
  const [emailInput, setEmailInput] = useState(student.email || '');
  const [sectionInput, setSectionInput] = useState(student.section || 'Rizal');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile Picture state
  const [previewPhoto, setPreviewPhoto] = useState<string | undefined>(student.photoUrl);
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo Cropping States (Circle/Square Profile Crop)
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');

  // Form feedback
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedClassCode, setCopiedClassCode] = useState(false);

  // Sync state if student prop updates externally
  useEffect(() => {
    setNameInput(student.name);
    setEmailInput(student.email || '');
    setSectionInput(student.section || 'Rizal');
    setPreviewPhoto(student.photoUrl);
  }, [student.id, student.name, student.email, student.section, student.photoUrl]);

  // Badge cabinet state
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  // Level & Celebration animation overlay state
  const currentLevelInfo = getStudentLevelInfo(student.points);
  const [celebrationEvents, setCelebrationEvents] = useState<CelebrationEvent[]>([]);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);

  // Interactive Island Map Selection & Details
  const [selectedIslandModal, setSelectedIslandModal] = useState<IslandStationData | null>(null);

  const studentIslandProgress = useMemo(() => {
    const completedSet = new Set(student.completedModules || []);
    const grade = student.gradeLevel || 8;

    const q1Done = Array.from(completedSet).filter((id) => id.includes(`g${grade}-q1`)).length;
    const q2Done = Array.from(completedSet).filter((id) => id.includes(`g${grade}-q2`)).length;
    const q3Done = Array.from(completedSet).filter((id) => id.includes(`g${grade}-q3`)).length;
    const q4Done = Array.from(completedSet).filter((id) => id.includes(`g${grade}-q4`)).length;
    const essaysCount = student.writingSubmissions?.length || 0;

    let currentIslandId = 'q1-san-victor';
    if (q1Done > 0 && q2Done === 0) currentIslandId = 'q2-oak';
    else if (q2Done > 0 && q3Done === 0) currentIslandId = 'q3-waniban';
    else if (q3Done > 0 && q4Done === 0) currentIslandId = 'q4-pujada';
    else if (q4Done > 0) currentIslandId = 'discovery-dinosaur';

    const customData: Record<
      string,
      {
        status: 'completed' | 'current' | 'upcoming' | 'locked';
        badgeText: string;
        badgeType: 'success' | 'warning' | 'info' | 'default';
      }
    > = {
      'q1-san-victor': {
        status: q1Done >= 2 ? 'completed' : currentIslandId === 'q1-san-victor' ? 'current' : 'upcoming',
        badgeText: q1Done > 0 ? `${q1Done} Done` : 'Ready',
        badgeType: q1Done > 0 ? 'success' : 'default',
      },
      'q2-oak': {
        status: q2Done >= 2 ? 'completed' : currentIslandId === 'q2-oak' ? 'current' : 'upcoming',
        badgeText: q2Done > 0 ? `${q2Done} Done` : q1Done > 0 ? 'Ready' : 'Locked',
        badgeType: q2Done > 0 ? 'success' : 'default',
      },
      'q3-waniban': {
        status: q3Done >= 2 ? 'completed' : currentIslandId === 'q3-waniban' ? 'current' : 'upcoming',
        badgeText: q3Done > 0 ? `${q3Done} Done` : q2Done > 0 ? 'Ready' : 'Locked',
        badgeType: q3Done > 0 ? 'success' : 'default',
      },
      'q4-pujada': {
        status: q4Done >= 2 ? 'completed' : currentIslandId === 'q4-pujada' ? 'current' : 'upcoming',
        badgeText: q4Done > 0 ? `${q4Done} Done` : q3Done > 0 ? 'Ready' : 'Locked',
        badgeType: q4Done > 0 ? 'success' : 'default',
      },
      'discovery-dinosaur': {
        status: essaysCount > 0 ? 'completed' : 'current',
        badgeText: essaysCount > 0 ? `${essaysCount} Written` : 'Discovery',
        badgeType: essaysCount > 0 ? 'success' : 'info',
      },
    };

    return {
      currentIslandId,
      customData,
    };
  }, [
    student.id,
    student.gradeLevel,
    (student.completedModules || []).join(','),
    student.writingSubmissions?.length,
  ]);

  const badgesKey = (student.badges || []).join(',');

  // Detect newly earned badges or level-ups when student enters dashboard or stats update
  useEffect(() => {
    try {
      const storageKeyBadges = `lingoquest_seen_badges_${student.id}`;
      const storageKeyLevel = `lingoquest_seen_level_${student.id}`;

      const rawSavedBadges = localStorage.getItem(storageKeyBadges);
      const rawSavedLevel = localStorage.getItem(storageKeyLevel);

      const events: CelebrationEvent[] = [];

      if (rawSavedBadges !== null) {
        const savedBadges: string[] = JSON.parse(rawSavedBadges);
        const newlyUnlockedIds = (student.badges || []).filter((bId) => !savedBadges.includes(bId));
        newlyUnlockedIds.forEach((bId) => {
          const def = BADGE_DEFINITIONS.find((b) => b.id === bId);
          if (def) {
            events.push({ type: 'badge', badge: def });
          }
        });
      }

      if (rawSavedLevel !== null) {
        const savedLevel = parseInt(rawSavedLevel, 10);
        if (currentLevelInfo.level > savedLevel) {
          events.push({
            type: 'level_up',
            previousLevel: savedLevel,
            newLevel: currentLevelInfo.level,
            levelInfo: currentLevelInfo,
            totalPoints: student.points,
          });
        }
      }

      // Record latest badges and level
      localStorage.setItem(storageKeyBadges, JSON.stringify(student.badges || []));
      localStorage.setItem(storageKeyLevel, currentLevelInfo.level.toString());

      if (events.length > 0) {
        setCelebrationEvents(events);
        setShowCelebrationOverlay(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [student.id, badgesKey, student.points, currentLevelInfo.level]);

  // Find linked teacher if available
  const linkedTeacher = teachers.find(
    (t) =>
      t.id === student.teacherId ||
      (t.classCode && student.classCode && t.classCode.toUpperCase() === student.classCode.toUpperCase())
  );

  const toggleSound = () => {
    const nextState = !isMuted;
    soundFX.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) {
      soundFX.playClick();
    }
  };

  const handleCopyClassCode = () => {
    soundFX.playClick();
    if (student.classCode) {
      navigator.clipboard.writeText(student.classCode);
      setCopiedClassCode(true);
      setTimeout(() => setCopiedClassCode(false), 2000);
    }
  };

  // Handle local picture upload with Circle Crop Modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (PNG, JPG, or WebP).');
      return;
    }

    // Read the selected image into data URL and launch Circle Crop Modal
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        soundFX.playClick();
        setCropImageSrc(result);
        setShowCropModal(true);
        setErrorMessage(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Could not load image file from your device.');
    };
    reader.readAsDataURL(file);
  };

  // Apply cropped photo from Circle Crop Modal
  const handleApplyCroppedPhoto = (croppedDataUrl: string) => {
    setPreviewPhoto(croppedDataUrl);
    setSelectedAvatarPreset(null);
    setShowCropModal(false);
    setSuccessNotice('Photo cropped into circle profile! Remember to click "Save Changes" below.');
    setTimeout(() => setSuccessNotice(null), 5000);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open cropper for existing custom image
  const handleOpenCropperForExisting = () => {
    if (previewPhoto && !previewPhoto.startsWith('data:image/svg+xml')) {
      soundFX.playClick();
      setCropImageSrc(previewPhoto);
      setShowCropModal(true);
    }
  };

  // Select pre-made avatar preset
  const handleSelectPreset = (preset: typeof ISLAND_AVATAR_PRESETS[0]) => {
    soundFX.playClick();
    // Generate a high-contrast SVG Data URL
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" rx="40" fill="${preset.bg}" />
        <circle cx="100" cy="100" r="72" fill="#FFFFFF" opacity="0.18" />
        <text x="100" y="125" font-size="76" text-anchor="middle" dominant-baseline="middle">${preset.emoji}</text>
      </svg>
    `.trim();
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setPreviewPhoto(dataUrl);
    setSelectedAvatarPreset(preset.id);
  };

  // Remove profile picture
  const handleRemovePhoto = () => {
    soundFX.playClick();
    setPreviewPhoto('');
    setSelectedAvatarPreset(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save Credentials changes
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setErrorMessage(null);
    setSuccessNotice(null);

    // Validate Name
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }

    // Validate Email (Required for password recovery)
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('A valid email address is required for password recovery and notifications.');
      return;
    }

    // Password validation (if user entered new password)
    if (newPasswordInput.trim().length > 0) {
      if (newPasswordInput.trim().length < 4) {
        setErrorMessage('New password must be at least 4 characters long.');
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const updates: {
        name?: string;
        email?: string;
        password?: string;
        photoUrl?: string;
        section?: string;
      } = {
        name: nameInput.trim(),
        email: cleanEmail,
        section: sectionInput.trim(),
        photoUrl: previewPhoto || '',
      };

      if (newPasswordInput.trim().length >= 4) {
        updates.password = newPasswordInput.trim();
      }

      const res = await onUpdateStudent(updates);

      if (res.success) {
        soundFX.playPass();
        setSuccessNotice('Credentials and profile updated successfully!');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setCurrentPasswordInput('');
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        soundFX.playIncorrect();
        setErrorMessage(res.error || 'Failed to update credentials. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const unlockedBadgeCount = student.badges.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Student Hero Banner */}
      <div className="bg-gradient-to-r from-[#07192F] via-[#0E2F59] to-[#15467C] rounded-3xl text-white relative overflow-hidden border-2 border-[#231F20] linocut-card animate-dashboard-hero">
        <InabelHeaderStrip variant="royal" label="DepEd Davao Oriental • Student Quest Dashboard" />
        <div className="p-6 sm:p-8 relative">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Interactive Profile Photo Container (Circle Profile) */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#092244] border-3 border-amber-400 overflow-hidden shadow-xl flex items-center justify-center text-white relative">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center font-bold text-2xl tracking-wider text-white">
                    {student.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase() || 'LQ'}
                  </div>
                )}

                {/* Hover overlay button to trigger photo upload or crop */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    if (previewPhoto && !previewPhoto.startsWith('data:image/svg+xml')) {
                      setCropImageSrc(previewPhoto);
                      setShowCropModal(true);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer text-white text-[10px] font-bold rounded-full"
                  title={previewPhoto && !previewPhoto.startsWith('data:image/svg+xml') ? 'Crop & Adjust Picture' : 'Upload Profile Picture'}
                >
                  <Crop className="w-4 h-4 text-amber-300" />
                  <span>{previewPhoto && !previewPhoto.startsWith('data:image/svg+xml') ? 'Crop' : 'Upload'}</span>
                </button>
              </div>

              {/* Status Dot */}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0B1E36] flex items-center justify-center text-white text-[10px] shadow-sm">
                ✓
              </span>
            </div>

            {/* Student Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-sky-950/70 text-sky-300 border border-sky-500/40 px-3 py-0.5 rounded-full">
                  Learner Dashboard
                </span>
                <span className="text-xs font-semibold text-sky-200">
                  DepEd Schools Division of Davao Oriental
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
                <span>{nameInput || student.name}</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-400/40 px-2 py-0.5 rounded-lg">
                  Grade {student.gradeLevel}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-sky-100/90 font-mono">
                <span>LRN: <strong className="text-white">{student.learnerId}</strong></span>
                <span>•</span>
                <span>@{student.username}</span>
                <span>•</span>
                <span className="truncate max-w-[220px]">
                  {student.schoolName || student.section || 'Secondary English'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-sans font-semibold">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{student.email || 'Email not linked'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={toggleSound}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 cursor-pointer"
              title="Toggle audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-sky-300" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('credentials');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                activeTab === 'credentials'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Edit Credentials</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onBackToMap();
              }}
              className="px-4 py-2 rounded-2xl bg-white text-blue-950 font-bold text-xs shadow hover:bg-sky-50 transition cursor-pointer"
            >
              Back to Island Map
            </button>
          </div>
        </div>

        {/* Mini stats strip on bottom of hero */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs animate-dashboard-stats">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10">
            <div>
              <span className="text-[10px] font-black uppercase text-sky-300 block">Total Points</span>
              <span className="text-xl font-mono font-black text-amber-300">
                {student.points.toLocaleString()} <span className="text-xs font-normal text-amber-200">pts</span>
              </span>
            </div>
            <span className="text-[10px] text-sky-200 mt-1">
              Next: {currentLevelInfo.maxPoints + 1} pts
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-sky-300">Learner Level</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                  Lv {currentLevelInfo.level}
                </span>
              </div>
              <span className="text-sm font-black text-white truncate block mt-0.5">
                {currentLevelInfo.title}
              </span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-300 block">Bridges Restored</span>
              <span className="text-xl font-mono font-black text-emerald-300">
                {student.completedModules.length} <span className="text-xs font-normal text-emerald-200">islands</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-200/80 mt-1">
              {student.completedModules.length} causeways active
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-purple-300 block">Badges Unlocked</span>
              <span className="text-xl font-mono font-black text-purple-300">
                {unlockedBadgeCount} <span className="text-xs font-normal text-purple-200">/ {BADGE_DEFINITIONS.length}</span>
              </span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-300 block">Teacher Class Code</span>
                <span className="font-mono text-sm font-black text-white">
                  {student.classCode || 'LQ-ENG-8492'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyClassCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 transition"
                title="Copy teacher class code"
              >
                {copiedClassCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-sky-200/80 mt-1">
              {linkedTeacher ? `Teacher: ${linkedTeacher.name}` : 'DepEd Davao Oriental'}
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl max-w-md animate-dashboard-tabs">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setActiveTab('overview');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-sm scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-sky-600" />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setActiveTab('credentials');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'credentials'
              ? 'bg-white text-slate-900 shadow-sm scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4 text-amber-600" />
          <span>Modify Credentials</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setActiveTab('badges');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-white text-slate-900 shadow-sm scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>Badge Cabinet</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-dashboard-panel">
          {/* Interactive Davao Oriental Archipelago Progress Map */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  Your Archipelago Learning Journey (Davao Oriental)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Completed islands are illuminated. Click any island or bottom card to review lessons and scores.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToMap}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch Full Map Quest</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <InteractiveIslandMap
              mode="student"
              activeIslandId={studentIslandProgress.currentIslandId}
              islandCustomData={studentIslandProgress.customData}
              onSelectIsland={(isl) => setSelectedIslandModal(isl)}
            />
          </div>

          {/* 3 Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Official Registration */}
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-3">
              <InabelHeaderStrip variant="indigo" label="Learner Credentials" />
              <div className="px-6 pb-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-600" />
                Learner Credentials
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-slate-900">{student.name}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-mono font-bold text-slate-800">@{student.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Learner Ref No. (LRN):</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {student.learnerId}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Enrolled Grade:</span>
                  <span className="font-bold text-slate-800">Grade {student.gradeLevel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Recovery Email:</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[150px]" title={student.email}>
                    {student.email || 'None registered'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Section:</span>
                  <span className="font-bold text-slate-800">{student.section || 'General Secondary'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('credentials');
                }}
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Name or Password</span>
              </button>
              </div>
            </div>

            {/* Card 2: Classroom & Instructor */}
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-3">
              <InabelHeaderStrip variant="royal" label="Classroom & Faculty Link" />
              <div className="px-6 pb-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-600" />
                Classroom & Faculty Link
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">High School:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[170px]" title={student.schoolName}>
                    {student.schoolName || 'DepEd Davao Oriental High School'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">English Teacher:</span>
                  <strong className="text-slate-900">
                    {linkedTeacher ? linkedTeacher.name : 'Division Faculty Assigned'}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Class Code:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {student.classCode || 'LQ-ENG-8492'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Registration Date:</span>
                  <span className="text-slate-700 font-medium">{student.joinedDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Official Learner
                  </span>
                </div>
              </div>
              </div>
            </div>

            {/* Card 3: Academic Milestone Summary */}
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-3">
              <InabelHeaderStrip variant="emerald" label="Curriculum Journey" />
              <div className="px-6 pb-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                Curriculum Journey
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Bridges Restored:</span>
                  <span className="font-bold text-emerald-600">
                    {student.completedModules.length} Modules
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Writing Lab Essays:</span>
                  <span className="font-bold text-indigo-700">
                    {student.writingSubmissions?.length || 0} Evaluated
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Earned Badges:</span>
                  <span className="font-bold text-purple-700">
                    {unlockedBadgeCount} of {BADGE_DEFINITIONS.length} Collected
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Activity board:</span>
                  <span className="font-bold text-amber-600">Optional participation</span>
                </div>
              </div>

              {onNavigateToLeaderboard && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateToLeaderboard();
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View My Grade Activity Board</span>
                </button>
              )}
              </div>
            </div>
          </div>

          {/* Quick Profile Picture & Credentials Callout */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-[#231F20] linocut-card">
            <InabelHeaderStrip variant="amber" label="Profile Customization & Security" />
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900">
                  Personalize Your Student Profile Picture & Credentials
                </h4>
                <p className="text-xs text-slate-600 max-w-xl">
                  Upload your own photo or choose an island explorer avatar. You can also update your display name and change your login password at any time.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('credentials');
              }}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition shrink-0 cursor-pointer"
            >
              Open Credentials Settings
            </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODIFY CREDENTIALS & UPLOAD PICTURE */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-8 animate-dashboard-panel">
          <InabelHeaderStrip variant="amber" label="Student Account Management • Modify Credentials" />
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Account Management
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 flex items-center gap-2 mt-0.5">
              <Key className="w-6 h-6 text-amber-500" />
              Modify Credentials & Profile Picture
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Update your student display name, password, section, and profile picture. Changes are securely saved to your account.
            </p>
          </div>

          {/* Alerts */}
          {successNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveCredentials} className="space-y-8">
            {/* Section 1: Profile Picture Management */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sky-600" />
                    Profile Picture / Avatar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a personal photo from your device or select an explorer avatar preset.
                  </p>
                </div>

                {previewPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Picture
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Active Photo Preview in Circle Frame */}
                <div className="relative group shrink-0 text-center">
                  <div className="w-28 h-28 rounded-full bg-white border-3 border-amber-400 shadow-md overflow-hidden flex items-center justify-center relative">
                    {previewPhoto ? (
                      <img
                        src={previewPhoto}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                        <User className="w-10 h-10" />
                        <span className="text-[10px] font-bold mt-1">No Picture</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                    Circle Profile
                  </span>
                </div>

                {/* Upload & Crop Actions */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Picture from Device</span>
                    </button>

                    {previewPhoto && !previewPhoto.startsWith('data:image/svg+xml') && (
                      <button
                        type="button"
                        onClick={handleOpenCropperForExisting}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
                        title="Re-crop and adjust circular framing"
                      >
                        <Crop className="w-4 h-4" />
                        <span>Crop & Frame Circle Photo</span>
                      </button>
                    )}

                    <span className="text-xs text-slate-400">PNG, JPG, or WebP (max 5MB)</span>
                  </div>

                  {/* Informative Guidance on Circle Crop Tool */}
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-sky-800">
                      <Crop className="w-3.5 h-3.5 text-sky-600" />
                      <span>Automatic Circle Cropper Enabled</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Whenever you upload a photo, the Circle Crop tool opens automatically so you can drag, zoom in/out, and rotate your image into a balanced 1:1 square. This ensures your face or subject fits nicely into round profile badges without being stretched.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explorer Avatar Presets */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Or select an Island Explorer Avatar:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {ISLAND_AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatarPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-300'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 text-white shadow-xs"
                          style={{ backgroundColor: preset.bg }}
                        >
                          {preset.emoji}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {preset.role}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 2: Student Identity & Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-purple-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Complete Student Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Juan D. Dela Cruz"
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your name is used for your account and authorized class records. Activity boards use system-generated aliases.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Email Address <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Password Recovery
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. learner@gmail.com or deped email"
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Required email address used to securely reset your password if forgotten.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Section Name / Room
                  </label>
                  <input
                    type="text"
                    value={sectionInput}
                    onChange={(e) => setSectionInput(e.target.value)}
                    placeholder="e.g. Rizal, Bonifacio, Mabini"
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Specific grade section under your teacher.
                  </p>
                </div>
              </div>

              {/* Read-Only Official Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">12-Digit LRN (Read-Only):</span>
                  <strong className="font-mono text-slate-800">{student.learnerId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Username:</span>
                  <span className="font-mono text-slate-800">@{student.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Grade Level:</span>
                  <span className="font-bold text-sky-700">Grade {student.gradeLevel}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Password Modification */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Change Password
                </h3>
                <span className="text-xs text-slate-400">Leave blank if you don&apos;t want to change</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter at least 4 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPasswordInput && confirmPasswordInput && (
                    <p
                      className={`text-[11px] mt-1 font-semibold ${
                        newPasswordInput === confirmPasswordInput ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {newPasswordInput === confirmPasswordInput ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setNameInput(student.name);
                  setEmailInput(student.email || '');
                  setSectionInput(student.section || 'Rizal');
                  setPreviewPhoto(student.photoUrl);
                  setNewPasswordInput('');
                  setConfirmPasswordInput('');
                  setErrorMessage(null);
                  setActiveTab('overview');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancel Changes
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving Changes...' : 'Save Credentials & Picture'}</span>
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* TAB 3: BADGES CABINET & ACHIEVEMENTS */}
      {activeTab === 'badges' && (
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#231F20] linocut-card space-y-6 animate-dashboard-panel">
          <InabelHeaderStrip variant="indigo" label="Division Academic Achievements • Badge Cabinet" />
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Division Academic Achievements
              </span>
              <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2 mt-0.5">
                <Award className="w-5 h-5 text-purple-600" />
                Learner Badge Cabinet ({unlockedBadgeCount} / {BADGE_DEFINITIONS.length} Collected)
              </h2>
            </div>
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {BADGE_DEFINITIONS.map((badge) => {
              const isUnlocked = student.badges.includes(badge.id);
              const isSelected = selectedBadge?.id === badge.id;

              return (
                <button
                  key={badge.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedBadge(badge);
                  }}
                  className={`p-4 rounded-3xl border text-center transition flex flex-col items-center justify-center space-y-2 relative group cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50/80 shadow-md ring-2 ring-purple-400/30'
                      : isUnlocked
                      ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-300'
                      : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
                      isUnlocked
                        ? 'bg-amber-100 text-amber-900 group-hover:scale-105 shadow-sm'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <BadgeIcon iconType={badge.iconType} className="w-7 h-7" />
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{badge.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-amber-600 block">
                      +{badge.pointsBonus} pts
                    </span>
                  </div>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Badge Detail Callout */}
          {selectedBadge && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <BadgeIcon iconType={selectedBadge.iconType} className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold font-display text-slate-900">
                      {selectedBadge.name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      +{selectedBadge.pointsBonus} Bonus Points
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{selectedBadge.description}</p>
                  <div className="text-[11px] text-purple-700 font-semibold mt-1 capitalize">
                    Category: {selectedBadge.category} • Status:{' '}
                    {student.badges.includes(selectedBadge.id) ? 'Claimed' : 'In Progress'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 text-xs font-semibold text-purple-700 bg-white rounded-xl shadow-xs hover:bg-purple-100 transition cursor-pointer"
                >
                  Close Detail
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Circle / Square Photo Crop Modal */}
      <CirclePhotoCropModal
        isOpen={showCropModal}
        imageSrc={cropImageSrc}
        onClose={() => setShowCropModal(false)}
        onApplyCrop={handleApplyCroppedPhoto}
      />

      {/* Celebration Animation Overlay for New Badges & Total Points Level-Up */}
      {showCelebrationOverlay && celebrationEvents.length > 0 && (
        <CelebrationOverlay
          events={celebrationEvents}
          onClose={() => {
            setShowCelebrationOverlay(false);
            setCelebrationEvents([]);
          }}
        />
      )}

      {/* Selected Island Quarter Lessons & Tasks Modal */}
      {selectedIslandModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 animate-scale-in">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-400/30">
                  {selectedIslandModal.cardKicker} • {selectedIslandModal.location}
                </span>
                <h3 className="text-xl font-black font-display text-white mt-1.5 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  {selectedIslandModal.name}
                </h3>
                <p className="text-xs text-sky-100/90 mt-1">
                  {selectedIslandModal.curriculumFocus}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIslandModal(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-0 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Real-Life Geography (Davao Oriental):
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {selectedIslandModal.realLifeGeography}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> DepEd English Competencies:
                </span>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  {selectedIslandModal.competencySnippet}
                </p>
              </div>

              {/* Progress on this island */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Your Island Status:</span>
                  <strong className="text-slate-900 capitalize font-display">
                    {studentIslandProgress.customData[selectedIslandModal.id]?.status || 'Available'}
                  </strong>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                  {studentIslandProgress.customData[selectedIslandModal.id]?.badgeText || 'Ready'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIslandModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIslandModal(null);
                    onBackToMap();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>Launch Island Learning Modules</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
