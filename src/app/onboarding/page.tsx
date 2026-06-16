import { redirect } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import { getCurrentSession } from '@/lib/queries'
import OnboardingForm from './onboarding-form'

export const metadata = {
  title: '프로필 입력 — 쑥 마을',
}

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentSession()

  if (!user) redirect('/login?next=/onboarding')
  if (profile) redirect('/matches')

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-10 sm:py-14">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">프로필 입력</h1>
            <p className="text-gray-600">
              받을 수 있는 지원을 정확히 찾으려면 잠깐만 알려주세요.
              <br className="hidden sm:inline" />
              민감 정보는 매칭에만 쓰이고 안전하게 저장돼요.
            </p>
          </div>
          <OnboardingForm />
        </div>
      </main>
    </>
  )
}
