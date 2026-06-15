import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-emerald-700 tracking-tight">
          쑥 마을
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-600 hidden sm:inline">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                시작하기
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
