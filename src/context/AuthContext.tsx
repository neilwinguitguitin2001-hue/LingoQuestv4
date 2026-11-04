import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleAuthProvider } from '../firebase'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { GradeLevel, StudentAccount, UserRole } from '../types/lingoquest'
import {
  FirestoreUserDoc,
  getUserProfileFromFirestore,
  syncStudentProgressToFirestore,
  syncUserProfileToFirestore,
} from '../services/firebaseProgressService'

export interface StudentSignupInput {
  fullName: string
  email: string
  password: string
  gradeLevel: GradeLevel
  school: string
  section?: string
  lrn?: string
  classCode?: string
  teacherId?: string
  username?: string
}

type AuthUser = { uid: string; id: string; email?: string; displayName?: string; photoURL?: string }

export interface AuthContextValue {
  user: AuthUser | null
  profile: FirestoreUserDoc | null
  role: UserRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<FirestoreUserDoc | null>
  signup: (data: StudentSignupInput) => Promise<{ firebaseUser: AuthUser; studentAccount: StudentAccount }>
  loginWithGoogle: () => Promise<{ firebaseUser: AuthUser; profile: FirestoreUserDoc }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (/invalid|credential|password|user/i.test(message))
    return 'Incorrect email or password. Please double-check your credentials or use "Forgot Password?".'
  if (/already|registered|email-already-in-use/i.test(message))
    return 'This email address is already registered. Please sign in or reset your password instead.'
  if (/weak/i.test(message)) return 'Your password is too weak. Please choose a stronger password.'
  if (/rate|too many|too-many-requests/i.test(message))
    return 'Too many attempts. Please wait a moment and try again.'
  return message || 'Authentication failed. Please try again.'
}

function mapProfile(row: any): FirestoreUserDoc {
  return {
    uid: row.id,
    id: row.id,
    displayName: row.display_name || '',
    name: row.display_name || '',
    email: row.email || '',
    role: row.role || 'student',
    status: row.status || 'approved',
    gradeLevel: row.grade_level,
    school: row.school || '',
    schoolName: row.school_name || row.school || '',
    section: row.section,
    lrn: row.lrn,
    learnerId: row.learner_id,
    classCode: row.class_code,
    teacherId: row.teacher_id,
    username: row.username,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    updatedAt: row.updated_at,
  }
}

async function loadProfile(id: string): Promise<FirestoreUserDoc | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id,email,display_name,role,status,grade_level,school,school_name,section,lrn,learner_id,class_code,teacher_id,username,photo_url,created_at,last_login_at,updated_at'
        )
        .eq('id', id)
        .maybeSingle()
      if (!error && data) return mapProfile(data)
    } catch {
      // Fallback to Firestore
    }
  }
  return getUserProfileFromFirestore(id)
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<FirestoreUserDoc | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    if (isSupabaseConfigured && supabase) {
      supabase.auth
        .getSession()
        .then(async ({ data: { session } }) => {
          if (!mounted) return
          const authUser = session?.user
          if (authUser) {
            const nextUser: AuthUser = {
              uid: authUser.id,
              id: authUser.id,
              email: authUser.email,
              displayName: authUser.user_metadata?.full_name,
              photoURL: authUser.user_metadata?.avatar_url,
            }
            const nextProfile = await loadProfile(authUser.id)
            setUser(nextUser)
            setProfile(nextProfile)
            setRole(nextProfile?.role || 'student')
          }
          setLoading(false)
        })
        .catch(() => {
          if (mounted) setLoading(false)
        })

      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return
        const authUser = session?.user
        if (!authUser) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setLoading(false)
          return
        }
        const nextUser: AuthUser = {
          uid: authUser.id,
          id: authUser.id,
          email: authUser.email,
          displayName: authUser.user_metadata?.full_name,
          photoURL: authUser.user_metadata?.avatar_url,
        }
        const nextProfile = await loadProfile(authUser.id)
        setUser(nextUser)
        setProfile(nextProfile)
        setRole(nextProfile?.role || 'student')
        setLoading(false)
      })
      return () => {
        mounted = false
        listener.subscription.unsubscribe()
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!mounted) return
      if (!fbUser) {
        setUser(null)
        setProfile(null)
        setRole(null)
        setLoading(false)
        return
      }
      const nextUser: AuthUser = {
        uid: fbUser.uid,
        id: fbUser.uid,
        email: fbUser.email || undefined,
        displayName: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined,
      }
      const nextProfile = await getUserProfileFromFirestore(fbUser.uid)
      if (!mounted) return
      setUser(nextUser)
      setProfile(nextProfile)
      setRole(nextProfile?.role || 'student')
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (error) throw error
        return data.user ? loadProfile(data.user.id) : null
      }

      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password)
      return await getUserProfileFromFirestore(cred.user.uid)
    } catch (error) {
      throw new Error(friendlyAuthError(error))
    }
  }

  const signup = async (data: StudentSignupInput) => {
    try {
      const cleanEmail = data.email.trim().toLowerCase()
      const generatedLrn =
        data.lrn && /^\d{12}$/.test(data.lrn.trim())
          ? data.lrn.trim()
          : `129${Math.floor(100000000 + Math.random() * 900000000)}`
      const classCode = data.classCode?.trim().toUpperCase() || 'LQ-ENG-8492'
      const teacherId = data.teacherId || 'tch-marco-solis'
      const username = data.username?.trim() || cleanEmail.split('@')[0]

      if (isSupabaseConfigured && supabase) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: { full_name: data.fullName.trim() },
            emailRedirectTo:
              import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        if (!authData.user) throw new Error('Please check your email to confirm your account.')
        const row = {
          id: authData.user.id,
          email: cleanEmail,
          display_name: data.fullName.trim(),
          role: 'student',
          status: 'approved',
          grade_level: data.gradeLevel || 8,
          school: data.school || '',
          school_name: data.school || '',
          section: data.section?.trim() || '',
          lrn: generatedLrn,
          learner_id: generatedLrn,
          class_code: classCode,
          teacher_id: teacherId,
          username,
        }
        const { error: profileError } = await supabase.from('profiles').upsert(row)
        if (profileError) throw profileError
        const studentAccount: StudentAccount = {
          id: authData.user.id,
          role: 'student',
          status: 'approved',
          enrollmentStatus: 'approved',
          name: data.fullName.trim(),
          email: cleanEmail,
          learnerId: generatedLrn,
          lrn: generatedLrn,
          gradeLevel: data.gradeLevel || 8,
          schoolName: data.school || '',
          section: data.section || '',
          classCode,
          teacherId,
          username,
          password: data.password,
          points: 0,
          badges: [],
          completedModules: [],
          progressByModule: {},
          personalizationHistory: [],
          writingSubmissions: [],
          isActive: true,
          joinedDate: new Date().toISOString().split('T')[0],
        }
        return {
          firebaseUser: {
            uid: authData.user.id,
            id: authData.user.id,
            email: cleanEmail,
            displayName: data.fullName.trim(),
          },
          studentAccount,
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password)
      try {
        await updateProfile(cred.user, { displayName: data.fullName.trim() })
      } catch {}

      const studentAccount: StudentAccount = {
        id: cred.user.uid,
        role: 'student',
        status: 'approved',
        enrollmentStatus: 'approved',
        name: data.fullName.trim(),
        email: cleanEmail,
        learnerId: generatedLrn,
        lrn: generatedLrn,
        gradeLevel: data.gradeLevel || 8,
        schoolName: data.school || '',
        section: data.section || '',
        classCode,
        teacherId,
        username,
        password: data.password,
        points: 0,
        badges: [],
        completedModules: [],
        progressByModule: {},
        personalizationHistory: [],
        writingSubmissions: [],
        isActive: true,
        joinedDate: new Date().toISOString().split('T')[0],
      }

      await syncUserProfileToFirestore(cred.user.uid, studentAccount, true)
      await syncStudentProgressToFirestore(cred.user.uid, studentAccount)

      return {
        firebaseUser: {
          uid: cred.user.uid,
          id: cred.user.uid,
          email: cleanEmail,
          displayName: data.fullName.trim(),
        },
        studentAccount,
      }
    } catch (error) {
      throw new Error(friendlyAuthError(error))
    }
  }

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw new Error(friendlyAuthError(error))
      throw new Error('Redirecting to Google sign-in.')
    }

    try {
      const result = await signInWithPopup(auth, googleAuthProvider)
      const fbUser = result.user
      let existingProfile = await getUserProfileFromFirestore(fbUser.uid)
      if (!existingProfile) {
        const nowIso = new Date().toISOString()
        const generatedLrn = `129${Math.floor(100000000 + Math.random() * 900000000)}`
        const fallbackAccount: StudentAccount = {
          id: fbUser.uid,
          role: 'student',
          status: 'approved',
          enrollmentStatus: 'approved',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student Explorer',
          email: fbUser.email || '',
          learnerId: generatedLrn,
          lrn: generatedLrn,
          gradeLevel: 8,
          schoolName: 'Mati National Comprehensive High School',
          section: '',
          classCode: 'LQ-ENG-8492',
          teacherId: 'tch-marco-solis',
          username: fbUser.email?.split('@')[0] || fbUser.uid.slice(0, 8),
          points: 0,
          badges: [],
          completedModules: [],
          progressByModule: {},
          personalizationHistory: [],
          writingSubmissions: [],
          isActive: true,
          joinedDate: nowIso.split('T')[0],
          photoUrl: fbUser.photoURL || undefined,
        }
        existingProfile =
          (await syncUserProfileToFirestore(fbUser.uid, fallbackAccount, true)) || {
            uid: fbUser.uid,
            id: fbUser.uid,
            displayName: fallbackAccount.name,
            name: fallbackAccount.name,
            email: fallbackAccount.email || '',
            role: 'student',
            status: 'approved',
            gradeLevel: 8,
            school: fallbackAccount.schoolName,
            schoolName: fallbackAccount.schoolName,
            createdAt: nowIso,
            lastLoginAt: nowIso,
          }
      }
      return {
        firebaseUser: {
          uid: fbUser.uid,
          id: fbUser.uid,
          email: fbUser.email || undefined,
          displayName: fbUser.displayName || undefined,
          photoURL: fbUser.photoURL || undefined,
        },
        profile: existingProfile,
      }
    } catch (error) {
      throw new Error(friendlyAuthError(error))
    }
  }

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
    await signOut(auth).catch(() => {})
    setUser(null)
    setProfile(null)
    setRole(null)
  }

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address to receive your password reset link.')
    }
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) throw new Error(friendlyAuthError(error))
      return
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail)
    } catch (error) {
      throw new Error(friendlyAuthError(error))
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, role, loading, login, signup, loginWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() must be used within an <AuthProvider>.')
  return ctx
}

