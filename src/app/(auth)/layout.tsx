import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50/40 p-4">
      <Link
        href="/"
        className="mb-6 text-2xl font-bold text-emerald-700 tracking-tight"
      >
        쑥 마을
      </Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  )
}
