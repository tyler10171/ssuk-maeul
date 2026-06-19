import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Policy } from '@/types/database'
import {
  PROVIDER_LABEL,
  STAGE_LABEL,
  SUPPORT_TYPE_LABEL,
  formatAmount,
} from '@/lib/policy-format'

export default async function AdminPoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; provider?: string }>
}) {
  const { q, category, provider } = await searchParams

  const supabase = createAdminClient()
  let query = supabase
    .from('policies')
    .select('*')
    .order('updated_at', { ascending: false })

  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  if (category) query = query.eq('category', category)
  if (provider) query = query.eq('provider', provider)

  const { data: policies, error } = await query.returns<Policy[]>()

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">정책 관리</h1>
          <p className="text-sm text-gray-600 mt-1">
            전체 {policies?.length ?? 0}건
          </p>
        </div>
        <Link
          href="/admin/policies/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition text-sm"
        >
          + 새 정책 등록
        </Link>
      </header>

      <form className="flex flex-wrap gap-2 mb-4" action="/admin/policies">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="제목·요약 검색"
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64"
        />
        <select
          name="category"
          defaultValue={category ?? ''}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">전체 카테고리</option>
          <option value="pregnancy">임신</option>
          <option value="birth">출산</option>
          <option value="childcare">육아</option>
        </select>
        <select
          name="provider"
          defaultValue={provider ?? ''}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">전체 기관</option>
          <option value="central">중앙정부</option>
          <option value="sido">시·도</option>
          <option value="sigungu">시·군·구</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
        >
          검색
        </button>
        {(q || category || provider) && (
          <Link
            href="/admin/policies"
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            초기화
          </Link>
        )}
      </form>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 text-sm">
          정책 정보를 불러오지 못했어요. ({error.message})
        </div>
      ) : !policies || policies.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          조건에 맞는 정책이 없어요.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">기관</th>
                <th className="px-4 py-3">시기</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3 text-right">금액</th>
                <th className="px-4 py-3">지역</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">소스</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => {
                const regionLabel =
                  p.sigungu_scope?.length
                    ? p.sigungu_scope.join(', ')
                    : p.sido_scope?.length
                      ? p.sido_scope.join(', ')
                      : '전국'
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/policies/${p.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-700"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{PROVIDER_LABEL[p.provider]}</div>
                      <div className="text-xs text-gray-500">{p.provider_name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {(p.target_stage ?? []).map((s) => STAGE_LABEL[s]).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {SUPPORT_TYPE_LABEL[p.support_type]}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                      {formatAmount(p.support_amount, p.support_type)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{regionLabel}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          활성
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.source === 'manual' ? '수동' : 'API'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
