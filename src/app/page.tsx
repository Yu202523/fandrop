import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { getEvents } from "@/lib/events";
import { formatRelativeTime } from "@/lib/time";

export const dynamic = "force-dynamic";

function formatEventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function EventThumbnail({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={`${title} 活動縮圖`} className="event-list-thumb" />
    );
  }

  return (
    <div className="event-list-thumb event-list-thumb-placeholder" aria-hidden="true">
      <span>NO IMAGE</span>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="event-list-meta-pill">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

export default async function HomePage() {
  const events = await getEvents();

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>FanDrop 測試中</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.12 }}>
          快速找到你有興趣的應援發放活動
        </h1>
        <p style={{ maxWidth: "48rem", margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          這個列表頁的重點是讓一般使用者先快速判斷「是不是我想要的應援物」以及「資訊夠不夠新」。
          你可以直接掃讀縮圖、狀態、地點、剩餘數量與最後更新時間，再決定要不要點進詳情頁。
        </p>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        {events.length === 0 ? (
          <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.6rem" }}>
            <h2 style={{ margin: 0 }}>目前還沒有活動</h2>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              先確認 Supabase migration 已完成，接著建立第一個活動來測試列表頁與詳情頁流程。
            </p>
          </div>
        ) : (
          events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="card event-list-card">
              <EventThumbnail title={event.title} imageUrl={event.image_url} />

              <div className="event-list-body">
                <div className="event-list-header">
                  <div className="event-list-title-group">
                    <p className="event-list-kicker">{event.idol}</p>
                    <h2 className="event-list-title">{event.title}</h2>
                  </div>
                  <StatusBadge status={event.status} />
                </div>

                <div className="event-list-meta-grid">
                  <MetaPill label="發放日期" value={formatEventDate(event.event_date)} />
                  <MetaPill label="發放地點" value={event.location_text} />
                  <MetaPill
                    label="剩餘數量"
                    value={`${event.remaining_quantity} / ${event.quantity}`}
                  />
                </div>

                <div className="event-list-footer">
                  <span className="event-list-updated">
                    最後更新：{formatRelativeTime(event.last_updated_at)}
                  </span>
                  <span className="event-list-link">查看詳情</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
