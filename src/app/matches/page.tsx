import { redirect } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import ComingSoon from '@/components/coming-soon'
import { getCurrentSession } from '@/lib/queries'

export const metadata = {
  title: '나의 추천 지원 — 쑥 마을',
}

export default async function MatchesPage() {
  const { user, profile } = await getCurrentSession()

  if (!user) redirect('/login?next=/matches')
  if (!profile) redirect('/onboarding')

  const qualifications = profile.qualifications ?? []
  const sigungu = profile.sigungu ?? ''
  const sido = profile.sido ?? ''

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ComingSoon
          title={`${sigungu || '내'} 지역에서 받을 수 있는 지원을 찾는 중이에요`}
          description="입력하신 프로필 기준으로 매칭 결과를 보여드릴 예정이에요. 정책 데이터와 매칭 엔진은 곧 연결됩니다."
          bullets={[
            `거주지: ${sido} ${sigungu}`.trim() || '거주지 미입력',
            `시기: ${stageLabel(profile.current_stage)}`,
            qualifications.length > 0 ? `자격: ${qualifications.join(', ')}` : '자격: 일반',
            '신청 마감일이 임박하면 이메일·웹푸시로 알림 예정',
          ]}
        />
      </main>
    </>
  )
}

function stageLabel(s: string) {
  return s === 'pregnancy' ? '임신 중' : s === 'birth' ? '출산 직후' : '육아 중'
}
