"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function deleteEventAction(formData: FormData) {
  const user = await requireOrganizerUser();

  const eventId = readText(formData, "event_id");
  const returnPath = readText(formData, "return_path") || "/my/events";

  if (!eventId) {
    redirect(returnPath);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("created_by", user.id);

  if (error) {
    console.error("Failed to delete event", error);
    redirect(`${returnPath}?delete_error=1`);
  }

  revalidatePath("/");
  revalidatePath("/my/events");
  revalidatePath("/my/follows");
  revalidatePath(`/events/${eventId}`);
  redirect(returnPath);
}
