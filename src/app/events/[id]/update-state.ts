export type OrganizerUpdateKind =
  | "start_giveaway"
  | "move_location"
  | "quantity_update"
  | "low_stock"
  | "end_giveaway"
  | "note";

export type EventUpdateFormState = {
  errors: Partial<
    Record<"update_kind" | "location_text" | "remaining_quantity" | "message" | "form", string>
  >;
  values: {
    event_id: string;
    current_status: string;
    update_kind: OrganizerUpdateKind;
    location_text: string;
    remaining_quantity: string;
    message: string;
  };
};

export function createInitialEventUpdateState(
  eventId: string,
  currentStatus: string,
): EventUpdateFormState {
  return {
    errors: {},
    values: {
      event_id: eventId,
      current_status: currentStatus,
      update_kind: "start_giveaway",
      location_text: "",
      remaining_quantity: "",
      message: "",
    },
  };
}
