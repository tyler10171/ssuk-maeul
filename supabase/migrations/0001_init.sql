-- 0001_init.sql
-- 쑥 마을 초기 스키마: users / children / policies / matches / notifications
-- 데이터 모델은 PRD/02_DATA_MODEL.md 참조.
-- 마이그레이션은 한 번만 적용됨. 절대 이 파일을 수정하지 말고 새 마이그레이션을 추가하세요.

-- ====== Enums ======
create type stage as enum ('pregnancy', 'birth', 'childcare');
create type provider_type as enum ('central', 'sido', 'sigungu');
create type policy_category as enum ('pregnancy', 'birth', 'childcare');
create type support_type as enum ('cash', 'voucher', 'service');
create type housing_status as enum ('own', 'jeonse', 'monthly_rent', 'none');
create type match_status as enum ('recommended', 'interested', 'completed', 'dismissed');
create type notification_type as enum ('new', 'deadline', 'timing', 'system');
create type notification_channel as enum ('email', 'web_push', 'in_site');
create type source_type as enum ('api', 'manual');

-- ====== users ======
-- public.users는 auth.users와 id로 1:1 연결.
-- 회원가입은 auth에서 일어나고, 온보딩 완료 시 이 테이블에 INSERT된다.
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  sido text not null,
  sigungu text not null,
  current_stage stage not null,
  income_percentile smallint check (income_percentile between 1 and 10),
  household_size smallint check (household_size between 1 and 20),
  monthly_income integer check (monthly_income >= 0),
  housing_status housing_status,
  qualifications text[] not null default '{}',
  notification_prefs jsonb not null default '{"email": true, "web_push": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_region_idx on users (sido, sigungu);
create index users_stage_idx on users (current_stage);

-- ====== children ======
create table children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  nickname text,
  birth_date date,
  due_date date,
  created_at timestamptz not null default now(),
  constraint child_date_required check (birth_date is not null or due_date is not null)
);

create index children_user_idx on children (user_id);

-- ====== policies ======
-- sido_scope/sigungu_scope가 빈 배열이면 전국 적용.
-- target_age_min/max_months 둘 다 null이면 자녀 나이 제한 없음.
create table policies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  description text not null,
  provider provider_type not null,
  provider_name text not null,
  category policy_category not null,
  support_type support_type not null,
  support_amount integer,
  target_stage stage[] not null default '{}',
  target_age_min_months integer,
  target_age_max_months integer,
  sido_scope text[] not null default '{}',
  sigungu_scope text[] not null default '{}',
  target_income_max_percentile smallint check (target_income_max_percentile between 1 and 10),
  target_qualifications text[] not null default '{}',
  target_housing housing_status[] not null default '{}',
  apply_start date,
  apply_end date,
  apply_place text,
  apply_method text,
  external_url text,
  source source_type not null default 'manual',
  external_id text,
  synced_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index policies_external_unique on policies (source, external_id) where external_id is not null;
create index policies_active_idx on policies (is_active) where is_active;
create index policies_category_idx on policies (category);
create index policies_apply_end_idx on policies (apply_end);
create index policies_target_stage_idx on policies using gin (target_stage);
create index policies_sido_scope_idx on policies using gin (sido_scope);

-- ====== matches ======
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  policy_id uuid not null references policies(id) on delete cascade,
  status match_status not null default 'recommended',
  matched_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, policy_id)
);

create index matches_user_status_idx on matches (user_id, status);
create index matches_user_matched_idx on matches (user_id, matched_at desc);

-- ====== notifications ======
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  policy_id uuid references policies(id) on delete set null,
  type notification_type not null,
  channel notification_channel not null,
  title text not null,
  body text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  delivery_status text not null default 'sent'
);

create index notifications_user_read_idx on notifications (user_id, read_at);
create index notifications_user_sent_idx on notifications (user_id, sent_at desc);

-- ====== updated_at 트리거 ======
create or replace function tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on users
  for each row execute function tg_set_updated_at();
create trigger policies_set_updated_at before update on policies
  for each row execute function tg_set_updated_at();
create trigger matches_set_updated_at before update on matches
  for each row execute function tg_set_updated_at();

-- ====== auth.users.email 변경 시 public.users.email 동기화 ======
create or replace function tg_sync_user_email()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger sync_user_email after update of email on auth.users
  for each row execute function tg_sync_user_email();

-- ====== Row Level Security ======
alter table users enable row level security;
alter table children enable row level security;
alter table policies enable row level security;
alter table matches enable row level security;
alter table notifications enable row level security;

-- users: 본인만 조회/생성/수정 (삭제는 auth 계정 삭제로 cascade)
create policy "users_self_select" on users for select
  using (auth.uid() = id);
create policy "users_self_insert" on users for insert
  with check (auth.uid() = id);
create policy "users_self_update" on users for update
  using (auth.uid() = id);

-- children: 본인 자녀만
create policy "children_self_select" on children for select
  using (auth.uid() = user_id);
create policy "children_self_insert" on children for insert
  with check (auth.uid() = user_id);
create policy "children_self_update" on children for update
  using (auth.uid() = user_id);
create policy "children_self_delete" on children for delete
  using (auth.uid() = user_id);

-- policies: 활성 정책은 누구나 조회. 쓰기는 service_role(서버)만 (RLS 우회).
create policy "policies_read_active" on policies for select
  using (is_active = true);

-- matches: 본인 매칭만 조회/상태 변경. INSERT/DELETE는 service_role(매칭 cron).
create policy "matches_self_select" on matches for select
  using (auth.uid() = user_id);
create policy "matches_self_update" on matches for update
  using (auth.uid() = user_id);

-- notifications: 본인 알림만 조회/읽음처리. INSERT는 service_role(알림 cron).
create policy "notifications_self_select" on notifications for select
  using (auth.uid() = user_id);
create policy "notifications_self_update" on notifications for update
  using (auth.uid() = user_id);
