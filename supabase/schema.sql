-- ============================================================================
-- Hcare CRM (1:1 맞춤형 바디케어·운동 지도 고객관리 웹앱) 데이터베이스 스키마
-- PostgreSQL / Supabase (RLS 보안 정책 및 초기 시드 데이터 포함)
-- ============================================================================

-- 확장 활성화
create extension if not exists "uuid-ossp";

-- 1. 사용자 프로필 및 권한 (profiles)
-- Supabase auth.users와 1:1 매핑되며, 관리자(admin), 관리사(therapist), 고객(client) 역할을 구분합니다.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  branch_id text not null default 'main', -- 향후 다지점 확장 대비 지점 코드
  role text not null check (role in ('admin', 'therapist', 'client')) default 'client',
  full_name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 고객 마스터 정보 (clients)
-- 고객 계정이 아직 없더라도 관리사가 먼저 고객을 등록하고 기록할 수 있도록 분리하고,
-- 고객이 로그인 계정을 생성하면 user_id로 연결합니다.
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.profiles(id) on delete set null,
  branch_id text not null default 'main',
  name text not null,
  phone text not null,
  birth_date date,
  gender text check (gender in ('F', 'M', 'OTHER')),
  occupation text,                       -- 직업/생활습관 (예: 사무직, 교사, 육아)
  consultation_notes text,               -- 초기 상담 내용 및 주요 호소 증상
  preferences text,                      -- 선호 압박 강도, 민감 부위, 온도 등 선호사항
  precautions_memo text,                 -- 고객별 특이사항/기저질환 메모
  privacy_consent boolean not null default true, -- 민감/개인정보 동의 여부
  privacy_consent_at timestamptz default now(),
  assigned_therapist_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. 고객 패키지 이용권 (client_packages)
-- 2-4. 고객 화면에서 본인 패키지 이용 내역(총 회차, 사용 회차, 잔여 회차) 확인용
create table public.client_packages (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  package_name text not null,            -- 예: '상체 밸런스 & 경추 집중 케어 10회권'
  total_sessions int not null default 10 check (total_sessions > 0),
  used_sessions int not null default 0 check (used_sessions >= 0),
  start_date date not null default current_date,
  expiry_date date,
  status text not null check (status in ('active', 'completed', 'expired')) default 'active',
  created_at timestamptz not null default now()
);

-- 4. 신체·움직임 관찰 체크리스트 항목 (observation_items)
-- 2-2 & 2-3. 관리사가 체크하고 관리자가 직접 추가·수정할 수 있는 관찰 항목 마스터
create table public.observation_items (
  id text primary key,                   -- 읽기 쉬운 식별 코드 (예: 'obs_neck_rot_pain')
  category text not null,                -- 부위 분류: '경추·어깨', '흉추·견갑', '요추·골반', '하지·보행'
  label text not null,                   -- 관찰 항목명: 예 '고개 좌우 회전 시 당김 및 통증'
  description text,                      -- 관리사용 측정/관찰 팁 설명
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. 맞춤 관리 프로그램 마스터 (care_programs)
-- 2-2 & 2-3. 대상 근육, 수기 관리 방법(내부 전용), 주의사항을 담는 프로그램 자료실
create table public.care_programs (
  id text primary key,                   -- 예: 'prog_cervical_release'
  category text not null,                -- 분류: '상체/경추', '어깨/견갑', '코어/골반', '하지 순환'
  title text not null,                   -- 프로그램명: 예 '경추 회전근 & 견갑거근 이완 케어'
  target_muscles text[] not null,        -- 관련 타겟 근육 배열: {'견갑거근', '상부승모근', '흉쇄유돌근'}
  manual_therapy_guide text not null,    -- [내부용] 수기 관리 테크닉 및 순서 가이드
  precautions text not null,             -- [내부용] 관리 시 주의사항 및 금기 조건
  client_summary_template text not null, -- [고객 노출용] 고객 이력 화면에 보여줄 친절한 설명 문구
  duration_minutes int not null default 50,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. 홈운동 프로그램 자료 마스터 (home_exercises)
-- 2-3 & 2-4. 관리 프로그램과 연동되거나 개별 배정되는 고객용 홈운동 가이드
create table public.home_exercises (
  id text primary key,                   -- 예: 'ex_chin_tuck_wall'
  title text not null,                   -- 운동명: 예 '벽 기대어 턱 당기기 & 견갑 하강 스트레칭'
  target_area text not null,             -- 타겟 부위: '목·어깨 안정화'
  video_url text not null,               -- 영상 URL (YouTube 임베드 등)
  thumbnail_url text,
  steps_guide text[] not null,           -- 단계별 수행 방법 배열
  prescription_default text not null,    -- 기본 권장량: 예 '10초 유지 × 10회 / 하루 2세트'
  precaution_note text,                  -- 고객용 주의사항: 예 '팔 저림이 발생하면 즉시 중단하세요.'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. [핵심] 관찰 항목 <-> 관리 프로그램 연결 기준 테이블 (observation_program_rules)
-- 2-2 & 2-3. 체크 항목 선택 시 어떤 프로그램이 얼마나 높은 우선순위로 추천될지 결정하는 매핑 테이블
create table public.observation_program_rules (
  id uuid primary key default uuid_generate_v4(),
  observation_id text not null references public.observation_items(id) on delete cascade,
  program_id text not null references public.care_programs(id) on delete cascade,
  priority_weight int not null default 3 check (priority_weight between 1 and 5), -- 5: 최우선 핵심 매칭, 3: 일반 연관
  rationale_note text,                   -- 연결 이유 (예: '고개 회전 제한 시 동측 견갑거근 단축 확인 필수')
  created_at timestamptz not null default now(),
  unique (observation_id, program_id)
);

-- 8. 관리 프로그램 <-> 기본 추천 홈운동 연결 테이블 (program_exercise_maps)
-- 특정 관리 프로그램을 선택하면 세트로 추천되는 홈운동 매핑
create table public.program_exercise_maps (
  program_id text not null references public.care_programs(id) on delete cascade,
  exercise_id text not null references public.home_exercises(id) on delete cascade,
  primary key (program_id, exercise_id)
);

-- 9. 방문 회차별 관리 기록 (treatment_sessions)
-- 2-1 & 2-2 & 2-4. 관찰 체크 결과, 최종 선택한 프로그램, 내부 기록(비노출) 및 고객 안내 요약(노출) 저장
create table public.treatment_sessions (
  id uuid primary key default uuid_generate_v4(),
  branch_id text not null default 'main',
  client_id uuid not null references public.clients(id) on delete cascade,
  package_id uuid references public.client_packages(id) on delete set null,
  therapist_id uuid references public.profiles(id) on delete set null,
  session_number int not null,           -- 회차 번호 (예: 1회차, 2회차, 3회차)
  session_date date not null default current_date,
  checked_observation_ids text[] not null default '{}', -- 체크한 관찰 항목 ID 목록
  selected_program_ids text[] not null default '{}',    -- 최종 적용한 관리 프로그램 ID 목록
  therapist_private_note text,           -- [관리자·관리사 전용 / 고객 절대 비노출] 내부 임상 노트
  client_public_note text,               -- [고객 화면 노출] 오늘 관리 요약 및 생활습관 코멘트
  pain_level_before int check (pain_level_before between 0 and 10),
  pain_level_after int check (pain_level_after between 0 and 10),
  created_at timestamptz not null default now()
);

-- 10. 고객에게 배정된 홈운동 및 수행 체크 (assigned_exercises & exercise_check_logs)
-- 2-4. 고객이 모바일에서 본인의 홈운동을 확인하고 수행 여부를 체크하는 테이블
create table public.assigned_exercises (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.treatment_sessions(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  exercise_id text not null references public.home_exercises(id) on delete cascade,
  custom_prescription text,              -- 고객 맞춤 횟수/세트 조정 안내
  is_active boolean not null default true,
  assigned_at timestamptz not null default now()
);

create table public.exercise_check_logs (
  id uuid primary key default uuid_generate_v4(),
  assigned_exercise_id uuid not null references public.assigned_exercises(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  checked_date date not null default current_date,
  completed boolean not null default true,
  client_feedback text,                  -- 예: '편안함', '약간 당김'
  created_at timestamptz not null default now(),
  unique (assigned_exercise_id, checked_date)
);

-- ============================================================================
-- 고객 노출 전용 안전한 뷰 (client_safe_sessions_view)
-- 고객 화면 조회 시 therapist_private_note와 내부 관찰 코드가 원천 차단된 뷰 제공
-- ============================================================================
create or replace view public.client_safe_sessions_view as
select
  ts.id,
  ts.client_id,
  ts.session_number,
  ts.session_date,
  ts.selected_program_ids,
  ts.client_public_note,
  ts.created_at
from public.treatment_sessions ts;

-- ============================================================================
-- Row Level Security (RLS) 권한 분리 정책
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_packages enable row level security;
alter table public.observation_items enable row level security;
alter table public.care_programs enable row level security;
alter table public.home_exercises enable row level security;
alter table public.observation_program_rules enable row level security;
alter table public.treatment_sessions enable row level security;
alter table public.assigned_exercises enable row level security;
alter table public.exercise_check_logs enable row level security;

-- 헬퍼 함수: 현재 로그인한 사용자의 역할 조회
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 1) 관리자(admin) 및 관리사(therapist)는 고객/세션/가이드 전체 조회 및 작성 가능
create policy "Staff can read all clients" on public.clients
  for select using (public.get_my_role() in ('admin', 'therapist'));

create policy "Staff can write clients" on public.clients
  for all using (public.get_my_role() in ('admin', 'therapist'));

create policy "Clients can read own record" on public.clients
  for select using (user_id = auth.uid());

-- 2) 관찰 항목 및 관리 프로그램 가이드(수기 관리법 포함)는 오직 관리자·관리사만 조회 가능 (2-2 노출 범위 준수)
create policy "Only staff can read observation items" on public.observation_items
  for select using (public.get_my_role() in ('admin', 'therapist'));

create policy "Only admin can modify observation items" on public.observation_items
  for all using (public.get_my_role() = 'admin');

create policy "Only staff can read care programs" on public.care_programs
  for select using (public.get_my_role() in ('admin', 'therapist'));

create policy "Only admin can modify care programs" on public.care_programs
  for all using (public.get_my_role() = 'admin');

create policy "Only staff can read mapping rules" on public.observation_program_rules
  for select using (public.get_my_role() in ('admin', 'therapist'));

create policy "Only admin can modify mapping rules" on public.observation_program_rules
  for all using (public.get_my_role() = 'admin');

-- 3) 홈운동 자료는 고객도 본인에게 배정된 운동을 봐야 하므로 인증된 사용자 모두 조회 가능
create policy "Authenticated users can read home exercises" on public.home_exercises
  for select using (auth.role() = 'authenticated');

create policy "Only admin can modify home exercises" on public.home_exercises
  for all using (public.get_my_role() = 'admin');

-- 4) 고객의 홈운동 수행 체크는 본인 또는 스태프만 가능
create policy "Users can read own assigned exercises" on public.assigned_exercises
  for select using (
    public.get_my_role() in ('admin', 'therapist')
    or client_id in (select id from public.clients where user_id = auth.uid())
  );

create policy "Clients can check own exercises" on public.exercise_check_logs
  for all using (
    public.get_my_role() in ('admin', 'therapist')
    or client_id in (select id from public.clients where user_id = auth.uid())
  );
