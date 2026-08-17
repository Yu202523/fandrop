-- Creates an event through one database entrypoint so the initial event row
-- and its first timeline record are always written together.
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
  -- The authenticated organizer creating the event.
  v_actor uuid;
  -- The inserted event row returned to the caller.
  v_event public.events;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  -- Insert the current canonical event state used by list/detail pages.
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

  -- Seed the update timeline with an initial "created" record so the event
  -- history starts from the moment the organizer publishes it.
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

-- Allow logged-in users to create events only through this RPC.
grant execute on function public.create_event(
  text,
  text,
  text,
  date,
  integer,
  text,
  text
) to authenticated;
