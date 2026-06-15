'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from './actions'
import { initialAuthState } from '@/lib/auth-state'

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialAuthState)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
        <p className="mt-1 text-sm text-gray-600">받을 수 있는 지원을 자동으로 찾아드릴게요</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">8자 이상</p>
        </div>

        {state.error && !state.fieldErrors && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition"
        >
          {pending ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-emerald-600 font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
