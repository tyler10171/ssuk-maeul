// 수동 작성 타입 (Supabase CLI gen types로 자동화는 Step 8+에서)

export type Stage = 'pregnancy' | 'birth' | 'childcare'
export type Housing = 'own' | 'jeonse' | 'monthly_rent' | 'none'
export type Provider = 'central' | 'sido' | 'sigungu'
export type SupportType = 'cash' | 'voucher' | 'service'
export type Category = 'pregnancy' | 'birth' | 'childcare'

export type Policy = {
  id: string
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
  source: 'api' | 'manual'
  external_id: string | null
  synced_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  sido: string
  sigungu: string
  current_stage: Stage
  income_percentile: number | null
  household_size: number | null
  monthly_income: number | null
  housing_status: Housing | null
  qualifications: string[]
  notification_prefs: { email: boolean; web_push: boolean }
  created_at: string
  updated_at: string
}

export type Child = {
  id: string
  user_id: string
  nickname: string | null
  birth_date: string | null
  due_date: string | null
  created_at: string
}
