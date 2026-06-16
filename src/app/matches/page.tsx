import { redirect } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import PolicyCard from '@/components/domain/policy-card'
import { createClient } from '@/lib/supabase/server'
import { getCurrentSession } from '@/lib/queries'
import { matchPolicies } from '@/lib/matching/match-policies'
import type { Policy, Child } from '@/types/database'
import { STAGE_LABEL } from '@/lib/policy-format'

export const metadata = {
  title: '나의 추천 지원 — 쑥 마을',
}

export default async function MatchesPage() {
  const { user, profile } = await getCurrentSession()

  if (!user) redirect('/login?next=/matches')
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const [{ data: child }, { data: policies, error }] = await Promise.all([
    supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<Child>(),
    supabase
      .from('policies')
      .select('*')
      .eq('is_active', true)
      .returns<Policy[]>(),
  ])

  const matched = error || !policies ? [] : matchPolicies(profile, child ?? null, policies)
  const totalAmount = matched.reduce((sum, p) => sum + (p.support_amount ?? 0), 0)

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
          <header className="mb-8 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              나의 추천 지원
            </h1>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                📍 {profile.sido} {profile.sigungu}
              </span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                🌿 {STAGE_LABEL[profile.current_stage]}
              </span>
              {(profile.qualifications ?? []).map((q) => (
                <span key={q} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  ✨ {q}
                </span>
              ))}
            </div>
          </header>

          {error ? (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 text-sm">
              정책 정보를 불러오지 못했어요. ({error.message})
            </div>
          ) : matched.length === 0 ? (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-12 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="font-semibold text-gray-900">매칭되는 정책을 찾지 못했어요</p>
              <p className="text-sm text-gray-600">
                정책 데이터가 더 쌓이면 자동으로 안내해드릴게요.
                <br />
                지금은 직접{' '}
                <Link href="/policies" className="text-emerald-700 underline">
                  정책 둘러보기
                </Link>
                에서 둘러봐주세요.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 mb-6">
                <p className="text-sm text-gray-600">받을 수 있는 지원</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  총 {matched.length}건
                </p>
                {totalAmount > 0 && (
                  <p className="text-sm text-gray-700 mt-1">
                    예상 지원금 약{' '}
                    <span className="font-semibold">
                      {(totalAmount / 10000).toLocaleString()}만원
                    </span>{' '}
                    (금액 명시 정책 합산)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matched.map((p) => (
                  <PolicyCard key={p.id} policy={p} />
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/policies"
                  className="inline-block text-sm text-emerald-700 hover:underline"
                >
                  전체 정책 둘러보기 →
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
