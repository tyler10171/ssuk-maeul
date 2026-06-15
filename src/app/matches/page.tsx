import SiteHeader from '@/components/site-header'
import ComingSoon from '@/components/coming-soon'

export const metadata = {
  title: '나의 추천 지원 — 쑥 마을',
}

export default function MatchesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ComingSoon
          title="나의 추천 지원, 준비 중이에요"
          description="프로필을 입력하시면 거주지·시기·자녀나이·소득·주택 조건에 맞춰 받을 수 있는 지원을 자동으로 추려서 보여드릴 예정이에요."
          bullets={[
            '내 조건에 맞는 정책만 자동 매칭',
            '신청 마감일이 임박하면 이메일·웹푸시로 알림',
            '관심/완료 상태로 진행상황 관리 (Phase 2)',
            '시기가 바뀌면 매칭 결과도 자동 갱신',
          ]}
        />
      </main>
    </>
  )
}
