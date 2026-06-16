import type { Profile, Child, Policy } from '@/types/database'

export type MatchReason = {
  ok: boolean
  label: string
}

export type MatchResult = {
  policy: Policy
  matched: boolean
  reasons: MatchReason[]
}

function monthsBetween(birthDateStr: string, today: Date): number {
  const birth = new Date(birthDateStr)
  return (
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth())
  )
}

export function evaluatePolicy(
  profile: Profile,
  child: Child | null,
  policy: Policy,
  today: Date,
): MatchResult {
  const reasons: MatchReason[] = []
  let matched = true

  if (!policy.target_stage.includes(profile.current_stage)) {
    matched = false
    reasons.push({ ok: false, label: `시기(${policy.target_stage.join('/')})와 불일치` })
  } else {
    reasons.push({ ok: true, label: '시기 일치' })
  }

  if (policy.sido_scope.length > 0 && !policy.sido_scope.includes(profile.sido)) {
    matched = false
    reasons.push({ ok: false, label: '거주 광역 불일치' })
  } else if (
    policy.sigungu_scope.length > 0 &&
    !policy.sigungu_scope.includes(profile.sigungu)
  ) {
    matched = false
    reasons.push({ ok: false, label: '거주 시·군·구 불일치' })
  } else {
    reasons.push({ ok: true, label: '거주지 일치' })
  }

  if (profile.current_stage !== 'pregnancy' && child?.birth_date) {
    const months = monthsBetween(child.birth_date, today)
    if (
      policy.target_age_min_months !== null &&
      months < policy.target_age_min_months
    ) {
      matched = false
      reasons.push({ ok: false, label: '자녀 나이 부족' })
    } else if (
      policy.target_age_max_months !== null &&
      months > policy.target_age_max_months
    ) {
      matched = false
      reasons.push({ ok: false, label: '자녀 나이 초과' })
    } else if (
      policy.target_age_min_months !== null ||
      policy.target_age_max_months !== null
    ) {
      reasons.push({ ok: true, label: '자녀 나이 일치' })
    }
  }

  if (
    policy.target_income_max_percentile !== null &&
    profile.income_percentile !== null &&
    profile.income_percentile > policy.target_income_max_percentile
  ) {
    matched = false
    reasons.push({ ok: false, label: '소득 기준 초과' })
  } else if (
    policy.target_income_max_percentile !== null &&
    profile.income_percentile !== null
  ) {
    reasons.push({ ok: true, label: '소득 기준 충족' })
  }

  if (policy.target_qualifications.length > 0) {
    const hasAny = policy.target_qualifications.some((q) =>
      profile.qualifications.includes(q),
    )
    if (!hasAny) {
      matched = false
      reasons.push({
        ok: false,
        label: `특수자격(${policy.target_qualifications.join('/')}) 필요`,
      })
    } else {
      reasons.push({ ok: true, label: '특수자격 충족' })
    }
  }

  if (
    policy.target_housing.length > 0 &&
    profile.housing_status &&
    !policy.target_housing.includes(profile.housing_status)
  ) {
    matched = false
    reasons.push({ ok: false, label: '주택 조건 불일치' })
  }

  if (policy.apply_end) {
    const endDate = new Date(policy.apply_end)
    if (endDate < today) {
      matched = false
      reasons.push({ ok: false, label: '신청 기간 종료' })
    }
  }

  return { policy, matched, reasons }
}

export function matchPolicies(
  profile: Profile,
  child: Child | null,
  policies: Policy[],
): Policy[] {
  const today = new Date()
  return policies
    .map((p) => evaluatePolicy(profile, child, p, today))
    .filter((r) => r.matched)
    .map((r) => r.policy)
    .sort((a, b) => {
      const aD = a.apply_end ? new Date(a.apply_end).getTime() : Number.MAX_SAFE_INTEGER
      const bD = b.apply_end ? new Date(b.apply_end).getTime() : Number.MAX_SAFE_INTEGER
      if (aD !== bD) return aD - bD
      return (b.support_amount ?? 0) - (a.support_amount ?? 0)
    })
}
