import type { Stage, Provider, Category, SupportType, Housing } from '@/types/database'

// 어댑터가 외부 API에서 정책을 가져와 우리 모델로 변환한 결과.
// is_active는 어댑터가 지정하지 않음 — 정책적으로 false(검토 대기)로 일괄 적용.
export type IncomingPolicy = {
  external_id: string
  title: string
  summary: string
  description: string
  provider: Provider
  provider_name: string
  category: Category
  support_type: SupportType
  support_amount: number | null
  target_stage: Stage[]
  target_age_min_months: number | null
  target_age_max_months: number | null
  sido_scope: string[]
  sigungu_scope: string[]
  target_income_max_percentile: number | null
  target_qualifications: string[]
  target_housing: Housing[]
  apply_start: string | null
  apply_end: string | null
  apply_place: string | null
  apply_method: string | null
  external_url: string | null
}

export type AdapterResult = {
  source: string
  ok: boolean
  policies: IncomingPolicy[]
  error?: string
}

export type SyncReport = {
  startedAt: string
  completedAt: string
  durationMs: number
  adapters: AdapterResult[]
  added: number
  updated: number
  skipped: number
  errors: string[]
}

export interface PolicyAdapter {
  readonly source: string
  fetch(): Promise<AdapterResult>
}
