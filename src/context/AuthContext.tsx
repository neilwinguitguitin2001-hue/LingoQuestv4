import React, { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { GradeLevel, StudentAccount, UserRole } from '../types/lingoquest'

export interface UserProfileRecord {
  uid: string
  id: string
  displayName: string
  name: string
  email: string
  role: UserRole
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  gradeLevel?: GradeLevel
  school: string
  schoolName: string
  section?: string
  lrn?: string
  learnerId?: string
  classCode?: string
  teacherId?: string
  username?: string
  photoUrl?: string
  createdAt: string
  lastLoginAt: string
  updatedAt?: string
}

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
  profile: UserProfileRecord | null
  role: UserRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserProfileRecord | null>
  signup: (data: StudentSignupInput) => Promise<{ authUser: AuthUser; studentAccount: StudentAccount }>
  loginWithGoogle: () => Promise<{ authUser: AuthUser; profile: UserProfileRecord }>
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

function mapProfile(row: any): UserProfileRecord {
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

async function loadProfile(id: string): Promise<UserProfileRecord | null> {
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
      // Ignore profile load errors when offline
    }
  }
  return null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfileRecord | null>(null)
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

    setLoading(false)
    return () => {
      mounted = false
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
      throw new Error('Supabase authentication is not configured.')
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
          authUser: {
            uid: authData.user.id,
            id: authData.user.id,
            email: cleanEmail,
            displayName: data.fullName.trim(),
          },
          studentAccount,
        }
      }

      throw new Error('Supabase authentication is not configured.')
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
    throw new Error('Supabase authentication is not configured.')
  }

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
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
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw new Error(friendlyAuthError(error))
      return
    }
    throw new Error('Supabase authentication is not configured.')
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
