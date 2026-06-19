import type { AdapterResult, IncomingPolicy, PolicyAdapter } from '../types'
import type { Stage, Category } from '@/types/database'

// 공공데이터포털 — 행정안전부 "대한민국 공공서비스(혜택) 정보" (보조금24)
// https://www.data.go.kr/data/15113968/openapi.do
//
// 키 발급:
//   1) data.go.kr 회원가입
//   2) 위 데이터셋 → "활용 신청"
//   3) 마이페이지 → 일반 인증키(Encoding) 복사
//   4) Vercel 환경변수 PUBLIC_DATA_API_KEY 에 추가
//
// 주의:
//   - 응답 필드명·구조는 신청 시점·버전에 따라 다를 수 있음. 실제 첫 호출 응답을 보고 매핑 보정 필요.
//   - 본 어댑터는 한 페이지(최대 1000건)만 조회. 대규모 동기화는 페이지네이션 추가.

const BASE_URL = 'https://api.odcloud.kr/api/gov24/v3/serviceList'

type Gov24Item = Record<string, unknown>

type Gov24Response = {
  currentCount?: number
  data?: Gov24Item[]
  matchCount?: number
  page?: number
  perPage?: number
  totalCount?: number
}

function getStr(obj: Gov24Item, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function inferStages(text: string): Stage[] {
  const stages: Stage[] = []
  if (/임신|임산부|산모/.test(text)) stages.push('pregnancy')
  if (/출산|신생아/.test(text)) stages.push('birth')
  if (/영유아|아동|육아|보육|유아|초등|청소년/.test(text)) stages.push('childcare')
  return stages.length > 0 ? stages : ['childcare']
}

function inferCategory(text: string): Category {
  if (/임신|임산부|산모/.test(text)) return 'pregnancy'
  if (/출산|신생아/.test(text)) return 'birth'
  return 'childcare'
}

function inferQualifications(text: string): string[] {
  const result: string[] = []
  if (/다자녀|다자녀가구/.test(text)) result.push('다자녀')
  if (/한부모|편부|편모/.test(text)) result.push('한부모')
  if (/장애아동|장애인 자녀|장애아/.test(text)) result.push('장애')
  if (/청소년 산모|청소년산모/.test(text)) result.push('청소년산모')
  if (/다태아|쌍둥이|세쌍둥이/.test(text)) result.push('다태아')
  if (/외국인/.test(text)) result.push('외국인')
  return result
}

function mapItem(item: Gov24Item): IncomingPolicy | null {
  const title = getStr(item, '서비스명', 'serviceName')
  if (!title) return null

  const summary =
    getStr(item, '서비스목적', 'servicePurpose') ||
    getStr(item, '서비스요약', 'summary') ||
    title
  const description =
    getStr(item, '지원내용', 'supportDetail') ||
    getStr(item, '지원대상', 'targetDescription') ||
    summary

  const providerName = getStr(item, '소관기관명', '소관기관', 'department') || '정부'
  const target = getStr(item, '지원대상', '대상자', 'targetDescription')
  const combined = `${title} ${summary} ${target}`

  const externalId =
    getStr(item, '서비스ID', 'serviceId', '서비스아이디') || ''
  if (!externalId) return null

  return {
    external_id: externalId,
    title,
    summary: summary.slice(0, 200),
    description,
    provider: 'central',
    provider_name: providerName,
    category: inferCategory(combined),
    support_type: 'service',
    support_amount: null,
    target_stage: inferStages(combined),
    target_age_min_months: null,
    target_age_max_months: null,
    sido_scope: [],
    sigungu_scope: [],
    target_income_max_percentile: null,
    target_qualifications: inferQualifications(combined),
    target_housing: [],
    apply_start: null,
    apply_end: null,
    apply_place: getStr(item, '접수기관', 'applyAgency') || null,
    apply_method: getStr(item, '신청방법', 'applyMethod') || null,
    external_url:
      getStr(item, '온라인신청사이트URL', 'onlineApplicationUrl', 'siteUrl') ||
      'https://www.gov.kr',
  }
}

export class Gov24Adapter implements PolicyAdapter {
  readonly source = 'gov24'

  async fetch(): Promise<AdapterResult> {
    const apiKey = process.env.PUBLIC_DATA_API_KEY
    if (!apiKey) {
      return {
        source: this.source,
        ok: false,
        policies: [],
        error: 'PUBLIC_DATA_API_KEY 환경변수가 없어요. data.go.kr 활용 신청 후 키 등록 필요.',
      }
    }

    const url = new URL(BASE_URL)
    url.searchParams.set('serviceKey', apiKey)
    url.searchParams.set('page', '1')
    url.searchParams.set('perPage', '50')
    url.searchParams.set('cond[지원유형::EQ]', '영유아')

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })

      if (!res.ok) {
        const text = await res.text()
        return {
          source: this.source,
          ok: false,
          policies: [],
          error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
        }
      }

      const data = (await res.json()) as Gov24Response
      const items = data.data ?? []
      const policies = items.map(mapItem).filter((p): p is IncomingPolicy => p !== null)

      return { source: this.source, ok: true, policies }
    } catch (e) {
      return {
        source: this.source,
        ok: false,
        policies: [],
        error: e instanceof Error ? e.message : String(e),
      }
    }
  }
}
