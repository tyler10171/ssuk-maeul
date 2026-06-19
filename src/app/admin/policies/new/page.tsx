import Link from 'next/link'
import PolicyForm from '../policy-form'

export default function NewPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-6">
        <Link
          href="/admin/policies"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">새 정책 등록</h1>
        <p className="text-sm text-gray-600 mt-1">
          별표(*) 항목은 필수입니다. 그 외는 비워둬도 됩니다.
        </p>
      </header>
      <PolicyForm mode="new" />
    </div>
  )
}
