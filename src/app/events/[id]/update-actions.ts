"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { EventUpdateFormState, OrganizerUpdateKind } from "@/app/events/[id]/update-state";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EventStatus } from "@/lib/supabase/types";

type EventUpdateType =
  | "started"
  | "quantity_changed"
  | "location_changed"
  | "low_stock"
  | "ended"
  | "note";

function readText(formData: FormData, key: keyof EventUpdateFormState["values"]) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNextStatus(kind: OrganizerUpdateKind, currentStatus: EventStatus): EventStatus {
  switch (kind) {
    case "start_giveaway":
      return "live";
    case "move_location":
      return "moved";
    case "quantity_update":
      if (currentStatus === "draft" || currentStatus === "ended") return "upcoming";
      return currentStatus;
    case "low_stock":
      return "low_stock";
    case "end_giveaway":
      return "ended";
    case "note":
      return currentStatus;
  }
}

function getUpdateType(kind: OrganizerUpdateKind): EventUpdateType {
  switch (kind) {
    case "start_giveaway":
      return "started";
    case "move_location":
      return "location_changed";
    case "quantity_update":
      return "quantity_changed";
    case "low_stock":
      return "low_stock";
    case "end_giveaway":
      return "ended";
    case "note":
      return "note";
  }
}

export async function createEventUpdateAction(
  _prevState: EventUpdateFormState,
  formData: FormData,
): Promise<EventUpdateFormState> {
  await requireUser();

  const values: EventUpdateFormState["values"] = {
    event_id: readText(formData, "event_id"),
    current_status: readText(formData, "current_status"),
    update_kind: (readText(formData, "update_kind") as OrganizerUpdateKind) || "start_giveaway",
    location_text: readText(formData, "location_text"),
    remaining_quantity: readText(formData, "remaining_quantity"),
    message: readText(formData, "message"),
  };

  const errors: EventUpdateFormState["errors"] = {};

  if (!values.event_id) {
    errors.form = "缺少活動資料，請重新整理頁面後再試一次。";
  }

  const currentStatus = values.current_status as EventStatus;
  const nextStatus = getNextStatus(values.update_kind, currentStatus);
  const updateType = getUpdateType(values.update_kind);

  const nextLocation: string | null = values.location_text || null;
  let nextRemaining: number | null = null;

  if (values.update_kind === "move_location" && !values.location_text) {
    errors.location_text = "請填寫最新地點。";
  }

  if (values.remaining_quantity) {
    const parsed = Number(values.remaining_quantity);
    if (!Number.isInteger(parsed) || parsed < 0) {
      errors.remaining_quantity = "剩餘數量必須是大於或等於 0 的整數。";
    } else {
      nextRemaining = parsed;
    }
  }

  if (values.update_kind === "quantity_update" && !values.remaining_quantity) {
    errors.remaining_quantity = "請填寫剩餘數量。";
  }

  if (values.update_kind === "note" && !values.message) {
    errors.message = "請填寫補充說明內容。";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_event_update", {
    p_event_id: values.event_id,
    p_type: updateType,
    p_status: nextStatus,
    p_message: values.message || null,
    p_location_text: nextLocation,
    p_remaining_quantity: nextRemaining,
  });

  if (error) {
    return {
      errors: {
        form: "送出更新失敗，請確認 Supabase migration 已正確套用後再試一次。",
      },
      values,
    };
  }

  revalidatePath("/");
  revalidatePath("/my/events");
  revalidatePath(`/events/${values.event_id}`);
  redirect(`/events/${values.event_id}`);
}
