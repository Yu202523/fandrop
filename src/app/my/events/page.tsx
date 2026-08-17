import Link from "next/link";

import { deleteEventAction } from "@/app/events/delete-actions";
import { DeleteEventForm } from "@/app/events/delete-event-form";
import { StatusBadge } from "@/components/status-badge";
import { requireOrganizerUser } from "@/lib/auth";
import { getMyEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

function formatEventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MyEventsPage() {
  const user = await requireOrganizerUser("/my/events");
  const events = await getMyEvents(user.id);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem" }}>
        <h1 style={{ marginTop: 0 }}>我的活動</h1>
        <p style={{ marginBottom: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          這裡只顯示 <strong>{user.email}</strong> 建立的活動。你可以查看對外頁面、更新活動資訊，或在需要時刪除測試資料。
        </p>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        {events.length === 0 ? (
          <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
            <div>
              <h2 style={{ marginTop: 0 }}>目前還沒有建立任何活動</h2>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                建立第一個活動後，首頁與我的追蹤頁就能讀到它，使用者也能開始查看詳情與追蹤。
              </p>
            </div>
            <Link href="/events/new" className="button-primary" style={{ justifySelf: "start" }}>
              建立活動
            </Link>
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              className="card"
              style={{ padding: "1.25rem", display: "grid", gap: "0.9rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "start",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontSize: "0.8rem",
                    }}
                  >
                    {event.idol}
                  </p>
                  <h2 style={{ margin: "0.35rem 0 0", fontSize: "1.35rem" }}>{event.title}</h2>
                </div>
                <StatusBadge status={event.status} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                <span>發放日期：{formatEventDate(event.event_date)}</span>
                <span>發放地點：{event.location_text}</span>
                <span>
                  剩餘數量：{event.remaining_quantity} / {event.quantity}
                </span>
                <span>最後更新：{new Date(event.last_updated_at).toLocaleString("zh-TW")}</span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <Link href={`/events/${event.id}`} className="button-secondary">
                  查看詳情
                </Link>
                <DeleteEventForm
                  action={deleteEventAction}
                  eventId={event.id}
                  returnPath="/my/events"
                  title={event.title}
                />
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
