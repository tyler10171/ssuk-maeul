'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { credentialsSchema } from '@/lib/validation'
import type { AuthActionState } from '@/lib/auth-state'

export async function signup(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const fieldErrors: AuthActionState['fieldErrors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (field === 'email' || field === 'password') {
        fieldErrors[field] = issue.message
      }
    }
    return { error: '입력값을 확인해주세요', fieldErrors }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return {
        error: '이미 가입된 이메일이에요. 로그인을 시도해보세요.',
        fieldErrors: { email: '이미 가입된 이메일이에요' },
      }
    }
    return { error: error.message }
  }

  redirect(`/auth/check-email?email=${encodeURIComponent(parsed.data.email)}`)
}
