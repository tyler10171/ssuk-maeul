import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/queries'
import { isAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { validatePolicyPayload, type PolicyInputBody } from './_validate'

export async function POST(request: Request) {
  const { user } = await getCurrentSession()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: '권한이 없어요' }, { status: 403 })
  }

  let body: PolicyInputBody
  try {
    body = (await request.json()) as PolicyInputBody
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const validation = validatePolicyPayload(body)
  if (!validation.ok) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', fieldErrors: validation.fieldErrors },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('policies')
    .insert({ ...validation.row, source: 'manual', is_active: true })
    .select('id')
    .single()

  if (error) {
    console.error('[admin policies POST]', error)
    return NextResponse.json(
      { error: `정책 생성 실패: ${error.message}`, code: error.code },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, id: data.id })
}
