'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-red-100 p-8 space-y-4">
        <div className="text-3xl">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900">문제가 발생했어요</h1>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-red-900">에러 메시지</p>
          <pre className="text-xs text-red-800 whitespace-pre-wrap break-all">
            {error.message || '(메시지 없음)'}
          </pre>
          {error.digest && (
            <p className="text-xs text-red-700">
              <span className="font-medium">digest:</span> {error.digest}
            </p>
          )}
          {error.stack && (
            <details className="text-xs text-red-800">
              <summary className="cursor-pointer font-medium">스택 트레이스</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">{error.stack}</pre>
            </details>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm text-center"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
