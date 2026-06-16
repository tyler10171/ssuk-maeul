// 수동 작성 타입 (Supabase CLI gen types로 자동화는 Step 8+에서)

export type Stage = 'pregnancy' | 'birth' | 'childcare'
export type Housing = 'own' | 'jeonse' | 'monthly_rent' | 'none'

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
