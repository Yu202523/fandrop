export type CreateEventFormState = {
  errors: Partial<
    Record<
      | "title"
      | "idol"
      | "event_date"
      | "location_text"
      | "quantity"
      | "pickup_rules"
      | "organizer_account"
      | "form",
      string
    >
  >;
  values: {
    title: string;
    idol: string;
    event_date: string;
    location_text: string;
    quantity: string;
    image_url: string;
    pickup_rules: string;
    organizer_account: string;
    description: string;
  };
};

export function createInitialCreateEventState(): CreateEventFormState {
  return {
    errors: {},
    values: {
      title: "",
      idol: "",
      event_date: "",
      location_text: "",
      quantity: "",
      image_url: "",
      pickup_rules: "",
      organizer_account: "",
      description: "",
    },
  };
}
