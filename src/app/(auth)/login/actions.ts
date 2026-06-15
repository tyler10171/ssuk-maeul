'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { credentialsSchema } from '@/lib/validation'
import type { AuthActionState } from '@/lib/auth-state'

export async function login(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    const fieldErrors: AuthActionState['fieldErrors'] = {}
    for (const issue of issues) {
      const field = issue.path[0]
      if (field === 'email' || field === 'password') {
        fieldErrors[field] = issue.message
      }
    }
    return { error: '입력값을 확인해주세요', fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error: '이메일 인증이 완료되지 않았어요. 받은 이메일의 링크를 먼저 클릭해주세요.',
      }
    }
    return { error: '이메일 또는 비밀번호가 올바르지 않아요' }
  }

  revalidatePath('/', 'layout')
  const next = formData.get('next')
  redirect(typeof next === 'string' && next.startsWith('/') ? next : '/')
}
