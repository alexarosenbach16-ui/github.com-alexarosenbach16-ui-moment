-- Moment schema for two people on the Supabase free tier.
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Then turn OFF Authentication → Providers → Email → Confirm email.
-- See SETUP.md.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  adult_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (couple_id, user_id)
);

create unique index if not exists one_open_couple_per_user
  on public.couple_members (user_id)
  where left_at is null;

create table if not exists public.questions (
  idx int primary key,
  prompt text not null,
  kind text not null
);

create table if not exists public.daily_questions (
  couple_id uuid not null references public.couples (id) on delete cascade,
  day date not null,
  question_index int not null,
  primary key (couple_id, day)
);

create table if not exists public.answers (
  couple_id uuid not null references public.couples (id) on delete cascade,
  day date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_index int not null,
  body text not null,
  created_at timestamptz not null default now(),
  primary key (couple_id, day, user_id)
);

create table if not exists public.answer_flags (
  couple_id uuid not null references public.couples (id) on delete cascade,
  day date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (couple_id, day, user_id)
);

create table if not exists public.moods (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  mood text not null default '',
  shared boolean not null default false,
  primary key (user_id, day)
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null,
  note text not null default '',
  owner_user_id uuid references public.profiles (id) on delete cascade,
  due date,
  done boolean not null default false,
  created_by uuid not null references public.profiles (id) on delete cascade
);

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.questions enable row level security;
alter table public.daily_questions enable row level security;
alter table public.answers enable row level security;
alter table public.answer_flags enable row level security;
alter table public.moods enable row level security;
alter table public.todos enable row level security;

create or replace function public.active_couple(uid uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.couple_id
  from public.couple_members m
  join public.couples c on c.id = m.couple_id
  where m.user_id = uid
    and m.left_at is null
    and c.closed_at is null
  limit 1;
$$;

create or replace function public.question_index(couple uuid, day date, total int)
returns int
language plpgsql
immutable
as $$
declare
  input text := couple::text || '|' || day::text;
  hash bigint := 0;
  i int;
  ch int;
begin
  if total is null or total <= 0 then
    return 0;
  end if;
  for i in 1..char_length(input) loop
    ch := ascii(substr(input, i, 1));
    hash := mod(hash * 33, 4294967296);
    hash := mod(hash + ch, 4294967296);
  end loop;
  return (hash % total)::int;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, adult_confirmed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'adult')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.guard_couple_size()
returns trigger
language plpgsql
as $$
begin
  if new.left_at is null and (
    select count(*) from public.couple_members
    where couple_id = new.couple_id and left_at is null and user_id <> new.user_id
  ) >= 2 then
    raise exception 'This couple already has two people';
  end if;
  return new;
end;
$$;

drop trigger if exists couple_size on public.couple_members;
create trigger couple_size
  before insert or update on public.couple_members
  for each row execute function public.guard_couple_size();

create or replace function public.create_couple()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  cid uuid;
  i int;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if public.active_couple(uid) is not null then
    select c.invite_code into code
    from public.couples c
    where c.id = public.active_couple(uid);
    return code;
  end if;
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.couples where invite_code = code);
  end loop;
  insert into public.couples (invite_code, created_by)
  values (code, uid)
  returning id into cid;
  insert into public.couple_members (couple_id, user_id)
  values (cid, uid);
  return code;
end;
$$;

create or replace function public.join_couple(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  cid uuid;
  members int;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if char_length(code) < 4 then
    raise exception 'That code is too short';
  end if;
  select id into cid from public.couples where invite_code = code and closed_at is null;
  if cid is null then
    raise exception 'That code does not match a couple';
  end if;
  if exists (select 1 from public.couple_members where couple_id = cid and user_id = uid and left_at is null) then
    return cid;
  end if;
  if public.active_couple(uid) is not null then
    raise exception 'Leave your current couple before joining another';
  end if;
  select count(*) into members from public.couple_members where couple_id = cid and left_at is null;
  if members >= 2 then
    raise exception 'This couple already has two people';
  end if;
  insert into public.couple_members (couple_id, user_id) values (cid, uid);
  return cid;
end;
$$;

create or replace function public.unpair()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  cid := public.active_couple(uid);
  if cid is null then
    return;
  end if;
  update public.couple_members set left_at = now() where couple_id = cid and left_at is null;
  update public.couples set closed_at = now() where id = cid and closed_at is null;
end;
$$;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  perform public.unpair();
  delete from auth.users where id = uid;
end;
$$;

create or replace function public.ensure_today(p_day date)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  total int;
  idx int;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  cid := public.active_couple(uid);
  if cid is null then
    return 0;
  end if;
  select count(*) into total from public.questions;
  select question_index into idx from public.daily_questions where couple_id = cid and day = p_day;
  if idx is not null then
    return idx;
  end if;
  idx := public.question_index(cid, p_day, total);
  insert into public.daily_questions (couple_id, day, question_index)
  values (cid, p_day, idx)
  on conflict (couple_id, day) do nothing;
  select question_index into idx from public.daily_questions where couple_id = cid and day = p_day;
  return coalesce(idx, 0);
end;
$$;

create or replace function public.submit_answer(p_day date, p_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  idx int;
  clean text := left(btrim(coalesce(p_body, '')), 140);
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if clean = '' then
    raise exception 'Write a short answer first';
  end if;
  cid := public.active_couple(uid);
  if cid is null then
    raise exception 'Create or join a couple first';
  end if;
  idx := public.ensure_today(p_day);
  insert into public.answers (couple_id, day, user_id, question_index, body)
  values (cid, p_day, uid, idx, clean)
  on conflict (couple_id, day, user_id) do nothing;
  insert into public.answer_flags (couple_id, day, user_id)
  values (cid, p_day, uid)
  on conflict (couple_id, day, user_id) do nothing;
end;
$$;

create or replace function public.set_mood(p_day date, p_mood text, p_shared boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  insert into public.moods (user_id, day, mood, shared)
  values (uid, p_day, left(coalesce(p_mood, ''), 40), coalesce(p_shared, false))
  on conflict (user_id, day) do update
    set mood = excluded.mood,
        shared = excluded.shared;
end;
$$;

create or replace function public.save_todo(p_id uuid, p_title text, p_note text, p_shared boolean, p_due date, p_done boolean)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  title text := left(btrim(coalesce(p_title, '')), 80);
  owner uuid;
  result uuid;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if title = '' then
    raise exception 'Give the to-do a name';
  end if;
  cid := public.active_couple(uid);
  if cid is null then
    raise exception 'Create or join a couple first';
  end if;
  owner := case when coalesce(p_shared, true) then null else uid end;
  if p_id is not null and exists (
    select 1 from public.todos
    where id = p_id and couple_id = cid and (owner_user_id is null or owner_user_id = uid)
  ) then
    update public.todos
      set title = title,
          note = left(coalesce(p_note, ''), 240),
          owner_user_id = owner,
          due = p_due,
          done = coalesce(p_done, false)
      where id = p_id
      returning id into result;
    return result;
  end if;
  insert into public.todos (couple_id, title, note, owner_user_id, due, done, created_by)
  values (cid, title, left(coalesce(p_note, ''), 240), owner, p_due, coalesce(p_done, false), uid)
  returning id into result;
  return result;
end;
$$;

create or replace function public.toggle_todo(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  cid := public.active_couple(uid);
  update public.todos
    set done = not done
    where id = p_id
      and couple_id = cid
      and (owner_user_id is null or owner_user_id = uid);
end;
$$;

create or replace function public.sync_state(p_day date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  partner uuid;
  my_name text := '';
  partner_name text := '';
  code text := '';
  paired boolean := false;
  idx int := 0;
  mine text := '';
  mine_at bigint := 0;
  partner_done boolean := false;
  partner_body text := '';
  my_mood text := '';
  my_shared boolean := false;
  their_mood text := '';
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  select display_name into my_name from public.profiles where id = uid;
  cid := public.active_couple(uid);
  if cid is not null then
    select c.invite_code into code from public.couples c where c.id = cid;
    select m.user_id, p.display_name into partner, partner_name
    from public.couple_members m
    join public.profiles p on p.id = m.user_id
    where m.couple_id = cid and m.user_id <> uid and m.left_at is null
    limit 1;
    paired := partner is not null;
    idx := public.ensure_today(p_day);
    select a.body, floor(extract(epoch from a.created_at) * 1000)::bigint
      into mine, mine_at
    from public.answers a
    where a.couple_id = cid and a.day = p_day and a.user_id = uid;
    select exists (
      select 1 from public.answers a
      where a.couple_id = cid and a.day = p_day and a.user_id = partner
    ) into partner_done;
    if partner_done and coalesce(mine, '') <> '' then
      select a.body into partner_body
      from public.answers a
      where a.couple_id = cid and a.day = p_day and a.user_id = partner;
    else
      partner_body := '';
    end if;
    select mood, shared into my_mood, my_shared from public.moods where user_id = uid and day = p_day;
    if partner is not null then
      select mood into their_mood from public.moods where user_id = partner and day = p_day and shared = true;
    end if;
  end if;

  return jsonb_build_object(
    'user_id', uid,
    'couple_id', cid,
    'invite_code', coalesce(code, ''),
    'paired', paired,
    'my_name', coalesce(my_name, ''),
    'partner_name', coalesce(partner_name, ''),
    'day', p_day,
    'question_index', coalesce(idx, 0),
    'my_answer', coalesce(mine, ''),
    'my_answered_at', coalesce(mine_at, 0),
    'partner_answered', coalesce(partner_done, false),
    'partner_answer', coalesce(partner_body, ''),
    'mood', coalesce(my_mood, ''),
    'mood_shared', coalesce(my_shared, false),
    'partner_mood', coalesce(their_mood, ''),
    'todos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'note', t.note,
        'owner', case when t.owner_user_id is null then 'us' else 'me' end,
        'due', t.due,
        'done', t.done
      ) order by t.title)
      from public.todos t
      where cid is not null
        and t.couple_id = cid
        and (t.owner_user_id is null or t.owner_user_id = uid)
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', a.day,
        'question_index', a.question_index,
        'mine', a.body,
        'partner', case
          when m.left_at is null and c.closed_at is null and b.body is not null then b.body
          else ''
        end
      ) order by a.day desc)
      from public.answers a
      left join public.answers b
        on b.couple_id = a.couple_id and b.day = a.day and b.user_id <> a.user_id
      left join public.couple_members m
        on m.couple_id = a.couple_id and m.user_id = uid and m.left_at is null
      left join public.couples c on c.id = a.couple_id
      where a.user_id = uid
    ), '[]'::jsonb)
  );
end;
$$;

insert into public.questions (idx, prompt, kind) values
  (0, 'What’s one little thing they do that means more than they know?', 'Appreciation'),
  (1, 'If we could press pause on everything for an afternoon, what would we do?', 'Question'),
  (2, 'We have a free evening. What sounds most like us?', 'Choice'),
  (3, 'Leave your partner a little note somewhere they’ll find it.', 'Action'),
  (4, 'How connected are you feeling today?', 'Check-in'),
  (5, 'What’s one small thing that would help us feel like a team again?', 'Question'),
  (6, 'When words are hard, what helps you feel heard?', 'Question'),
  (7, 'What little long-distance ritual would you love this week?', 'Choice'),
  (8, 'What’s an ordinary moment with us you’d like more of?', 'Appreciation'),
  (9, 'Which tiny hello would you love today?', 'Choice'),
  (10, 'What’s one good thing from your day to hand me?', 'Question'),
  (11, 'What would help you feel close today?', 'Choice'),
  (12, 'Where does a hard conversation feel easiest?', 'Question'),
  (13, 'What’s one way you’re still glad we’re a team?', 'Appreciation'),
  (14, 'Send a one-line note you wish they could hear.', 'Action'),
  (15, 'What pace feels kind today?', 'Question'),
  (16, 'When could we steal ten minutes?', 'Choice'),
  (17, 'What do you need from me this week?', 'Question'),
  (18, 'What’s a tiny plan you’d actually look forward to?', 'Question'),
  (19, 'How close do you feel right now?', 'Check-in'),
  (20, 'What part of my day do you want in on?', 'Question'),
  (21, 'What’s something you’ve done lately that I noticed?', 'Appreciation')
on conflict (idx) do update set prompt = excluded.prompt, kind = excluded.kind;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists couples_select_member on public.couples;
create policy couples_select_member on public.couples for select to authenticated using (
  id in (select couple_id from public.couple_members where user_id = auth.uid())
);

drop policy if exists members_select_couple on public.couple_members;
create policy members_select_couple on public.couple_members for select to authenticated using (
  couple_id in (select couple_id from public.couple_members mine where mine.user_id = auth.uid())
);

drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions for select to authenticated using (true);

drop policy if exists daily_select_member on public.daily_questions;
create policy daily_select_member on public.daily_questions for select to authenticated using (
  couple_id = public.active_couple(auth.uid())
);

-- Direct reads never include the other person's answer. sync_state reveals it only after both exist.
drop policy if exists answers_select_own on public.answers;
create policy answers_select_own on public.answers for select to authenticated using (user_id = auth.uid());

drop policy if exists flags_select_couple on public.answer_flags;
create policy flags_select_couple on public.answer_flags for select to authenticated using (
  couple_id = public.active_couple(auth.uid())
);

drop policy if exists moods_select on public.moods;
create policy moods_select on public.moods for select to authenticated using (
  user_id = auth.uid()
  or (
    shared = true
    and user_id in (
      select m.user_id from public.couple_members m
      where m.couple_id = public.active_couple(auth.uid()) and m.left_at is null
    )
  )
);

drop policy if exists todos_select on public.todos;
create policy todos_select on public.todos for select to authenticated using (
  couple_id = public.active_couple(auth.uid())
  and (owner_user_id is null or owner_user_id = auth.uid())
);

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.couples to authenticated;
grant select on public.couple_members to authenticated;
grant select on public.questions to authenticated;
grant select on public.daily_questions to authenticated;
grant select on public.answers to authenticated;
grant select on public.answer_flags to authenticated;
grant select on public.moods to authenticated;
grant select on public.todos to authenticated;

revoke all on function public.create_couple() from public, anon;
revoke all on function public.join_couple(text) from public, anon;
revoke all on function public.unpair() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.ensure_today(date) from public, anon;
revoke all on function public.submit_answer(date, text) from public, anon;
revoke all on function public.set_mood(date, text, boolean) from public, anon;
revoke all on function public.save_todo(uuid, text, text, boolean, date, boolean) from public, anon;
revoke all on function public.toggle_todo(uuid) from public, anon;
revoke all on function public.sync_state(date) from public, anon;
grant execute on function public.create_couple() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
grant execute on function public.unpair() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.ensure_today(date) to authenticated;
grant execute on function public.submit_answer(date, text) to authenticated;
grant execute on function public.set_mood(date, text, boolean) to authenticated;
grant execute on function public.save_todo(uuid, text, text, boolean, date, boolean) to authenticated;
grant execute on function public.toggle_todo(uuid) to authenticated;
grant execute on function public.sync_state(date) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'answer_flags'
  ) then
    alter publication supabase_realtime add table public.answer_flags;
  end if;
exception when others then
  raise notice 'Turn on Realtime for public.answer_flags in Database → Publications if the banner feels slow. Polling still works.';
end $$;
