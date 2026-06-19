import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminHomePage() {
  const supabase = createAdminClient()

  const [
    { count: totalPolicies },
    { count: activePolicies },
    { count: pregnancyPolicies },
    { count: birthPolicies },
    { count: childcarePolicies },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('policies').select('*', { count: 'exact', head: true }),
    supabase.from('policies').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('policies').select('*', { count: 'exact', head: true }).eq('category', 'pregnancy'),
    supabase.from('policies').select('*', { count: 'exact', head: true }).eq('category', 'birth'),
    supabase.from('policies').select('*', { count: 'exact', head: true }).eq('category', 'childcare'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '전체 정책', value: totalPolicies ?? 0, color: 'bg-blue-50 text-blue-800' },
    { label: '활성 정책', value: activePolicies ?? 0, color: 'bg-emerald-50 text-emerald-800' },
    { label: '임신', value: pregnancyPolicies ?? 0, color: 'bg-pink-50 text-pink-800' },
    { label: '출산', value: birthPolicies ?? 0, color: 'bg-orange-50 text-orange-800' },
    { label: '육아', value: childcarePolicies ?? 0, color: 'bg-amber-50 text-amber-800' },
    { label: '가입 사용자', value: totalUsers ?? 0, color: 'bg-purple-50 text-purple-800' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-sm text-gray-600 mt-1">정책 등록·수정과 통계를 관리합니다.</p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/policies"
          className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-sm transition"
        >
          <h2 className="font-semibold text-gray-900">정책 관리</h2>
          <p className="text-sm text-gray-600 mt-1">
            정책 목록을 확인하고 새 정책을 등록하거나 기존 정책을 수정합니다.
          </p>
        </Link>
        <Link
          href="/admin/policies/new"
          className="bg-emerald-600 text-white rounded-xl p-6 hover:bg-emerald-700 transition"
        >
          <h2 className="font-semibold">+ 새 정책 등록</h2>
          <p className="text-sm opacity-90 mt-1">
            정책을 바로 추가합니다. SQL 없이 폼으로 입력하세요.
          </p>
        </Link>
      </section>
    </div>
  )
}
