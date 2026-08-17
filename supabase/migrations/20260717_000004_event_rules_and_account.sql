alter table public.events
add column if not exists pickup_rules text,
add column if not exists organizer_account text;

update public.events
set
  pickup_rules = coalesce(nullif(btrim(pickup_rules), ''), '請依現場公告領取。'),
  organizer_account = coalesce(nullif(btrim(organizer_account), ''), '尚未提供')
where pickup_rules is null
   or btrim(pickup_rules) = ''
   or organizer_account is null
   or btrim(organizer_account) = '';

alter table public.events
alter column pickup_rules set not null,
alter column organizer_account set not null;

drop function if exists public.create_event(
  text,
  text,
  text,
  date,
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
  p_image_url text default null,
  p_pickup_rules text default null,
  p_organizer_account text default null
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

  if nullif(btrim(coalesce(p_pickup_rules, '')), '') is null then
    raise exception 'Pickup rules are required';
  end if;

  if nullif(btrim(coalesce(p_organizer_account, '')), '') is null then
    raise exception 'Organizer account is required';
  end if;

  insert into public.events (
    title,
    idol,
    description,
    image_url,
    pickup_rules,
    organizer_account,
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
    nullif(btrim(coalesce(p_pickup_rules, '')), ''),
    nullif(btrim(coalesce(p_organizer_account, '')), ''),
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
  text,
  text,
  text
) to authenticated;
