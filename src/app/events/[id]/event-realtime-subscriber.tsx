"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

type EventRealtimeSubscriberProps = {
  eventId: string;
};

export function EventRealtimeSubscriber({ eventId }: EventRealtimeSubscriberProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const channel = supabase
      .channel(`event-detail:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        () => {
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => router.refresh(), 300);
        },
      )
      .subscribe();

    return () => {
      clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [eventId, router]);

  return null;
}
