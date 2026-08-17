import type { EventStatus } from "@/lib/supabase/types";

const STATUS_LABELS: Record<EventStatus, { short: string; full: string }> = {
  draft: { short: "草稿", full: "草稿" },
  upcoming: { short: "即將開始", full: "即將開始" },
  live: { short: "發放中", full: "發放中" },
  low_stock: { short: "即將發完", full: "即將發完" },
  moved: { short: "已移動", full: "已移動" },
  ended: { short: "已結束", full: "已結束" },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const className =
    status === "live" || status === "low_stock" || status === "moved"
      ? "pill pill-live"
      : status === "ended"
        ? "pill pill-ended"
        : "pill pill-upcoming";

  const label = STATUS_LABELS[status];

  return (
    <span className={className} title={label.full} aria-label={label.full}>
      {label.short}
    </span>
  );
}
