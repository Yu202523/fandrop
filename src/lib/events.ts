import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { EventRow, EventSubscriptionRow, EventUpdateRow } from "@/lib/supabase/types";

export const getEvents = cache(async (): Promise<EventRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to load events", error);
    return [];
  }

  return (data ?? []) as EventRow[];
});

export const getMyEvents = cache(async (userId: string): Promise<EventRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", userId)
    .order("last_updated_at", { ascending: false });

  if (error) {
    console.error("Failed to load my events", error);
    return [];
  }

  return (data ?? []) as EventRow[];
});

export const getEventDetail = cache(async (eventId: string) => {
  const supabase = await createClient();

  const [{ data: event, error: eventError }, { data: updates, error: updatesError }] =
    await Promise.all([
      supabase.from("events").select("*").eq("id", eventId).single(),
      supabase
        .from("event_updates")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false }),
    ]);

  if (eventError) {
    console.error("Failed to load event", eventError);
    return null;
  }

  if (updatesError) {
    console.error("Failed to load event updates", updatesError);
  }

  return {
    event: event as EventRow,
    updates: ((updates ?? []) as EventUpdateRow[]),
  };
});

export const getEventSubscription = cache(async (eventId: string, userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_subscriptions")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event subscription", error);
    return null;
  }

  return data as EventSubscriptionRow | null;
});

type FollowedEventRow = EventSubscriptionRow & {
  events: EventRow | EventRow[] | null;
};

export const getFollowedEvents = cache(async (userId: string): Promise<EventRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_subscriptions")
    .select("id, user_id, event_id, created_at, events(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load followed events", error);
    return [];
  }

  return ((data ?? []) as FollowedEventRow[])
    .map((subscription) =>
      Array.isArray(subscription.events) ? (subscription.events[0] ?? null) : subscription.events,
    )
    .filter((event): event is EventRow => Boolean(event));
});
