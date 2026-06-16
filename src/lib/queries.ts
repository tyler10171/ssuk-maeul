import { createClient } from './supabase/server'
import type { Profile } from '@/types/database'

export type CurrentSession = {
  user: { id: string; email: string } | null
  profile: Profile | null
}

export async function getCurrentSession(): Promise<CurrentSession> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>()

  return {
    user: { id: user.id, email: user.email ?? '' },
    profile: profile ?? null,
  }
}
