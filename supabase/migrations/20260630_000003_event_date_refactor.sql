alter table public.events
add column if not exists event_date date;

update public.events
set event_date = start_at::date
where event_date is null;

alter table public.events
alter column event_date set not null;

drop index if exists public.events_status_start_at_idx;
create index if not exists events_status_event_date_idx on public.events (status, event_date);

alter table public.events
drop column if exists start_at;

drop function if exists public.create_event(
  text,
  text,
  text,
  timestamptz,
  integer,
  text,
  text
);

create or replace function public.create_event(
  p_title text,
  p_idol text,
  p_location_text text,
  p_event_date date,
  p_quantity integer,
  p_description text default null,
  p_image_url text default null
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_event public.events;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  insert into public.events (
    title,
    idol,
    description,
    image_url,
    location_text,
    event_date,
    status,
    quantity,
    remaining_quantity,
    created_by
  )
  values (
    nullif(btrim(p_title), ''),
    nullif(btrim(p_idol), ''),
    nullif(btrim(coalesce(p_description, '')), ''),
    nullif(btrim(coalesce(p_image_url, '')), ''),
    nullif(btrim(p_location_text), ''),
    p_event_date,
    'upcoming',
    p_quantity,
    p_quantity,
    v_actor
  )
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
    v_event.id,
    'created',
    v_event.status,
    'Event created',
    v_event.location_text,
    v_event.remaining_quantity,
    v_actor
  );

  return v_event;
end;
$$;

grant execute on function public.create_event(
  text,
  text,
  text,
  date,
  integer,
  text,
  text
) to authenticated;
