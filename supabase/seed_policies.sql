-- 쑥 마을 1차 정책 시드 (30건)
-- 출처: policies-upload-plan.txt 참조. 2026-06 기준.
-- 적용: Supabase SQL Editor에서 통째로 실행.
-- 재실행 가능: 기존 시드 정책(source='manual', external_id 패턴) 먼저 삭제 후 INSERT.

delete from policies where source = 'manual' and external_id like 'seed-%';

insert into policies (
  title, summary, description,
  provider, provider_name, category, support_type, support_amount,
  target_stage, target_age_min_months, target_age_max_months,
  sido_scope, sigungu_scope, target_income_max_percentile,
  target_qualifications, target_housing,
  apply_start, apply_end, apply_place, apply_method,
  external_url, source, external_id
) values

-- ========== 중앙정부 · 임신 ==========
(
  '임신·출산 진료비 (국민행복카드)',
  '임신부터 출산 후까지 진료비를 바우처로 지원',
  '임신이 확인된 시점부터 국민행복카드를 통해 진료비를 지원받을 수 있습니다. 단태아 100만원, 다태아 140만원이며, 분만 후 2년까지 사용 가능합니다.',
  'central', '보건복지부', 'pregnancy', 'voucher', 1000000,
  ARRAY['pregnancy','birth']::stage[], null, null,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '국민행복카드 제휴 카드사 또는 정부24', '온라인/방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-pregnancy-care-voucher'
),
(
  '청소년 산모 임신·출산 의료비 지원',
  '만 19세 이하 산모에게 추가 의료비 120만원',
  '만 19세 이하 청소년 산모에게 국민행복카드와 별도로 120만원의 추가 의료비를 지원합니다.',
  'central', '보건복지부', 'pregnancy', 'voucher', 1200000,
  ARRAY['pregnancy','birth']::stage[], null, null,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY['청소년산모']::text[], ARRAY[]::housing_status[],
  null, null, '관할 보건소 / 복지로', '온라인/방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-teen-mom-medical'
),
(
  '임산부 친환경농산물 꾸러미',
  '임산부에게 친환경 식재료 꾸러미 연 48만원 상당 지원',
  '임산부에게 친환경 농산물 꾸러미를 제공해 영양 균형을 돕습니다. 농림축산식품부 사업으로 지자체 매칭 운영.',
  'central', '농림축산식품부', 'pregnancy', 'voucher', 480000,
  ARRAY['pregnancy']::stage[], null, null,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '관할 시군구 농정과', '방문',
  null, 'manual', 'seed-eco-food-package'
),

-- ========== 중앙정부 · 출산 ==========
(
  '첫만남이용권',
  '출생아 1인당 200만원 바우처 (둘째 이상 300만원)',
  '출생아 1인당 200만원(첫째) 또는 300만원(둘째 이상)의 바우처를 지급합니다. 출생 후 1년 내 신청, 사용기한 24개월.',
  'central', '보건복지부', 'birth', 'voucher', 2000000,
  ARRAY['birth','childcare']::stage[], 0, 12,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '정부24 행복출산 / 주민센터', '온라인/방문',
  'https://www.gov.kr/portal/onestopSvc/happyBirth', 'manual', 'seed-first-meeting-voucher'
),
(
  '산모·신생아 건강관리 지원 (산후도우미)',
  '건강관리사가 가정 방문하여 산후회복·신생아 돌봄 지원',
  '전문 교육을 받은 건강관리사가 출산 가정을 방문하여 산모 회복과 신생아 돌봄을 5~25일간 지원합니다. 중위소득 150% 이하 가구.',
  'central', '보건복지부', 'birth', 'service', null,
  ARRAY['birth']::stage[], 0, 3,
  ARRAY[]::text[], ARRAY[]::text[], 7,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '관할 보건소 / 복지로', '온라인/방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-postnatal-care'
),
(
  '행복출산 원스톱 서비스',
  '출생신고와 함께 13종 출산 지원을 한 번에 신청',
  '출생신고시 첫만남이용권, 부모급여, 아동수당, 다자녀혜택 등 13종 출산 관련 지원을 정부24에서 한꺼번에 신청할 수 있습니다.',
  'central', '행정안전부·보건복지부', 'birth', 'service', null,
  ARRAY['birth']::stage[], 0, 3,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '정부24', '온라인',
  'https://www.gov.kr/portal/onestopSvc/happyBirth', 'manual', 'seed-happy-birth-onestop'
),

-- ========== 중앙정부 · 육아 ==========
(
  '부모급여 (0세)',
  '만 0세 영아에게 매월 100만원 현금',
  '만 0세(0~11개월) 아동을 양육하는 가정에 월 100만원을 현금으로 지급합니다. 출생 후 60일 이내 신청 시 출생월부터 소급 지급.',
  'central', '보건복지부', 'childcare', 'cash', 1000000,
  ARRAY['birth','childcare']::stage[], 0, 11,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '정부24 / 주민센터', '온라인/방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-parent-allowance-0'
),
(
  '부모급여 (1세)',
  '만 1세 영아에게 매월 50만원 현금',
  '만 1세(12~23개월) 아동을 양육하는 가정에 월 50만원을 현금으로 지급합니다.',
  'central', '보건복지부', 'childcare', 'cash', 500000,
  ARRAY['childcare']::stage[], 12, 23,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '정부24 / 주민센터', '온라인/방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-parent-allowance-1'
),
(
  '아동수당',
  '만 8세 미만 아동에게 매월 10~12만원 (지역별 차등)',
  '만 8세 미만 아동에게 매월 현금 지원. 수도권 10만원, 비수도권 10.5만원, 인구감소지역 11만원, 특별지역 12만원. 2026~2030 단계적으로 만 13세까지 확대.',
  'central', '보건복지부', 'childcare', 'cash', 100000,
  ARRAY['childcare']::stage[], 0, 95,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '정부24 / 주민센터', '온라인/방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-child-allowance'
),
(
  '양육수당 (가정양육)',
  '어린이집 미이용 가정양육 아동에게 월 10~20만원',
  '어린이집·유치원·종일제 아이돌봄을 이용하지 않고 가정에서 양육하는 영유아에게 월령별로 월 10~20만원 정액 지급. 보육료와 중복 수령 불가.',
  'central', '보건복지부', 'childcare', 'cash', 200000,
  ARRAY['childcare']::stage[], 0, 86,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '주민센터', '방문',
  'https://www.bokjiro.go.kr', 'manual', 'seed-home-care-allowance'
),
(
  '어린이집 보육료 지원',
  '만 0~5세 어린이집 이용 시 보육료 전액 정부 지원',
  '만 0~5세 영유아가 어린이집을 이용하는 경우 소득 수준에 관계없이 보육료가 정부 지원됩니다. 양육수당과 중복 수령 불가.',
  'central', '보건복지부', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 71,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '임신육아종합포털 아이사랑 / 주민센터', '온라인/방문',
  'https://www.childcare.go.kr', 'manual', 'seed-daycare-fee'
),
(
  '유아학비 (유치원)',
  '만 3~5세 유치원 이용 학비 지원',
  '만 3~5세 유아가 유치원을 이용하는 경우 학비를 지원합니다. 국공립·사립 차등 지원.',
  'central', '교육부', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 36, 71,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '처음학교로', '온라인',
  null, 'manual', 'seed-kindergarten-fee'
),
(
  '아이돌봄 서비스',
  '만 12세 이하 자녀 가정에 돌봄 인력 파견',
  '시간제·종일제로 자녀 돌봄 인력을 가정으로 파견. 만 12세 이하 자녀가 있는 가구가 대상이며, 소득 구간별로 본인부담이 차등됩니다.',
  'central', '여성가족부', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 144,
  ARRAY[]::text[], ARRAY[]::text[], 8,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '아이돌봄 홈페이지 / 주민센터', '온라인',
  'https://www.idolbom.go.kr', 'manual', 'seed-idol-bom-service'
),
(
  '육아휴직급여',
  '고용보험 가입 근로자의 육아휴직 통상임금 80% 지급',
  '고용보험 가입 근로자가 만 8세 이하 또는 초2 이하 자녀를 양육하기 위해 휴직 시 통상임금의 80%를 지원합니다(상한 있음). 부모 각각 사용 가능.',
  'central', '고용노동부', 'childcare', 'cash', null,
  ARRAY['birth','childcare']::stage[], 0, 96,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '고용센터', '방문',
  null, 'manual', 'seed-parental-leave'
),
(
  '육아기 단축근무·10시 출근제 (사업주 지원)',
  '자녀 양육 위해 근로시간 단축 시 사업주 지원',
  '만 12세 이하 자녀를 둔 근로자가 임금 삭감 없이 출퇴근 시간을 조정한 경우 사업주에게 최대 1년 월 30~50만원 지원.',
  'central', '고용노동부', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 144,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '고용센터', '방문',
  null, 'manual', 'seed-flexible-hours'
),

-- ========== 중앙정부 · 특수자격 ==========
(
  '한부모가족 아동양육비',
  '한부모가족 자녀에게 월 21만원 양육비 (청소년 한부모 월 35만원)',
  '한부모가족 자녀(만 18세 미만)에게 월 21만원의 양육비를 지원합니다. 청소년 한부모는 월 35만원. 추가양육비·학용품비도 별도 지원.',
  'central', '여성가족부', 'childcare', 'cash', 210000,
  ARRAY['childcare']::stage[], 0, 215,
  ARRAY[]::text[], ARRAY[]::text[], 6,
  ARRAY['한부모']::text[], ARRAY[]::housing_status[],
  null, null, '주민센터', '방문',
  'https://www.mogef.go.kr', 'manual', 'seed-single-parent-allowance'
),
(
  '장애아동수당',
  '등록 장애아동에게 월 11~22만원',
  '등록 장애아동에게 중증 월 22만원, 경증 월 11만원의 수당을 지급. 기초·차상위 우선.',
  'central', '보건복지부', 'childcare', 'cash', 220000,
  ARRAY['childcare']::stage[], 0, 215,
  ARRAY[]::text[], ARRAY[]::text[], 4,
  ARRAY['장애']::text[], ARRAY[]::housing_status[],
  null, null, '주민센터', '방문',
  null, 'manual', 'seed-disabled-child-allowance'
),
(
  '다자녀가구 공공요금 감면',
  '전기·도시가스 등 다자녀 가구 요금 감면',
  '자녀 2명 또는 3명 이상 가구에 전기료, 도시가스 요금 등 공공요금을 감면합니다. 기관별로 별도 신청 필요.',
  'central', '산업통상자원부 등', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 215,
  ARRAY[]::text[], ARRAY[]::text[], null,
  ARRAY['다자녀']::text[], ARRAY[]::housing_status[],
  null, null, '한국전력 / 도시가스사', '온라인/방문',
  null, 'manual', 'seed-multi-child-utility'
),

-- ========== 서울특별시 ==========
(
  '서울시 임산부 교통비',
  '서울 거주 임산부에게 교통비 70만원 바우처',
  '서울 6개월 이상 거주 임산부에게 본인 명의 신용·체크카드로 교통비 70만원을 바우처로 지급. 임신 3개월~출산 후 3개월 사이 신청.',
  'sido', '서울특별시', 'pregnancy', 'voucher', 700000,
  ARRAY['pregnancy','birth']::stage[], null, null,
  ARRAY['서울특별시']::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '서울시 임신·출산 정보센터 / 탄생육아 몽땅정보통', '온라인',
  'https://umppa.seoul.go.kr', 'manual', 'seed-seoul-pregnant-transport'
),
(
  '서울시 산모 산후조리경비',
  '출산 후 산후조리비 100~150만원 (다자녀 차등)',
  '서울 거주 산모에게 첫째 100만원, 둘째 120만원, 셋째 이상 150만원의 산후조리비를 본인 명의 카드로 지원. 출산 후 6개월 이내 신청.',
  'sido', '서울특별시', 'birth', 'voucher', 1000000,
  ARRAY['birth']::stage[], 0, 6,
  ARRAY['서울특별시']::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  '2026-03-30'::date, null, '서울시 임신·출산 정보센터', '온라인',
  'https://seoul-agi.seoul.go.kr', 'manual', 'seed-seoul-postpartum'
),
(
  '서울시 엄마북돋움 사업',
  '산후 우울·정신건강 관리 지원',
  '출산 후 산모의 정신건강(우울 등)을 관리하는 상담·치료 서비스.',
  'sido', '서울특별시', 'birth', 'service', null,
  ARRAY['birth','childcare']::stage[], 0, 24,
  ARRAY['서울특별시']::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '서울시 정신건강복지센터', '온라인/방문',
  'https://umppa.seoul.go.kr', 'manual', 'seed-seoul-mental-care'
),
(
  '서울시 다태아 가정 추가 지원',
  '쌍둥이·다태아 가정 추가 양육·돌봄 지원',
  '서울 거주 다태아(쌍둥이·세쌍둥이) 가정에 추가 양육·돌봄을 지원.',
  'sido', '서울특별시', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 60,
  ARRAY['서울특별시']::text[], ARRAY[]::text[], null,
  ARRAY['다태아']::text[], ARRAY[]::housing_status[],
  null, null, '서울시 / 자치구', '방문',
  null, 'manual', 'seed-seoul-multi-baby'
),
(
  '서울형 영유아 발달지원',
  '영유아 발달검사 및 치료 지원',
  '서울 거주 영유아의 발달검사·치료를 지원합니다.',
  'sido', '서울특별시', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 71,
  ARRAY['서울특별시']::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '서울시 / 보건소', '방문',
  null, 'manual', 'seed-seoul-dev-support'
),
(
  '서울 24시간 보육 서비스',
  '야간·휴일 보육 어린이집 운영',
  '서울 시내 야간·휴일 보육 어린이집을 운영하여 맞벌이·교대 근무 가정을 지원합니다.',
  'sido', '서울특별시', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 71,
  ARRAY['서울특별시']::text[], ARRAY[]::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '관할 어린이집', '방문',
  null, 'manual', 'seed-seoul-24h-daycare'
),

-- ========== 서울 자치구 ==========
(
  '강남구 출생축하 지원',
  '출생아 가정에 축하금·물품 지원',
  '강남구 거주 출생아 가정에 출산축하금 또는 축하물품을 지원합니다.',
  'sigungu', '강남구', 'birth', 'voucher', null,
  ARRAY['birth']::stage[], 0, 6,
  ARRAY['서울특별시']::text[], ARRAY['강남구']::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '강남구 보육지원과 (02-3423-5857)', '방문',
  null, 'manual', 'seed-gangnam-birth-gift'
),
(
  '강남구 산모도우미 추가 지원',
  '중앙 산모·신생아 건강관리 본인부담금 일부 강남구가 추가 지원',
  '중앙정부 산모·신생아 건강관리 서비스의 본인부담금 중 일부를 강남구에서 추가로 지원합니다.',
  'sigungu', '강남구', 'birth', 'service', null,
  ARRAY['birth']::stage[], 0, 3,
  ARRAY['서울특별시']::text[], ARRAY['강남구']::text[], 7,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '강남구 보건소', '방문',
  null, 'manual', 'seed-gangnam-postnatal-extra'
),
(
  '서초구 출산축하 선물세트',
  '출생아 가정에 출산축하 선물세트 제공',
  '서초구 거주 출생아 가정에 출산축하 선물세트를 제공합니다.',
  'sigungu', '서초구', 'birth', 'voucher', null,
  ARRAY['birth']::stage[], 0, 6,
  ARRAY['서울특별시']::text[], ARRAY['서초구']::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '서초구 여성보육과 (02-2155-6694)', '방문',
  null, 'manual', 'seed-seocho-birth-gift'
),
(
  '서초구 다자녀가구 지원',
  '셋째 이상 자녀가구 우대 혜택',
  '서초구 거주 다자녀(3명 이상) 가구에 다양한 우대 혜택을 제공합니다.',
  'sigungu', '서초구', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 215,
  ARRAY['서울특별시']::text[], ARRAY['서초구']::text[], null,
  ARRAY['다자녀']::text[], ARRAY[]::housing_status[],
  null, null, '서초구 여성보육과 (02-2155-6694)', '방문',
  null, 'manual', 'seed-seocho-multi-child'
),
(
  '송파구 보육 지원',
  '자치구 보육시설 추가 운영비·입학 지원',
  '송파구가 자체적으로 운영하는 보육시설 추가 운영비·입학 지원 사업입니다.',
  'sigungu', '송파구', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 71,
  ARRAY['서울특별시']::text[], ARRAY['송파구']::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '송파구 여성보육과 (02-2147-2791)', '방문',
  null, 'manual', 'seed-songpa-childcare'
),
(
  '마포구 건강동행 사업',
  '임산부·영유아 건강관리 통합 서비스',
  '마포구가 임산부와 영유아의 건강관리를 통합 지원하는 사업입니다.',
  'sigungu', '마포구', 'childcare', 'service', null,
  ARRAY['pregnancy','birth','childcare']::stage[], 0, 60,
  ARRAY['서울특별시']::text[], ARRAY['마포구']::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '마포구 건강동행과 (02-3153-9072)', '방문',
  null, 'manual', 'seed-mapo-health'
),
(
  '성동구 영유아 사업',
  '영유아 건강·돌봄 추가 지원',
  '성동구가 영유아의 건강과 돌봄을 추가로 지원하는 사업입니다.',
  'sigungu', '성동구', 'childcare', 'service', null,
  ARRAY['childcare']::stage[], 0, 71,
  ARRAY['서울특별시']::text[], ARRAY['성동구']::text[], null,
  ARRAY[]::text[], ARRAY[]::housing_status[],
  null, null, '성동구 영유아과 (02-2286-6877)', '방문',
  null, 'manual', 'seed-seongdong-infant'
);
