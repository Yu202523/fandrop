"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { createEventUpdateAction } from "@/app/events/[id]/update-actions";
import {
  createInitialEventUpdateState,
  type EventUpdateFormState,
  type OrganizerUpdateKind,
} from "@/app/events/[id]/update-state";
import type { EventStatus } from "@/lib/supabase/types";

type FieldMode = "hidden" | "optional" | "required";

type UpdateActionConfig = {
  kind: OrganizerUpdateKind;
  label: string;
  description: string;
  locationMode: FieldMode;
  quantityMode: FieldMode;
  messageMode: FieldMode;
  submitLabel: string;
};

const UPDATE_ACTIONS: UpdateActionConfig[] = [
  {
    kind: "start_giveaway",
    label: "開始發放",
    description: "活動正式開始時使用，可視需要同步補充目前地點或剩餘數量。",
    locationMode: "optional",
    quantityMode: "optional",
    messageMode: "optional",
    submitLabel: "送出開始發放",
  },
  {
    kind: "move_location",
    label: "更新地點",
    description: "主辦位置有變動時使用，讓追蹤者能快速找到你目前所在位置。",
    locationMode: "required",
    quantityMode: "optional",
    messageMode: "optional",
    submitLabel: "送出地點更新",
  },
  {
    kind: "quantity_update",
    label: "更新數量",
    description: "剩餘數量有變化時使用，讓活動頁維持最新狀態。",
    locationMode: "optional",
    quantityMode: "required",
    messageMode: "optional",
    submitLabel: "送出數量更新",
  },
  {
    kind: "low_stock",
    label: "數量告急",
    description: "剩餘數量不多時提醒追蹤者，方便他們決定是否前往。",
    locationMode: "optional",
    quantityMode: "optional",
    messageMode: "optional",
    submitLabel: "送出數量告急",
  },
  {
    kind: "end_giveaway",
    label: "結束發放",
    description: "活動已經結束時使用，系統會把狀態切換為已結束。",
    locationMode: "hidden",
    quantityMode: "hidden",
    messageMode: "optional",
    submitLabel: "送出結束發放",
  },
  {
    kind: "note",
    label: "補充說明",
    description: "想補充規則、集合資訊或臨時公告時使用。",
    locationMode: "optional",
    quantityMode: "optional",
    messageMode: "required",
    submitLabel: "送出補充說明",
  },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p style={{ margin: "0.45rem 0 0", color: "#932c1f", fontSize: "0.92rem", fontWeight: 700 }}>
      {message}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "送出中..." : label}
    </button>
  );
}

function ActionButton({
  action,
  isSelected,
  onSelect,
}: {
  action: UpdateActionConfig;
  isSelected: boolean;
  onSelect: (kind: OrganizerUpdateKind) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(action.kind)}
      aria-pressed={isSelected}
      style={{
        textAlign: "left",
        padding: "1rem",
        borderRadius: "18px",
        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
        background: isSelected ? "color-mix(in srgb, var(--accent) 12%, white)" : "white",
        display: "grid",
        gap: "0.35rem",
        cursor: "pointer",
      }}
    >
      <strong>{action.label}</strong>
      <span style={{ color: "var(--muted)", lineHeight: 1.5 }}>{action.description}</span>
    </button>
  );
}

export function OrganizerUpdatePanel({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: EventStatus;
}) {
  const initialState = useMemo(
    () => createInitialEventUpdateState(eventId, currentStatus),
    [eventId, currentStatus],
  );
  const [state, formAction] = useActionState(createEventUpdateAction, initialState);

  const safeState: EventUpdateFormState = {
    errors: state?.errors ?? {},
    values: {
      ...initialState.values,
      ...(state?.values ?? {}),
    },
  };

  const [selectedKind, setSelectedKind] = useState<OrganizerUpdateKind>(safeState.values.update_kind);

  const selectedAction =
    UPDATE_ACTIONS.find((action) => action.kind === selectedKind) ?? UPDATE_ACTIONS[0];

  return (
    <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>發布活動更新</h2>
        <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
          選擇最符合目前情況的更新類型。送出後，活動頁的狀態與時間線都會同步更新。
        </p>
      </div>

      <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
        <input type="hidden" name="event_id" value={safeState.values.event_id} />
        <input type="hidden" name="current_status" value={safeState.values.current_status} />
        <input type="hidden" name="update_kind" value={selectedKind} />

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <span style={{ fontWeight: 700 }}>選擇更新類型</span>
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {UPDATE_ACTIONS.map((action) => (
              <ActionButton
                key={action.kind}
                action={action}
                isSelected={action.kind === selectedKind}
                onSelect={setSelectedKind}
              />
            ))}
          </div>
          <FieldError message={safeState.errors.update_kind} />
        </div>

        {(selectedAction.locationMode !== "hidden" || selectedAction.quantityMode !== "hidden") && (
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {selectedAction.locationMode !== "hidden" ? (
              <label style={{ display: "grid", gap: "0.45rem" }}>
                <span style={{ fontWeight: 700 }}>
                  最新地點
                  {selectedAction.locationMode === "required" ? " *" : ""}
                </span>
                <input
                  name="location_text"
                  defaultValue={safeState.values.location_text}
                  placeholder="例如：南廣場靠近 2 號出口"
                  className="form-input"
                />
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                  {selectedAction.locationMode === "required"
                    ? "這次更新必須填寫最新地點。"
                    : "如果地點沒有改變，可以留白。"}
                </p>
                <FieldError message={safeState.errors.location_text} />
              </label>
            ) : null}

            {selectedAction.quantityMode !== "hidden" ? (
              <label style={{ display: "grid", gap: "0.45rem" }}>
                <span style={{ fontWeight: 700 }}>
                  剩餘數量
                  {selectedAction.quantityMode === "required" ? " *" : ""}
                </span>
                <input
                  name="remaining_quantity"
                  type="number"
                  min="0"
                  defaultValue={safeState.values.remaining_quantity}
                  placeholder="例如：20"
                  className="form-input"
                />
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                  {selectedAction.quantityMode === "required"
                    ? "這次更新必須填寫剩餘數量。"
                    : "如果數量沒有變動，可以留白。"}
                </p>
                <FieldError message={safeState.errors.remaining_quantity} />
              </label>
            ) : null}
          </div>
        )}

        {selectedAction.messageMode !== "hidden" ? (
          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontWeight: 700 }}>
              補充說明
              {selectedAction.messageMode === "required" ? " *" : ""}
            </span>
            <textarea
              name="message"
              defaultValue={safeState.values.message}
              placeholder="例如：改到側門旁邊，請看到手幅後再排隊。"
              className="form-input"
              rows={4}
              style={{ resize: "vertical" }}
            />
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
              {selectedAction.messageMode === "required"
                ? "這次更新需要輸入補充說明。"
                : "可選填，讓追蹤者更清楚現場情況。"}
            </p>
            <FieldError message={safeState.errors.message} />
          </label>
        ) : null}

        {safeState.errors.form ? (
          <div
            style={{
              border: "1px solid #d9a59b",
              background: "#fbe8e3",
              borderRadius: "18px",
              padding: "0.85rem 1rem",
              color: "#7a2217",
              fontWeight: 700,
            }}
          >
            {safeState.errors.form}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            送出後會同步更新活動目前狀態，並新增一筆時間線紀錄，讓追蹤者看到最新資訊。
          </p>
          <SubmitButton label={selectedAction.submitLabel} />
        </div>
      </form>
    </section>
  );
}
