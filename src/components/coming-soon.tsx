import Link from 'next/link'

type Props = {
  title: string
  description: string
  bullets?: string[]
}

export default function ComingSoon({ title, description, bullets }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-8 sm:p-12 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-700 leading-relaxed mb-6">{description}</p>

        {bullets && bullets.length > 0 && (
          <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
        >
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}
