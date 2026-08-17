"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CreateEventFormState } from "@/app/events/new/state";
import { requireOrganizerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, key: keyof CreateEventFormState["values"]) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createEventAction(
  _prevState: CreateEventFormState,
  formData: FormData,
): Promise<CreateEventFormState> {
  await requireOrganizerUser("/events/new");

  const values: CreateEventFormState["values"] = {
    title: readText(formData, "title"),
    idol: readText(formData, "idol"),
    event_date: readText(formData, "event_date"),
    location_text: readText(formData, "location_text"),
    quantity: readText(formData, "quantity"),
    image_url: readText(formData, "image_url"),
    pickup_rules: readText(formData, "pickup_rules"),
    organizer_account: readText(formData, "organizer_account"),
    description: readText(formData, "description"),
  };

  const errors: CreateEventFormState["errors"] = {};

  if (!values.title) {
    errors.title = "請填寫活動名稱。";
  }

  if (!values.idol) {
    errors.idol = "請填寫藝人或團體名稱。";
  }

  if (!values.event_date) {
    errors.event_date = "請選擇活動日期。";
  }

  if (!values.location_text) {
    errors.location_text = "請填寫活動地點。";
  }

  if (!values.pickup_rules) {
    errors.pickup_rules = "請填寫領取規則。";
  }

  if (!values.organizer_account) {
    errors.organizer_account = "請填寫發放者帳號。";
  }

  const parsedQuantity = Number(values.quantity);
  if (!values.quantity) {
    errors.quantity = "請填寫發放數量。";
  } else if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    errors.quantity = "數量必須是大於 0 的整數。";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_event", {
    p_title: values.title,
    p_idol: values.idol,
    p_location_text: values.location_text,
    p_event_date: values.event_date,
    p_quantity: parsedQuantity,
    p_description: values.description || null,
    p_image_url: values.image_url || null,
    p_pickup_rules: values.pickup_rules,
    p_organizer_account: values.organizer_account,
  });

  if (error || !data) {
    return {
      errors: {
        form: "建立活動失敗。若你剛補上新 migration，請先同步到 Supabase 後再試一次。",
      },
      values,
    };
  }

  revalidatePath("/");
  revalidatePath("/my/events");
  revalidatePath("/my/follows");
  redirect(`/events/${data.id}`);
}
