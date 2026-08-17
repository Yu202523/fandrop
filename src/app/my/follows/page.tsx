import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getFollowedEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

function formatEventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MyFollowsPage() {
  const user = await requireUser("/my/follows");
  const events = await getFollowedEvents(user.id);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem" }}>
        <h1 style={{ marginTop: 0 }}>我的追蹤清單</h1>
        <p style={{ marginBottom: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          集中查看你正在關注的活動，這裡會顯示每個已追蹤活動的最新狀態與更新時間。
        </p>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        {events.length === 0 ? (
          <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
            <div>
              <h2 style={{ marginTop: 0 }}>你目前還沒有追蹤任何活動</h2>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                前往活動詳情頁按下追蹤，就能建立自己的活動關注清單。
              </p>
            </div>
            <Link href="/" className="button-primary" style={{ justifySelf: "start" }}>
              瀏覽活動
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
                <span>日期：{formatEventDate(event.event_date)}</span>
                <span>地點：{event.location_text}</span>
                <span>
                  剩餘數量：{event.remaining_quantity} / {event.quantity}
                </span>
                <span>最後更新：{new Date(event.last_updated_at).toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href={`/events/${event.id}`} className="button-secondary">
                  查看詳情
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
