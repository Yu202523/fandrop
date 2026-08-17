"use client";

import { useFormStatus } from "react-dom";

function SubmitButton({
  idleLabel,
  pendingLabel,
  secondary = false,
}: {
  idleLabel: string;
  pendingLabel: string;
  secondary?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={secondary ? "button-secondary button-compact" : "button-primary button-compact"}
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function SubscriptionForm({
  action,
  eventId,
  returnPath,
  isFollowing,
}: {
  action: (formData: FormData) => void;
  eventId: string;
  returnPath: string;
  isFollowing: boolean;
}) {
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="return_path" value={returnPath} />
      <SubmitButton
        idleLabel={isFollowing ? "已追蹤" : "追蹤活動"}
        pendingLabel={isFollowing ? "更新中..." : "追蹤中..."}
        secondary={isFollowing}
      />
    </form>
  );
}
