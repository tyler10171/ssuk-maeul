import { SIDO_LIST, SIGUNGU_MAP, type Sido } from '@/lib/korean-regions'

const STAGES = ['pregnancy', 'birth', 'childcare'] as const
const HOUSING = ['own', 'jeonse', 'monthly_rent', 'none'] as const
const QUALIFICATIONS = ['다자녀', '한부모', '장애', '청소년산모', '다태아', '외국인'] as const
const PROVIDERS = ['central', 'sido', 'sigungu'] as const
const SUPPORT_TYPES = ['cash', 'voucher', 'service'] as const
const CATEGORIES = ['pregnancy', 'birth', 'childcare'] as const

export type PolicyInputBody = {
  title?: string
  summary?: string
  description?: string
  provider?: string
  provider_name?: string
  category?: string
  support_type?: string
  support_amount?: number | null
  target_stage?: string[]
  target_age_min_months?: number | null
  target_age_max_months?: number | null
  sido_scope?: string[]
  sigungu_scope?: string[]
  target_income_max_percentile?: number | null
  target_qualifications?: string[]
  target_housing?: string[]
  apply_start?: string | null
  apply_end?: string | null
  apply_place?: string | null
  apply_method?: string | null
  external_url?: string | null
  is_active?: boolean
}

type ValidationOk = {
  ok: true
  row: Record<string, unknown>
}
type ValidationErr = {
  ok: false
  fieldErrors: Record<string, string>
}

function intersect<T>(a: readonly T[], b: readonly T[]): T[] {
  return a.filter((x) => b.includes(x))
}

export function validatePolicyPayload(body: PolicyInputBody): ValidationOk | ValidationErr {
  const fieldErrors: Record<string, string> = {}

  const title = (body.title ?? '').trim()
  const summary = (body.summary ?? '').trim()
  const description = (body.description ?? '').trim()
  const provider = (body.provider ?? '').trim()
  const provider_name = (body.provider_name ?? '').trim()
  const category = (body.category ?? '').trim()
  const support_type = (body.support_type ?? '').trim()

  if (!title) fieldErrors.title = '정책명을 입력해주세요'
  if (!summary) fieldErrors.summary = '한줄 요약을 입력해주세요'
  if (!description) fieldErrors.description = '상세 설명을 입력해주세요'
  if (!(PROVIDERS as readonly string[]).includes(provider)) {
    fieldErrors.provider = '공급 주체를 선택해주세요'
  }
  if (!provider_name) fieldErrors.provider_name = '공급 기관명을 입력해주세요'
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    fieldErrors.category = '카테고리를 선택해주세요'
  }
  if (!(SUPPORT_TYPES as readonly string[]).includes(support_type)) {
    fieldErrors.support_type = '지원 유형을 선택해주세요'
  }

  const target_stage = Array.isArray(body.target_stage)
    ? intersect(STAGES, body.target_stage as readonly string[])
    : []
  if (target_stage.length === 0) {
    fieldErrors.target_stage = '대상 시기를 하나 이상 선택해주세요'
  }

  const sido_scope_raw = Array.isArray(body.sido_scope) ? body.sido_scope : []
  const sido_scope = sido_scope_raw.filter((s) =>
    (SIDO_LIST as readonly string[]).includes(s),
  )
  const sigungu_scope_raw = Array.isArray(body.sigungu_scope) ? body.sigungu_scope : []
  const sigungu_scope = sigungu_scope_raw.filter((g) => {
    if (sido_scope.length === 0) return false
    return sido_scope.some((s) => SIGUNGU_MAP[s as Sido].includes(g))
  })

  const target_qualifications = Array.isArray(body.target_qualifications)
    ? intersect(QUALIFICATIONS, body.target_qualifications as readonly string[])
    : []
  const target_housing = Array.isArray(body.target_housing)
    ? intersect(HOUSING, body.target_housing as readonly string[])
    : []

  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }
  const support_amount = num(body.support_amount)
  const target_age_min_months = num(body.target_age_min_months)
  const target_age_max_months = num(body.target_age_max_months)
  const target_income_max_percentile = num(body.target_income_max_percentile)

  if (
    target_income_max_percentile !== null &&
    (target_income_max_percentile < 1 || target_income_max_percentile > 10)
  ) {
    fieldErrors.target_income_max_percentile = '1~10 사이로 입력해주세요'
  }
  if (
    target_age_min_months !== null &&
    target_age_max_months !== null &&
    target_age_min_months > target_age_max_months
  ) {
    fieldErrors.target_age_max_months = '최대 개월수가 최소보다 작아요'
  }

  const apply_start = body.apply_start?.trim() || null
  const apply_end = body.apply_end?.trim() || null
  const apply_place = body.apply_place?.trim() || null
  const apply_method = body.apply_method?.trim() || null
  const external_url = body.external_url?.trim() || null

  if (external_url && !/^https?:\/\//.test(external_url)) {
    fieldErrors.external_url = 'http:// 또는 https://로 시작해야 해요'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return {
    ok: true,
    row: {
      title,
      summary,
      description,
      provider,
      provider_name,
      category,
      support_type,
      support_amount,
      target_stage,
      target_age_min_months,
      target_age_max_months,
      sido_scope,
      sigungu_scope,
      target_income_max_percentile,
      target_qualifications,
      target_housing,
      apply_start,
      apply_end,
      apply_place,
      apply_method,
      external_url,
      is_active: body.is_active !== false,
    },
  }
}
