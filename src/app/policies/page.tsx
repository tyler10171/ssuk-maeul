import SiteHeader from '@/components/site-header'
import ComingSoon from '@/components/coming-soon'

export const metadata = {
  title: '정책 둘러보기 — 쑥 마을',
}

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ComingSoon
          title="정책 둘러보기, 준비 중이에요"
          description="중앙정부와 17개 광역·시군구의 임신·출산·육아 지원 정책을 한곳에서 검색·비교할 수 있는 페이지를 만들고 있어요."
          bullets={[
            '중앙정부: 부모급여, 첫만남이용권, 아동수당, 산모·신생아 건강관리 등',
            '서울특별시: 임산부 교통비 70만원, 산후조리경비 등',
            '5개 자치구 우선: 강남·서초·송파·마포·성동',
            '시기·지역·소득·자격 조건으로 필터링',
          ]}
        />
      </main>
    </>
  )
}
