"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getSafeReturnPath(value: string, fallbackEventId: string) {
  if (value.startsWith("/")) {
    return value;
  }

  return `/events/${fallbackEventId}`;
}

export async function subscribeToEvent(formData: FormData) {
  const eventId = readText(formData, "event_id");
  const returnPath = getSafeReturnPath(readText(formData, "return_path"), eventId);
  const user = await requireUser(returnPath);

  if (!eventId) {
    redirect(returnPath);
  }

  const supabase = await createClient();
  await supabase.from("event_subscriptions").upsert(
    {
      user_id: user.id,
      event_id: eventId,
    },
    {
      onConflict: "user_id,event_id",
      ignoreDuplicates: true,
    },
  );

  revalidatePath(returnPath);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/my/follows");
  redirect(returnPath);
}

export async function unsubscribeFromEvent(formData: FormData) {
  const eventId = readText(formData, "event_id");
  const returnPath = getSafeReturnPath(readText(formData, "return_path"), eventId);
  const user = await requireUser(returnPath);

  if (!eventId) {
    redirect(returnPath);
  }

  const supabase = await createClient();
  await supabase
    .from("event_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  revalidatePath(returnPath);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/my/follows");
  redirect(returnPath);
}
