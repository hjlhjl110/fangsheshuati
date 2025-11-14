-- 重置并重建公开写入的数据结构（无需登录）

-- 1) 清理触发器与函数
drop trigger if exists trg_log_question_update on public.questions;
drop function if exists public.log_question_update;

-- 2) 清理策略（questions）
drop policy if exists p_questions_select_anon on public.questions;
drop policy if exists p_questions_insert_anon on public.questions;
drop policy if exists p_questions_update_anon on public.questions;
drop policy if exists p_questions_upsert_authenticated on public.questions;
drop policy if exists p_questions_update_authenticated on public.questions;

-- 3) 清理策略（question_edits）
drop policy if exists p_question_edits_select_authenticated on public.question_edits;
drop policy if exists p_question_edits_insert_anon on public.question_edits;
drop policy if exists p_question_edits_insert_authenticated on public.question_edits;

-- 4) 删除表
drop table if exists public.question_edits cascade;
drop table if exists public.questions cascade;

-- 5) 重建表（使用 qid 作为主键，兼容前端 upsert on_conflict=qid）
create table public.questions (
  qid integer primary key,
  question text not null,
  options jsonb not null default '[]',
  answer text not null,
  explanation text,
  has_image boolean not null default false,
  image_path text
);

create table public.question_edits (
  id bigserial primary key,
  question_id integer not null references public.questions(qid) on delete cascade,
  edited_at timestamptz not null default now(),
  previous jsonb not null,
  current jsonb not null,
  editor text
);

-- 6) 索引
create index idx_questions_question_lower on public.questions (lower(question));

-- 7) 触发器记录历史
create or replace function public.log_question_update()
returns trigger as $$
begin
  insert into public.question_edits(question_id, previous, current, editor)
  values (
    old.qid,
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
    null
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_log_question_update
after update on public.questions
for each row execute procedure public.log_question_update();

-- 8) 开启 RLS
alter table public.questions enable row level security;
alter table public.question_edits enable row level security;

-- 9) 策略：公开读写
create policy p_questions_select_anon
  on public.questions for select to anon using (true);
create policy p_questions_insert_anon
  on public.questions for insert to anon with check (true);
create policy p_questions_update_anon
  on public.questions for update to anon using (true) with check (true);

-- 历史记录允许匿名插入（供触发器写入）
create policy p_question_edits_insert_anon
  on public.question_edits for insert to anon with check (true);
create policy p_question_edits_select_authenticated
  on public.question_edits for select to authenticated using (true);

