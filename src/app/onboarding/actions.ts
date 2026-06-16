'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SIDO_LIST, SIGUNGU_MAP, type Sido } from '@/lib/korean-regions'

export type OnboardingState = {
  error: string | null
  fieldErrors?: Record<string, string>
  success?: boolean
}

export const initialOnboardingState: OnboardingState = { error: null }

const STAGES = ['pregnancy', 'birth', 'childcare'] as const
const HOUSING = ['own', 'jeonse', 'monthly_rent', 'none'] as const
const QUALIFICATIONS = ['다자녀', '한부모', '장애', '청소년산모', '다태아', '외국인'] as const

function num(value: FormDataEntryValue | null): number | null {
  if (value === null) return null
  const s = String(value).trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const sido = String(formData.get('sido') ?? '').trim()
  const sigungu = String(formData.get('sigungu') ?? '').trim()
  const current_stage = String(formData.get('current_stage') ?? '').trim()
  const birth_date = String(formData.get('birth_date') ?? '').trim()
  const due_date = String(formData.get('due_date') ?? '').trim()
  const nickname = String(formData.get('nickname') ?? '').trim()
  const income_percentile = num(formData.get('income_percentile'))
  const household_size = num(formData.get('household_size'))
  const monthly_income_manwon = num(formData.get('monthly_income'))
  const monthly_income = monthly_income_manwon === null ? null : monthly_income_manwon * 10000
  const housing_status_raw = String(formData.get('housing_status') ?? '').trim()
  const qualifications = formData
    .getAll('qualifications')
    .map((v) => String(v))
    .filter((v) => (QUALIFICATIONS as readonly string[]).includes(v))

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

  if (income_percentile !== null && (income_percentile < 1 || income_percentile > 10)) {
    fieldErrors.income_percentile = '1~10 사이로 입력해주세요'
  }
  if (household_size !== null && (household_size < 1 || household_size > 20)) {
    fieldErrors.household_size = '1~20 사이로 입력해주세요'
  }
  if (monthly_income !== null && monthly_income < 0) {
    fieldErrors.monthly_income = '0 이상으로 입력해주세요'
  }
  if (housing_status_raw && !(HOUSING as readonly string[]).includes(housing_status_raw)) {
    fieldErrors.housing_status = '주택 보유 상태를 다시 선택해주세요'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: '입력값을 확인해주세요', fieldErrors }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[onboarding] auth error', authError)
      return { error: '로그인이 만료되었어요. 다시 로그인해주세요.' }
    }

    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('[onboarding] existing check error', existingError)
      return {
        error: `프로필 조회 실패: ${existingError.message} (code: ${existingError.code ?? 'n/a'})`,
      }
    }

    if (!existing) {
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
        console.error('[onboarding] users insert error', userError, 'payload:', userPayload)
        return {
          error: `프로필 저장에 실패했어요: ${userError.message} (code: ${userError.code ?? 'n/a'})`,
        }
      }

      const childPayload = {
        user_id: user.id,
        nickname: nickname || null,
        birth_date: current_stage === 'pregnancy' ? null : birth_date,
        due_date: current_stage === 'pregnancy' ? due_date : null,
      }

      const { error: childError } = await supabase.from('children').insert(childPayload)

      if (childError) {
        console.error('[onboarding] children insert error', childError, 'payload:', childPayload)
        await supabase.from('users').delete().eq('id', user.id)
        return {
          error: `자녀 정보 저장에 실패했어요: ${childError.message} (code: ${childError.code ?? 'n/a'})`,
        }
      }
    }

    revalidatePath('/', 'layout')
    return { error: null, success: true }
  } catch (e) {
    console.error('[onboarding] unexpected error', e)
    const message = e instanceof Error ? e.message : String(e)
    return { error: `예상치 못한 오류가 발생했어요: ${message}` }
  }
}
