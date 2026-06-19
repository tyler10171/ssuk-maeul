import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/queries'
import { isAdmin } from '@/lib/admin'

export const metadata = {
  title: '관리자 — 쑥 마을',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession()

  if (!user) redirect('/login?next=/admin')
  if (!isAdmin(user.email)) redirect('/')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold tracking-tight">
              🌱 쑥 마을 관리자
            </Link>
            <nav className="flex gap-4 text-sm text-gray-300">
              <Link href="/admin" className="hover:text-white">
                대시보드
              </Link>
              <Link href="/admin/policies" className="hover:text-white">
                정책 관리
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">{user.email}</span>
            <Link href="/" className="text-gray-300 hover:text-white">
              ← 사이트로
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
