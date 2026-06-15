import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-6">
            <p className="inline-block px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
              놓치지 않는 육아 지원
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
              받을 수 있는 지원이
              <br />
              알아서 도착해요
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              임신부터 육아까지, 정부와 지자체가 주는 지원을
              <br className="hidden sm:block" />
              내 조건에 맞게 추려서 시기에 맞춰 알려드려요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {user ? (
                <Link
                  href="/matches"
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
                >
                  나의 추천 지원 보러가기
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
                  >
                    무료로 시작하기
                  </Link>
                  <Link
                    href="/policies"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    정책 둘러보기
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-6 text-xs text-gray-500">
          © 2026 쑥 마을 · Phase 1 (MVP) 개발 중
        </div>
      </footer>
    </div>
  )
}
