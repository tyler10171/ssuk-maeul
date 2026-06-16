import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SIDO_LIST, SIGUNGU_MAP, type Sido } from '@/lib/korean-regions'

const STAGES = ['pregnancy', 'birth', 'childcare'] as const
const HOUSING = ['own', 'jeonse', 'monthly_rent', 'none'] as const
const QUALIFICATIONS = ['다자녀', '한부모', '장애', '청소년산모', '다태아', '외국인'] as const

type Body = {
  sido?: string
  sigungu?: string
  current_stage?: string
  birth_date?: string
  due_date?: string
  nickname?: string
  income_percentile?: number | null
  household_size?: number | null
  monthly_income?: number | null
  housing_status?: string
  qualifications?: string[]
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const sido = String(body.sido ?? '').trim()
  const sigungu = String(body.sigungu ?? '').trim()
  const current_stage = String(body.current_stage ?? '').trim()
  const birth_date = String(body.birth_date ?? '').trim()
  const due_date = String(body.due_date ?? '').trim()
  const nickname = String(body.nickname ?? '').trim()
  const housing_status_raw = String(body.housing_status ?? '').trim()
  const income_percentile = typeof body.income_percentile === 'number' ? body.income_percentile : null
  const household_size = typeof body.household_size === 'number' ? body.household_size : null
  const monthly_income_manwon = typeof body.monthly_income === 'number' ? body.monthly_income : null
  const monthly_income = monthly_income_manwon === null ? null : monthly_income_manwon * 10000
  const qualifications = Array.isArray(body.qualifications)
    ? body.qualifications.filter((v) => (QUALIFICATIONS as readonly string[]).includes(v))
    : []

  const fieldErrors: Record<string, string> = {}
  if (!(SIDO_LIST as readonly string[]).includes(sido)) {
    fieldErrors.sido = '시·도를 선택해주세요'
  } else if (!sigungu || !SIGUNGU_MAP[sido as Sido].includes(sigungu)) {
    fieldErrors.sigungu = '시·군·구를 선택해주세요'
  }
  if (!(STAGES as readonly string[]).includes(current_stage)) {
    fieldErrors.current_stage = '현재 시기를 선택해주세요'
  } else if (current_stage === 'pregnancy') {
    if (!due_date) fieldErrors.due_date = '출산예정일을 입력해주세요'
  } else {
    if (!birth_date) fieldErrors.birth_date = '생년월일을 입력해주세요'
  }
  if (housing_status_raw && !(HOUSING as readonly string[]).includes(housing_status_raw)) {
    fieldErrors.housing_status = '주택 보유 상태를 다시 선택해주세요'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', fieldErrors },
      { status: 400 },
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[onboarding-api] auth error', authError)
      return NextResponse.json({ error: '로그인이 만료되었어요' }, { status: 401 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('[onboarding-api] existing check', existingError)
      return NextResponse.json(
        { error: `조회 실패: ${existingError.message}`, code: existingError.code },
        { status: 500 },
      )
    }

    if (existing) {
      return NextResponse.json({ success: true, redirectTo: '/matches' })
    }

    const userPayload = {
      id: user.id,
      email: user.email!,
      sido,
      sigungu,
      current_stage,
      income_percentile,
      household_size,
      monthly_income,
      housing_status: housing_status_raw || null,
      qualifications,
    }
    const { error: userError } = await supabase.from('users').insert(userPayload)
    if (userError) {
      console.error('[onboarding-api] users insert error', userError, 'payload:', userPayload)
      return NextResponse.json(
        { error: `프로필 저장 실패: ${userError.message}`, code: userError.code, hint: userError.hint },
        { status: 500 },
      )
    }

    const childPayload = {
      user_id: user.id,
      nickname: nickname || null,
      birth_date: current_stage === 'pregnancy' ? null : birth_date,
      due_date: current_stage === 'pregnancy' ? due_date : null,
    }
    const { error: childError } = await supabase.from('children').insert(childPayload)
    if (childError) {
      console.error('[onboarding-api] children insert error', childError, 'payload:', childPayload)
      await supabase.from('users').delete().eq('id', user.id)
      return NextResponse.json(
        { error: `자녀 저장 실패: ${childError.message}`, code: childError.code },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, redirectTo: '/matches' })
  } catch (e) {
    console.error('[onboarding-api] unexpected', e)
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `예상치 못한 오류: ${message}` }, { status: 500 })
  }
}
