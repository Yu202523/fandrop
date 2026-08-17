import { notFound } from "next/navigation";

import { deleteEventAction } from "@/app/events/delete-actions";
import { DeleteEventForm } from "@/app/events/delete-event-form";
import { EventRealtimeSubscriber } from "@/app/events/[id]/event-realtime-subscriber";
import { OrganizerUpdatePanel } from "@/app/events/[id]/organizer-update-panel";
import {
  subscribeToEvent,
  unsubscribeFromEvent,
} from "@/app/events/[id]/subscription-actions";
import { SubscriptionForm } from "@/app/events/[id]/subscription-form";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser, isOrganizerUserEmail } from "@/lib/auth";
import { UPDATE_TYPE_LABELS } from "@/lib/event-update-labels";
import { getEventDetail, getEventSubscription } from "@/lib/events";
import { formatRelativeTime } from "@/lib/time";

export const dynamic = "force-dynamic";

function formatEventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
}

function EventHeroImage({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={`${title} 活動圖片`} className="event-hero-image" />
    );
  }

  return (
    <div className="event-hero-image event-hero-image-placeholder" aria-hidden="true">
      <span>NO IMAGE</span>
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, currentUser] = await Promise.all([getEventDetail(id), getCurrentUser()]);

  if (!detail) {
    notFound();
  }

  const { event, updates } = detail;
  const isOwner = currentUser?.id === event.created_by;
  const isAdmin = isOrganizerUserEmail(currentUser?.email);
  const subscription =
    currentUser && !isOwner ? await getEventSubscription(event.id, currentUser.id) : null;
  const organizerLink = event.organizer_account
    ? normalizeExternalUrl(event.organizer_account)
    : null;

  return (
    <div className="page-stack">
      <EventRealtimeSubscriber eventId={event.id} />
      <section className="card event-hero">
        <div className="event-header">
          <div className="event-title-block">
            <p className="event-kicker">{event.idol}</p>
            <h1 className="event-title">{event.title}</h1>
          </div>
          <div className="event-actions">
            <StatusBadge status={event.status} />
            {!isOwner && currentUser ? (
              <SubscriptionForm
                action={subscription ? unsubscribeFromEvent : subscribeToEvent}
                eventId={event.id}
                returnPath={`/events/${event.id}`}
                isFollowing={Boolean(subscription)}
              />
            ) : null}
          </div>
        </div>

        {!isOwner && !currentUser ? (
          <p className="supporting-text" style={{ margin: 0 }}>
            登入後可以追蹤這個活動，之後若地點、數量或狀態更新，你就能更快回來查看。
          </p>
        ) : null}

        {!isOwner && currentUser ? (
          <p className="supporting-text" style={{ margin: 0 }}>
            {subscription
              ? "你目前已追蹤這個活動，之後可以在「我的追蹤」快速查看。"
              : "如果你對這份應援物有興趣，可以先追蹤活動，之後再回來看最新資訊。"}
          </p>
        ) : null}

        <EventHeroImage title={event.title} imageUrl={event.image_url} />

        <div className="meta-card">
          <strong>領取規則</strong>
          <span className="event-description">
            {event.pickup_rules ?? "目前尚未提供領取規則。"}
          </span>
        </div>

        <div className="event-meta-grid">
          <div className="meta-card">
            <strong>發放日期</strong>
            <span>{formatEventDate(event.event_date)}</span>
          </div>
          <div className="meta-card">
            <strong>發放地點</strong>
            <span>{event.location_text}</span>
          </div>
          <div className="meta-card">
            <strong>剩餘數量</strong>
            <span>
              {event.remaining_quantity} / {event.quantity}
            </span>
          </div>
          <div className="meta-card">
            <strong>最後更新</strong>
            <span>{formatRelativeTime(event.last_updated_at)}</span>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <h2 style={{ marginTop: 0 }}>活動補充資訊</h2>
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
          {event.organizer_account ? (
            <div className="meta-card">
              <strong>發放者帳號</strong>
              {organizerLink ? (
                <a
                  href={organizerLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--accent)",
                    textDecoration: "underline",
                    textUnderlineOffset: "0.18em",
                    overflowWrap: "anywhere",
                  }}
                >
                  {event.organizer_account}
                </a>
              ) : (
                <span style={{ overflowWrap: "anywhere" }}>{event.organizer_account}</span>
              )}
            </div>
          ) : null}

          {event.description ? (
            <div className="meta-card">
              <strong>補充說明</strong>
              <span style={{ lineHeight: 1.7 }}>{event.description}</span>
            </div>
          ) : null}
        </div>
      </section>

      {isOwner ? <OrganizerUpdatePanel eventId={event.id} currentStatus={event.status} /> : null}

      {isAdmin && isOwner ? (
        <section className="card section-card" style={{ display: "grid", gap: "0.85rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>管理員操作</h2>
            <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
              這個按鈕只會顯示給管理員帳號。刪除後活動、追蹤資料與更新紀錄都會一起移除，且無法復原。
            </p>
          </div>
          <DeleteEventForm
            action={deleteEventAction}
            eventId={event.id}
            returnPath="/my/events"
            title={event.title}
          />
        </section>
      ) : null}

      <section className="card section-card">
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>更新紀錄</h2>
        {updates.length === 0 ? (
          <p className="supporting-text" style={{ marginBottom: 0 }}>
            目前還沒有新的更新紀錄。
          </p>
        ) : (
          <div className="timeline-list">
            {updates.map((update) => (
              <article key={update.id} className="timeline-item">
                <div className="timeline-header">
                  <strong>
                    {UPDATE_TYPE_LABELS[update.type as keyof typeof UPDATE_TYPE_LABELS] ?? update.type}
                  </strong>
                  <StatusBadge status={update.status} />
                </div>
                <p className="timeline-time">
                  {new Date(update.created_at).toLocaleString("zh-TW")}
                </p>
                <p className="timeline-message">{update.message ?? "主辦方沒有留下補充文字。"}</p>
                <p className="timeline-meta">
                  地點：{update.location_text ?? event.location_text}
                  <span>數量：{update.remaining_quantity ?? event.remaining_quantity}</span>
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
