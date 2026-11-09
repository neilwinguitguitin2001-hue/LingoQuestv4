import { createClient, SupabaseClient } from '@supabase/supabase-js'

const metaEnv =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env) ||
  {}
const procEnv =
  (typeof process !== 'undefined' && process.env
    ? (process.env as Record<string, string | undefined>)
    : {}) || {}

const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  procEnv.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv.SUPABASE_URL ||
  ''

const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  procEnv.SUPABASE_ANON_KEY ||
  procEnv.SUPABASE_PUBLISHABLE_KEY ||
  ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'undefined' &&
    supabaseAnonKey !== 'undefined'
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
      },
    })
  : null
