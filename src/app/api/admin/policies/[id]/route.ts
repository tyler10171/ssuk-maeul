import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/queries'
import { isAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { validatePolicyPayload, type PolicyInputBody } from '../_validate'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, ctx: Params) {
  const { user } = await getCurrentSession()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: '권한이 없어요' }, { status: 403 })
  }

  const { id } = await ctx.params

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
  const { error } = await supabase
    .from('policies')
    .update(validation.row)
    .eq('id', id)

  if (error) {
    console.error('[admin policies PATCH]', error)
    return NextResponse.json(
      { error: `수정 실패: ${error.message}`, code: error.code },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, ctx: Params) {
  const { user } = await getCurrentSession()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: '권한이 없어요' }, { status: 403 })
  }

  const { id } = await ctx.params
  const supabase = createAdminClient()
  const { error } = await supabase.from('policies').delete().eq('id', id)

  if (error) {
    console.error('[admin policies DELETE]', error)
    return NextResponse.json(
      { error: `삭제 실패: ${error.message}`, code: error.code },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
