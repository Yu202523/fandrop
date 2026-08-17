create extension if not exists pgcrypto;

create type public.event_status as enum (
  'draft',
  'upcoming',
  'live',
  'low_stock',
  'moved',
  'ended'
);

create type public.event_update_type as enum (
  'created',
  'started',
  'quantity_changed',
  'location_changed',
  'low_stock',
  'ended',
  'note'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_not_blank check (btrim(name) <> ''),
  constraint profiles_email_not_blank check (btrim(email) <> '')
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  idol text not null,
  description text,
  image_url text,
  location_text text not null,
  event_date date not null,
  status public.event_status not null default 'draft',
  quantity integer not null,
  remaining_quantity integer not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint events_title_not_blank check (btrim(title) <> ''),
  constraint events_idol_not_blank check (btrim(idol) <> ''),
  constraint events_location_not_blank check (btrim(location_text) <> ''),
  constraint events_quantity_positive check (quantity > 0),
  constraint events_remaining_non_negative check (remaining_quantity >= 0),
  constraint events_remaining_not_over_total check (remaining_quantity <= quantity)
);

create table public.event_updates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  type public.event_update_type not null,
  status public.event_status not null,
  message text,
  location_text text,
  remaining_quantity integer,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint event_updates_remaining_non_negative check (
    remaining_quantity is null or remaining_quantity >= 0
  )
);

create table public.event_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint event_subscriptions_unique unique (user_id, event_id)
);

create index events_created_by_idx on public.events (created_by, created_at desc);
create index events_status_event_date_idx on public.events (status, event_date);
create index events_last_updated_at_idx on public.events (last_updated_at desc);
create index event_updates_event_id_created_at_idx on public.event_updates (event_id, created_at desc);
create index event_subscriptions_user_id_created_at_idx on public.event_subscriptions (user_id, created_at desc);
create index event_subscriptions_event_id_idx on public.event_subscriptions (event_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'fan'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.create_event_update(
  p_event_id uuid,
  p_type public.event_update_type,
  p_status public.event_status,
  p_message text default null,
  p_location_text text default null,
  p_remaining_quantity integer default null
)
returns public.event_updates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_actor uuid;
  v_next_location text;
  v_next_remaining integer;
  v_update public.event_updates;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  if v_event.created_by <> v_actor then
    raise exception 'Only the organizer can update this event';
  end if;

  v_next_location := coalesce(p_location_text, v_event.location_text);
  v_next_remaining := coalesce(p_remaining_quantity, v_event.remaining_quantity);

  if v_next_remaining < 0 then
    raise exception 'Remaining quantity cannot be negative';
  end if;

  if v_next_remaining > v_event.quantity then
    raise exception 'Remaining quantity cannot exceed total quantity';
  end if;

  update public.events
  set
    status = p_status,
    location_text = v_next_location,
    remaining_quantity = v_next_remaining,
    last_updated_at = now(),
    ended_at = case when p_status = 'ended' then coalesce(ended_at, now()) else null end
  where id = p_event_id
  returning * into v_event;

  insert into public.event_updates (
    event_id,
    type,
    status,
    message,
    location_text,
    remaining_quantity,
    created_by
  )
  values (
    p_event_id,
    p_type,
    p_status,
    nullif(btrim(coalesce(p_message, '')), ''),
    v_next_location,
    v_next_remaining,
    v_actor
  )
  returning * into v_update;

  return v_update;
end;
$$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_updates enable row level security;
alter table public.event_subscriptions enable row level security;

create policy "profiles are publicly readable"
on public.profiles
for select
using (true);

create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "events are publicly readable"
on public.events
for select
using (true);

create policy "authenticated users can create their own events"
on public.events
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "organizers can update their own events"
on public.events
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "event updates are publicly readable"
on public.event_updates
for select
using (true);

create policy "organizers can insert updates for their own events"
on public.event_updates
for insert
to authenticated
with check (
  auth.uid() = created_by
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.created_by = auth.uid()
  )
);

create policy "subscriptions are readable by owner"
on public.event_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their own subscriptions"
on public.event_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete their own subscriptions"
on public.event_subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

grant execute on function public.create_event_update(
  uuid,
  public.event_update_type,
  public.event_status,
  text,
  text,
  integer
) to authenticated;
