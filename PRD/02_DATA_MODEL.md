# 쑥 마을 -- 데이터 모델

> 이 문서는 앱에서 다루는 핵심 데이터의 구조를 정의합니다.
> 개발자가 아니어도 이해할 수 있는 "개념적 ERD"입니다.

---

## 전체 구조

```
User ─┬─ 1:N ─▶ Child
      ├─ 1:N ─▶ Match ◀─ N:1 ─ Policy
      └─ 1:N ─▶ Notification ◀─ N:1 ─ Policy
```

- 한 사용자가 여러 자녀를 등록할 수 있음 (MVP는 1명, Phase 2부터 N명)
- 한 사용자에게 여러 정책이 매칭됨 (Match)
- 한 사용자에게 여러 알림이 발송됨 (Notification)
- Policy는 매칭/알림의 참조 대상

---

## 엔티티 상세

### User (사용자)
서비스에 가입한 부모. 매칭의 주체이자 알림 수신자.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동 생성, UUID) | 9b2f-... | O |
| email | 로그인 ID, 알림 수신 주소 | a@b.com | O |
| sido | 거주 광역시·도 | "서울특별시" | O |
| sigungu | 거주 시·군·구 | "강남구" | O |
| current_stage | 현재 시기 | 임신/출산/육아 | O |
| income_percentile | 소득분위 (1~10) | 5 | X |
| household_size | 가구원 수 | 3 | X |
| monthly_income | 월 가구 소득 (원, 선택) | 5,000,000 | X |
| housing_status | 주택 보유 상태 | 자가/전세/월세/무주택 | X |
| qualifications | 특수자격 다중 선택 | ["다자녀", "한부모"] | X |
| notification_prefs | 알림 채널 선호 | {email:true, web_push:true} | O |
| created_at | 가입 시각 (자동) | 2026-06-15 | O |
| updated_at | 마지막 수정 (자동) | 2026-06-15 | O |

### Child (자녀)
사용자가 등록한 자녀. 출산 전이면 출산예정일만, 출산 후면 생년월일 사용.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | abc-123 | O |
| user_id | 부모 (User.id) | 9b2f-... | O |
| nickname | 별칭 (선택) | "쑥쑥이" | X |
| birth_date | 생년월일 (출산 후) | 2025-12-01 | X* |
| due_date | 출산예정일 (임신 중) | 2026-09-01 | X* |
| created_at | 등록 시각 (자동) | 2026-06-15 | O |

*birth_date 또는 due_date 중 하나는 필수.

### Policy (정책)
정부·지자체 지원 정책. API 자동 수집 또는 관리자 수동 등록.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | pol-001 | O |
| title | 정책명 | "임산부 교통비 지원" | O |
| summary | 한두 문장 요약 | "임산부에게 교통비 70만원..." | O |
| description | 상세 설명 (마크다운) | (긴 텍스트) | O |
| provider | 공급 주체 | 중앙/시도/구 | O |
| provider_name | 공급 기관명 | "서울특별시" | O |
| category | 대분류 | 임신/출산/육아 | O |
| support_type | 지원 형태 | 현금/바우처/서비스 | O |
| support_amount | 지원 금액 (원) | 700,000 | X |
| target_stage | 대상 시기 (다중) | ["임신", "출산"] | O |
| target_age_min_months | 자녀 최소 개월 수 | 0 | X |
| target_age_max_months | 자녀 최대 개월 수 | 24 | X |
| sido_scope | 적용 광역 (다중, 전국이면 빈값) | ["서울특별시"] | X |
| sigungu_scope | 적용 시군구 (다중) | ["강남구"] | X |
| target_income_max_percentile | 소득 상한 분위 (없으면 제한 없음) | 7 | X |
| target_qualifications | 자격 조건 (다중, OR) | ["다자녀"] | X |
| target_housing | 주택 조건 | ["무주택"] | X |
| apply_start | 신청 시작일 | 2026-01-01 | X |
| apply_end | 신청 마감일 (상시면 null) | 2026-12-31 | X |
| apply_place | 신청처 설명 | "정부24, 주민센터" | X |
| apply_method | 신청 방법 | "온라인/방문" | X |
| external_url | 원본/신청 페이지 링크 | https://www.gov.kr/... | X |
| source | 데이터 출처 | api/manual | O |
| external_id | 원본 시스템 ID (중복 방지) | govkr-17410000001 | X |
| synced_at | 마지막 동기화 시각 | 2026-06-15 03:00 | X |
| is_active | 노출 여부 | true | O |
| created_at | 등록일 (자동) | 2026-06-15 | O |
| updated_at | 마지막 수정 (자동) | 2026-06-15 | O |

### Match (매칭)
사용자 × 정책 매칭 결과. 매칭 알고리즘이 생성하고, 사용자가 상태를 갱신.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | mat-001 | O |
| user_id | 사용자 | 9b2f-... | O |
| policy_id | 정책 | pol-001 | O |
| status | 진행 상태 | 추천/관심/완료/무관 | O |
| matched_at | 매칭 시각 | 2026-06-15 | O |
| updated_at | 마지막 수정 (자동) | 2026-06-15 | O |

**Unique constraint**: (user_id, policy_id) -- 한 사용자에게 같은 정책은 1건.

### Notification (알림)
사용자에게 발송된 알림 이력.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | not-001 | O |
| user_id | 수신자 | 9b2f-... | O |
| policy_id | 관련 정책 (없을 수도) | pol-001 | X |
| type | 알림 종류 | 신규/마감임박/시기도래/시스템 | O |
| channel | 발송 채널 | email/web_push/in_site | O |
| title | 알림 제목 | "신청 마감 D-7" | O |
| body | 알림 본문 | "임산부 교통비 신청이..." | O |
| sent_at | 발송 시각 | 2026-06-15 09:00 | O |
| read_at | 읽은 시각 (사이트 내) | 2026-06-15 12:00 | X |
| delivery_status | 발송 상태 | sent/failed | O |

---

## 관계 정리

- **User → Child**: 1:N. MVP는 1자녀 제한, Phase 2부터 N자녀.
- **User → Match → Policy**: User와 Policy의 N:N 관계를 Match 테이블로 표현. Match에 status를 두어 사용자가 "관심", "완료" 등으로 상태 관리.
- **User → Notification → Policy**: 알림 이력. Policy 참조는 nullable (시스템 안내처럼 정책과 무관한 알림도 있음).
- **Policy** 자체는 사용자 독립. 자동 동기화와 수동 등록 둘 다 가능.

---

## 매칭 알고리즘 (참고)

Match 생성 규칙:
1. Policy.target_stage 와 User.current_stage 교집합 있음
2. Policy.target_age_min/max 범위 안에 Child.birth_date 또는 due_date 환산 개월수가 포함
3. Policy.sido_scope 비어있거나 User.sido 포함
4. Policy.sigungu_scope 비어있거나 User.sigungu 포함
5. Policy.target_income_max_percentile 없거나 User.income_percentile 이하
6. Policy.target_qualifications 비어있거나 User.qualifications와 교집합
7. Policy.target_housing 비어있거나 User.housing_status 포함
8. Policy.is_active = true
9. Policy.apply_end null이거나 오늘 이후

조건을 다 통과하면 status="추천"으로 생성. 사용자가 관심/완료/무관으로 변경 가능.

---

## 왜 이 구조인가

- **확장성**: Phase 2에서 자녀 N명, 즐겨찾기, 수령 트래킹을 추가할 때 기존 테이블 변경 거의 없음. Match.status로 즐겨찾기·수령 관리가 가능.
- **단순성**: 정책의 자격 조건을 별도 Rule 테이블로 정규화하지 않고 Policy 필드에 직접 둠. 정책 수가 수천 건 규모라 충분히 핸들링 가능, JSON/배열 컬럼으로 유연하게.
- **데이터 소스 추적**: source/external_id/synced_at으로 자동 동기화와 수동 등록을 한 테이블에서 관리하면서 중복 방지.
- **알림 분리**: Notification을 별도 테이블로 두어 발송 이력·읽음 처리·다채널을 깔끔히 관리.

---

## [NEEDS CLARIFICATION]

- [ ] **자격 조건 모델**: 정책의 자격 조건이 OR/AND 혼합으로 복잡해질 경우 Rule 테이블 분리 필요할지(예: "다자녀 AND 소득 7분위 이하"). 초기엔 단순 컬럼으로 시작.
- [ ] **소득 단위**: 월소득 vs 연소득 vs 분위 중 무엇을 정책 기준으로 쓸지 통일 필요. 정부 기준은 보통 "중위소득 N% 이하"라 별도 변환 로직 필요할 수 있음.
- [ ] **Policy 다국어**: 외국인 부모 대상 정책 안내 위해 다국어 필드(title_en 등) 필요할지.
- [ ] **개인정보 보관 정책**: monthly_income 같은 민감정보 보관 기간/삭제 정책.
