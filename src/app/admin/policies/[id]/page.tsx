import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Policy } from '@/types/database'
import PolicyForm from '../policy-form'

export default async function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .maybeSingle<Policy>()

  if (error || !policy) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-6">
        <Link
          href="/admin/policies"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">정책 수정</h1>
        <p className="text-sm text-gray-600 mt-1">
          소스: {policy.source === 'manual' ? '수동 등록' : 'API 동기화'} · ID: {policy.id}
        </p>
      </header>
      <PolicyForm mode="edit" policy={policy} />
    </div>
  )
}
