# 쑥 마을

부모가 임신부터 육아 전 과정에서 받을 수 있는 정부·지자체 지원금을 놓치지 않도록, 본인 조건에 맞는 지원을 자동으로 찾아주고 시기마다 알려주는 웹 플랫폼.

## 문서

설계 문서는 [PRD/](./PRD/) 아래에 있습니다.

| 문서 | 내용 |
|------|------|
| [PRD/01_PRD.md](./PRD/01_PRD.md) | 제품 요구사항 |
| [PRD/02_DATA_MODEL.md](./PRD/02_DATA_MODEL.md) | 데이터 모델 |
| [PRD/03_PHASES.md](./PRD/03_PHASES.md) | Phase 분리 |
| [PRD/04_PROJECT_SPEC.md](./PRD/04_PROJECT_SPEC.md) | AI 행동 규칙·기술 스택 |

## 기술 스택

- **Framework**: Next.js 16 (App Router) + TypeScript
- **DB / Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Email**: Resend
- **Web Push**: Web Push API (VAPID)
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 열어서 Supabase, Resend, VAPID 키 입력
```

필요한 키는 [PRD/04_PROJECT_SPEC.md](./PRD/04_PROJECT_SPEC.md#환경변수) 참조.

### 3. Supabase 마이그레이션 적용

Supabase 프로젝트 대시보드 → SQL Editor 에서 [supabase/migrations/0001_init.sql](./supabase/migrations/0001_init.sql) 을 실행하거나, Supabase CLI로:

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

### 4. 로컬 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

## 폴더 구조

```
src/
├── app/             # 페이지 (App Router)
├── components/      # 재사용 UI
├── lib/             # supabase / matching / notification / sync
├── types/           # 데이터 타입
└── emails/          # React Email 템플릿
supabase/
├── migrations/      # DB 스키마
└── functions/       # Edge Functions
PRD/                 # 설계 문서
policies-reference.txt  # 정책 시드 작성용 참고 자료
```

## Phase 1 진행 상황

- [x] Step 0: 스캐폴딩 (Next.js 16 + Tailwind 4 + 의존성)
- [x] Step 1: DB 스키마 마이그레이션
- [ ] Step 2: 이메일 인증 가입·로그인
- [ ] Step 3: 온보딩 (프로필 + 자녀)
- [ ] Step 4: 정책 탐색·상세 + 시드 데이터
- [ ] Step 5: 매칭 알고리즘 + 나의 추천 지원
- [ ] Step 6: 알림 (이메일 + 웹푸시 + 사이트내)
- [ ] Step 7: 관리자 대시보드
- [ ] Step 8: Cron 3종 + 공공데이터 API 연동
- [ ] Step 9: Vercel 배포

## 미결 사항

[PRD/README.md](./PRD/README.md#미결-사항-needs-clarification) 참조.
