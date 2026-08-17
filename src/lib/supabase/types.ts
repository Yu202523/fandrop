export type EventStatus = "draft" | "upcoming" | "live" | "low_stock" | "moved" | "ended";

export type EventRow = {
  id: string;
  title: string;
  idol: string;
  description: string | null;
  image_url: string | null;
  pickup_rules: string | null;
  organizer_account: string | null;
  location_text: string;
  event_date: string;
  status: EventStatus;
  quantity: number;
  remaining_quantity: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_updated_at: string;
  ended_at: string | null;
};

export type EventUpdateRow = {
  id: string;
  event_id: string;
  type: string;
  status: EventStatus;
  message: string | null;
  location_text: string | null;
  remaining_quantity: number | null;
  created_by: string;
  created_at: string;
};

export type EventSubscriptionRow = {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
};
