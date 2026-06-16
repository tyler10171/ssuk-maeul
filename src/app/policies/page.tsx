import SiteHeader from '@/components/site-header'
import PolicyCard from '@/components/domain/policy-card'
import { createClient } from '@/lib/supabase/server'
import type { Policy, Category } from '@/types/database'
import Link from 'next/link'

export const metadata = {
  title: '정책 둘러보기 — 쑥 마을',
}

const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pregnancy', label: '임신' },
  { value: 'birth', label: '출산' },
  { value: 'childcare', label: '육아' },
]

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const selected: Category | 'all' = (CATEGORIES.find((c) => c.value === category)?.value ?? 'all') as
    | Category
    | 'all'

  const supabase = await createClient()
  let query = supabase
    .from('policies')
    .select('*')
    .eq('is_active', true)
    .order('apply_end', { ascending: true, nullsFirst: false })

  if (selected !== 'all') {
    query = query.eq('category', selected)
  }

  const { data: policies, error } = await query.returns<Policy[]>()

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
          <header className="mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">정책 둘러보기</h1>
            <p className="text-gray-600">
              임신·출산·육아 단계의 정부·지자체 지원을 모두 모아 보여드려요.
              <br className="hidden sm:inline" />내 조건에 맞는 추천은{' '}
              <Link href="/matches" className="text-emerald-700 underline">
                나의 추천 지원
              </Link>
              에서 확인할 수 있어요.
            </p>
          </header>

          <nav className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={c.value === 'all' ? '/policies' : `/policies?category=${c.value}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  selected === c.value
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {error ? (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 text-sm">
              정책 정보를 불러오지 못했어요. ({error.message})
            </div>
          ) : !policies || policies.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center space-y-2">
              <div className="text-4xl">🌱</div>
              <p className="text-gray-600">
                {selected === 'all'
                  ? '아직 등록된 정책이 없어요.'
                  : '이 카테고리에는 아직 정책이 없어요.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">총 {policies.length}건</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {policies.map((p) => (
                  <PolicyCard key={p.id} policy={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
