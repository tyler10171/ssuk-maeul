import SiteHeader from '@/components/site-header'
import ComingSoon from '@/components/coming-soon'

export const metadata = {
  title: '프로필 입력 — 쑥 마을',
}

export default function OnboardingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ComingSoon
          title="프로필 입력, 준비 중이에요"
          description="여기서 거주지·시기·자녀 정보·소득·주택 등을 입력하면 받을 수 있는 지원을 자동으로 찾아드려요. 곧 만나요!"
          bullets={[
            '거주지(시도·시군구) 선택',
            '현재 시기(임신·출산·육아) 선택',
            '자녀 정보 (생년월일 또는 출산예정일)',
            '소득·주택·특수자격 (선택, 매칭 정확도 향상)',
          ]}
        />
      </main>
    </>
  )
}
