# 쑥 마을 -- 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙과 절대 하면 안 되는 것.
> 이 문서를 AI에게 항상 함께 공유하세요.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 풀스택 한 큐, 한국 커뮤니티 활발, Claude가 가장 잘 다루는 스택 |
| 언어 | TypeScript | 타입 안전성, AI 자동완성 정확도 향상 |
| DB | Supabase (PostgreSQL 관리형) | 무료 시작, Row Level Security, 한 사용자/팀이 운영하기 적합 |
| 인증 | Supabase Auth | 이메일+비번 + 추후 카카오/구글 소셜까지 한 곳에서 |
| 스타일링 | Tailwind CSS 4 | 빠른 프로토타이핑, 모바일 우선 디자인 |
| UI 컴포넌트 | shadcn/ui | 복사해 쓰는 컴포넌트, 커스터마이징 자유 |
| 배포 | Vercel | Next.js 공식, 깃헙 연동 자동 배포 |
| Cron / 스케줄러 | Vercel Cron + Supabase Edge Functions | 정책 동기화·매칭·알림 발송 일 1회 실행 |
| 이메일 발송 | Resend | 무료 3,000통/월, Next.js 통합 깔끔, React Email 템플릿 |
| 웹 푸시 | Web Push API (VAPID) | 무료, 외부 서비스 의존성 없음 |
| 폼/검증 | React Hook Form + Zod | 타입 안전한 폼, Supabase 타입과 정합 |
| 데이터 페칭 | Server Components + Server Actions | App Router 표준, API Route 최소화 |

---

## 프로젝트 구조

```
ssuk-maeul/
├── src/
│   ├── app/                    # 페이지 (App Router)
│   │   ├── (marketing)/        # 랜딩 등 공개 페이지
│   │   ├── (auth)/             # 로그인/회원가입
│   │   ├── (app)/              # 로그인 후 화면
│   │   │   ├── onboarding/     # 프로필 작성
│   │   │   ├── matches/        # 나의 추천 지원
│   │   │   ├── policies/       # 정책 탐색·상세
│   │   │   ├── notifications/  # 알림함·설정
│   │   │   └── settings/       # 프로필 수정
│   │   ├── (admin)/            # 관리자
│   │   └── api/                # API 라우트 (cron, webhook)
│   ├── components/             # 재사용 UI
│   │   ├── ui/                 # shadcn/ui 베이스
│   │   └── domain/             # 도메인 컴포넌트(PolicyCard 등)
│   ├── lib/
│   │   ├── supabase/           # 클라이언트·서버·관리자 초기화
│   │   ├── matching/           # 매칭 알고리즘
│   │   ├── notification/       # 이메일·웹푸시 발송
│   │   └── sync/               # 정책 데이터 동기화
│   ├── types/                  # 데이터 타입 (Supabase 생성 + 도메인)
│   └── emails/                 # React Email 템플릿
├── supabase/
│   ├── migrations/             # DB 스키마
│   └── functions/              # Edge Functions
├── public/
├── .env.local                  # 환경변수 (커밋 X)
├── .env.example                # 환경변수 템플릿 (커밋 O)
└── package.json
```

---

## 절대 하지 마 (DO NOT)

> AI에게 코드를 시킬 때 이 목록을 반드시 함께 공유하세요.

- [ ] API 키·비밀번호·Supabase service_role 키를 코드에 직접 쓰지 마. 반드시 `.env.local`/Vercel 환경변수 사용.
- [ ] `service_role` 키를 클라이언트 코드(브라우저)에서 쓰지 마. 서버 컴포넌트·API 라우트·Edge Function에서만.
- [ ] Supabase Row Level Security(RLS)를 끄지 마. 모든 테이블에 RLS 활성화 + 정책 작성 필수.
- [ ] 매칭/알림에 사용자 ID를 클라이언트에서 받지 마. 항상 서버에서 `auth.getUser()`로 인증된 ID 사용.
- [ ] 기존 마이그레이션 파일을 수정하지 마. 새 마이그레이션을 추가.
- [ ] 정책 데이터를 코드에 하드코딩하지 마. Policy 테이블에서 읽고, 시드는 별도 SQL/스크립트로.
- [ ] 목업 데이터로 "Phase 완료"라고 보고하지 마. 실제 Supabase + 실제 이메일 발송 확인.
- [ ] 사용자 비밀번호를 직접 DB에 저장하지 마. Supabase Auth 사용.
- [ ] 소득·주택·자격 같은 민감 정보를 로그에 남기지 마.
- [ ] Phase 2/3 기능을 Phase 1에 끼워 넣지 마. PRD §6 Out of Scope 참조.
- [ ] package.json의 기존 의존성 버전을 임의로 올리지 마.
- [ ] 한국어 정책 텍스트를 임의 영어 번역으로 바꾸지 마.

---

## 항상 해 (ALWAYS DO)

- [ ] 변경 전에 계획을 먼저 보여줘. 큰 변경은 사용자 승인 후 진행.
- [ ] 환경변수는 `.env.local`에 저장하고 `.env.example`에 키 이름만 커밋.
- [ ] Supabase 테이블에 RLS 정책 작성 (예: User는 자기 데이터만 read/write, Policy는 모두 read).
- [ ] 에러는 사용자에게 한국어로 친절하게 (영어 stack trace 노출 금지).
- [ ] 모바일 우선 반응형. 임산부·육아 부모는 휴대폰 사용 비율이 매우 높음.
- [ ] 이메일 본문은 React Email 컴포넌트로 작성하고 미리보기 가능하게.
- [ ] 정책 데이터 시드는 SQL 파일로 별도 보관 (`supabase/seed.sql`).
- [ ] cron 작업은 멱등성(idempotent) 보장. 같은 시점에 두 번 돌아도 중복 알림 안 가게 발송 이력 체크.
- [ ] 정책 변경 시 사용자 매칭 결과 재계산 트리거.
- [ ] 알림 발송 후 Notification 테이블에 기록 (재발송 방지 + 디버깅).
- [ ] 접근성: aria-label, 키보드 탐색, 충분한 대비.
- [ ] 사용자 입력은 Zod로 검증.

---

## 테스트 방법

```bash
# 의존성 설치
npm install

# 로컬 실행
npm run dev

# 타입 체크
npx tsc --noEmit

# 빌드 확인
npm run build

# Supabase 로컬 (선택)
npx supabase start
npx supabase db reset
```

---

## 배포 방법

### 첫 배포
1. GitHub에 푸시
2. Vercel에서 "Import Project" → 해당 레포 선택
3. 환경변수 입력 (아래 표 참고)
4. Deploy 클릭
5. Supabase Dashboard → Auth → URL Configuration에 Vercel 도메인 추가

### 이후 배포
- main 브랜치 푸시 → 자동 배포
- preview 브랜치 → preview URL

### Cron 설정
- `vercel.json`에 cron 등록:
  ```json
  {
    "crons": [
      {"path": "/api/cron/sync-policies", "schedule": "0 18 * * *"},
      {"path": "/api/cron/run-matching", "schedule": "0 19 * * *"},
      {"path": "/api/cron/send-notifications", "schedule": "0 0 * * *"}
    ]
  }
  ```
  (한국시간 기준 03:00 / 04:00 / 09:00 실행. UTC 변환 확인.)

---

## 환경변수

| 변수명 | 설명 | 어디서 발급 |
|--------|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | supabase.com → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (클라이언트용) | 동일 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 (서버 전용, 절대 클라이언트 노출 금지) | 동일 |
| `RESEND_API_KEY` | 이메일 발송 키 | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | 발신 이메일 (도메인 인증 필요) | 예: noreply@ssuk-maeul.kr |
| `VAPID_PUBLIC_KEY` | 웹푸시 공개 키 | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | 웹푸시 비공개 키 | 동일 |
| `VAPID_SUBJECT` | 발송자 메일 (mailto:...) | 직접 지정 |
| `CRON_SECRET` | Vercel Cron 보호 토큰 | 직접 생성 (32바이트 랜덤) |
| `PUBLIC_DATA_API_KEY` | 공공데이터포털 API 키 (정책 동기화) | data.go.kr → 마이페이지 |

> `.env.local` 파일에 저장. **절대 GitHub에 올리지 마세요.** `.gitignore`에 `.env*.local` 포함 확인.

---

## 도메인 규칙 (쑥 마을 전용)

- **시기(stage)**는 enum: `pregnancy` | `birth` | `childcare`. UI 표기는 "임신/출산/육아".
- **자녀 나이는 개월 수로 환산**해 비교. 출산예정일은 음수 개월로 처리.
- **지역 코드**: 시도·시군구는 한국 행정구역 표준 코드(코드명 두 단계)로 저장. UI엔 한글명.
- **정책 마감일이 null**이면 "상시 신청"으로 표기.
- **금액은 원 단위 정수**로 저장. UI엔 "70만원" 형태로 포맷.

---

## [NEEDS CLARIFICATION]

- [ ] **도메인**: ssuk-maeul.kr / ssukmaeul.com 등 도메인 구매 여부.
- [ ] **로고 / 브랜드 컬러**: 디자인 가이드.
- [ ] **개인정보처리방침 · 이용약관**: 법무 검토 필요. 특히 소득·주택 정보 수집은 명시 동의 필요.
- [ ] **공공데이터포털 API 선택**: "정부 보조금24" 외 어떤 API를 어떻게 결합할지.
- [ ] **시범 사용자 모집 방법**: 가족·지인 / 맘카페 / SNS.
