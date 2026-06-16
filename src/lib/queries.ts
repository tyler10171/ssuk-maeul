import { createClient } from './supabase/server'
import type { Profile } from '@/types/database'

export type CurrentSession = {
  user: { id: string; email: string } | null
  profile: Profile | null
}

export async function getCurrentSession(): Promise<CurrentSession> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('[getCurrentSession] auth error', authError)
      return { user: null, profile: null }
    }
    if (!user) return { user: null, profile: null }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle<Profile>()

    if (profileError) {
      console.error('[getCurrentSession] profile error', profileError)
      return {
        user: { id: user.id, email: user.email ?? '' },
        profile: null,
      }
    }

    return {
      user: { id: user.id, email: user.email ?? '' },
      profile: profile ?? null,
    }
  } catch (e) {
    console.error('[getCurrentSession] unexpected', e)
    return { user: null, profile: null }
  }
}
