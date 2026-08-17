"use client";

import { useFormStatus } from "react-dom";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="button-danger"
      disabled={pending}
      style={{ minHeight: "2.6rem" }}
    >
      {pending ? "刪除中..." : "刪除活動"}
    </button>
  );
}

export function DeleteEventForm({
  action,
  eventId,
  returnPath,
  title,
  compact,
}: {
  action: (formData: FormData) => void;
  eventId: string;
  returnPath: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const ok = window.confirm(`確定要刪除「${title}」嗎？這個動作不能復原。`);
        if (!ok) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="return_path" value={returnPath} />
      <div className={compact ? "button-danger button-danger-compact" : undefined}>
        <DeleteButton />
      </div>
    </form>
  );
}
