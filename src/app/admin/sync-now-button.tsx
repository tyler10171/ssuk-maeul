'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type SyncReport = {
  durationMs: number
  added: number
  updated: number
  skipped: number
  errors: string[]
}

export default function SyncNowButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<SyncReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function trigger() {
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/sync-now', { method: 'POST' })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? '동기화 실패')
          return
        }
        setResult(data as SyncReport)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">정책 자동 동기화</h2>
          <p className="text-sm text-gray-600 mt-1">
            공공데이터포털에서 정책을 가져옵니다. 새 정책은 <b>검토 대기(비활성)</b>로 들어와요.
          </p>
        </div>
        <button
          type="button"
          onClick={trigger}
          disabled={pending}
          className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
        >
          {pending ? '동기화 중...' : '지금 동기화'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-3 text-xs">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs space-y-1">
          <p>
            <span className="font-semibold">완료</span> · {(result.durationMs / 1000).toFixed(1)}초
          </p>
          <p>
            추가 <b>{result.added}</b> · 업데이트 <b>{result.updated}</b> · 건너뜀{' '}
            <b>{result.skipped}</b>
          </p>
          {result.errors.length > 0 && (
            <details>
              <summary className="cursor-pointer text-red-700">
                에러 {result.errors.length}건
              </summary>
              <ul className="mt-1 ml-4 list-disc text-red-700 space-y-0.5">
                {result.errors.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
