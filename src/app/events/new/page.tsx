import Link from "next/link";

import { CreateEventForm } from "@/app/events/new/create-event-form";
import { requireOrganizerUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await requireOrganizerUser("/events/new");

  return (
    <div className="page-stack">
      <section className="card section-card" style={{ display: "grid", gap: "0.9rem" }}>
        <div>
          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.78rem",
            }}
          >
            Organizer
          </p>
          <h1 style={{ margin: "0.4rem 0 0" }}>建立活動</h1>
        </div>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          目前以測試期主辦帳號 <strong>{user.email}</strong> 建立活動。這裡填的是給一般使用者看的活動資訊，重點是讓列表頁好掃讀、詳情頁好判斷。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/my/events" className="button-secondary button-compact">
            查看我的活動
          </Link>
          <Link href="/" className="button-secondary button-compact">
            返回活動列表
          </Link>
        </div>
      </section>

      <section className="card section-card">
        <CreateEventForm />
      </section>
    </div>
  );
}
