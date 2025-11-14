-- 表结构：questions
create table if not exists public.questions (
  id integer primary key,
  question text not null,
  options jsonb not null default '[]',
  answer text not null,
  explanation text,
  has_image boolean not null default false,
  image_path text
);

alter table public.questions add column if not exists question text;
alter table public.questions add column if not exists options jsonb default '[]';
alter table public.questions add column if not exists answer text;
alter table public.questions add column if not exists explanation text;
alter table public.questions add column if not exists has_image boolean default false;
alter table public.questions add column if not exists image_path text;
alter table public.questions add column if not exists type text;
alter table public.questions add column if not exists qid integer;
create unique index if not exists idx_questions_qid on public.questions (qid);

-- 历史记录表：question_edits
create table if not exists public.question_edits (
  id bigserial primary key,
  question_id uuid not null references public.questions(id) on delete cascade,
  edited_at timestamptz not null default now(),
  previous jsonb not null,
  current jsonb not null,
  editor uuid
);

-- 索引
do $$
begin
  create index if not exists idx_questions_question_lower on public.questions (lower(question));
exception when others then
  null;
end $$;
create index if not exists idx_question_edits_qid on public.question_edits (question_id);

-- 触发器：更新 questions 时记录历史
create or replace function public.log_question_update()
returns trigger as $$
begin
  insert into public.question_edits(question_id, previous, current, editor)
  values (
    old.id,
    jsonb_build_object(
      'question', old.question,
      'options', old.options,
      'answer', old.answer,
      'explanation', old.explanation,
      'has_image', old.has_image,
      'image_path', old.image_path
    ),
    jsonb_build_object(
      'question', new.question,
      'options', new.options,
      'answer', new.answer,
      'explanation', new.explanation,
      'has_image', new.has_image,
      'image_path', new.image_path
    ),
    (select coalesce(((current_setting('request.jwt.claims', true))::json->>'sub')::uuid, null))
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_log_question_update on public.questions;
create trigger trg_log_question_update
after update on public.questions
for each row execute procedure public.log_question_update();

-- 开启 RLS
alter table public.questions enable row level security;
alter table public.question_edits enable row level security;

drop policy if exists p_questions_select_anon on public.questions;
create policy p_questions_select_anon
  on public.questions
  for select
  to anon
  using (true);

drop policy if exists p_questions_upsert_authenticated on public.questions;
create policy p_questions_upsert_authenticated
  on public.questions
  for insert
  to authenticated
  with check (true);

drop policy if exists p_questions_update_authenticated on public.questions;
create policy p_questions_update_authenticated
  on public.questions
  for update
  to authenticated
  using (true)
  with check (true);

-- 匿名用户允许写入（公开项目）
drop policy if exists p_questions_insert_anon on public.questions;
create policy p_questions_insert_anon
  on public.questions
  for insert
  to anon
  with check (true);

drop policy if exists p_questions_update_anon on public.questions;
create policy p_questions_update_anon
  on public.questions
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists p_question_edits_select_authenticated on public.question_edits;
create policy p_question_edits_select_authenticated
  on public.question_edits
  for select
  to authenticated
  using (true);

-- 允许匿名与登录用户写入历史（供触发器使用）
drop policy if exists p_question_edits_insert_anon on public.question_edits;
create policy p_question_edits_insert_anon
  on public.question_edits
  for insert
  to anon
  with check (true);

drop policy if exists p_question_edits_insert_authenticated on public.question_edits;
create policy p_question_edits_insert_authenticated
  on public.question_edits
  for insert
  to authenticated
  with check (true);
