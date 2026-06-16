import type { Stage } from '@/types/database'

export const STAGE_LABEL: Record<Stage, string> = {
  pregnancy: '임신',
  birth: '출산',
  childcare: '육아',
}

export const PROVIDER_LABEL: Record<'central' | 'sido' | 'sigungu', string> = {
  central: '중앙정부',
  sido: '시·도',
  sigungu: '시·군·구',
}

export const SUPPORT_TYPE_LABEL: Record<'cash' | 'voucher' | 'service', string> = {
  cash: '현금',
  voucher: '바우처',
  service: '서비스',
}

export const HOUSING_LABEL: Record<'own' | 'jeonse' | 'monthly_rent' | 'none', string> = {
  own: '자가',
  jeonse: '전세',
  monthly_rent: '월세',
  none: '무주택',
}

export function formatAmount(amount: number | null, supportType: 'cash' | 'voucher' | 'service'): string {
  if (amount === null) return supportType === 'service' ? '서비스 제공' : '금액 미정'
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}천만원`.replace('.0', '')
  if (amount >= 10000) return `${(amount / 10000).toLocaleString()}만원`
  return `${amount.toLocaleString()}원`
}

export function formatPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return '상시 신청'
  if (start && !end) return `${start} ~ 상시`
  if (!start && end) return `~ ${end}`
  return `${start} ~ ${end}`
}

export function dDay(end: string | null): { label: string; urgent: boolean } | null {
  if (!end) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(end)
  endDate.setHours(0, 0, 0, 0)
  const diff = Math.floor((endDate.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return { label: '마감', urgent: false }
  if (diff === 0) return { label: 'D-DAY', urgent: true }
  return { label: `D-${diff}`, urgent: diff <= 14 }
}
