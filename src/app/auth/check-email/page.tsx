import Link from 'next/link'

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50/40 p-4">
      <Link href="/" className="mb-6 text-2xl font-bold text-emerald-700 tracking-tight">
        쑥 마을
      </Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
        <div className="text-4xl">📩</div>
        <h1 className="text-xl font-bold text-gray-900">이메일을 확인해주세요</h1>
        <p className="text-sm text-gray-600">
          {email ? (
            <>
              <span className="font-medium text-gray-900">{email}</span>로 인증 메일을 보냈어요.
            </>
          ) : (
            '가입하신 이메일로 인증 메일을 보냈어요.'
          )}
          <br />
          메일의 링크를 눌러 인증을 완료해주세요.
        </p>
        <p className="text-xs text-gray-500">메일이 안 보이면 스팸함도 확인해주세요.</p>
        <Link
          href="/login"
          className="inline-block mt-2 text-sm text-emerald-600 font-medium hover:underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
