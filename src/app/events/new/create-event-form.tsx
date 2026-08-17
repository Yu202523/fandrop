"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createEventAction } from "@/app/events/new/actions";
import {
  createInitialCreateEventState,
  type CreateEventFormState,
} from "@/app/events/new/state";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p style={{ margin: "0.4rem 0 0", color: "#932c1f", fontSize: "0.92rem", fontWeight: 700 }}>
      {message}
    </p>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "建立中..." : "建立活動"}
    </button>
  );
}

function FormField({
  label,
  name,
  required,
  description,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} style={{ display: "grid", gap: "0.45rem" }}>
      <span style={{ fontWeight: 700 }}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {description ? (
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
          {description}
        </p>
      ) : null}
      <FieldError message={error} />
    </label>
  );
}

export function CreateEventForm() {
  const initialState = createInitialCreateEventState();
  const [state, formAction] = useActionState(createEventAction, initialState);

  const safeState: CreateEventFormState = {
    errors: state?.errors ?? {},
    values: {
      ...initialState.values,
      ...(state?.values ?? {}),
    },
  };

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <FormField
          name="title"
          label="活動名稱"
          required
          error={safeState.errors.title}
          description="使用者在列表頁第一眼會看到的名稱。"
        >
          <input
            id="title"
            name="title"
            defaultValue={safeState.values.title}
            className="form-input"
            placeholder="例如：7/20 台北捷運口應援發放"
          />
        </FormField>

        <FormField
          name="idol"
          label="藝人 / 團體"
          required
          error={safeState.errors.idol}
          description="方便列表頁快速辨識是不是目標應援物。"
        >
          <input
            id="idol"
            name="idol"
            defaultValue={safeState.values.idol}
            className="form-input"
            placeholder="例如：IVE、SEVENTEEN"
          />
        </FormField>
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <FormField name="event_date" label="活動日期" required error={safeState.errors.event_date}>
          <input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={safeState.values.event_date}
            className="form-input"
          />
        </FormField>

        <FormField
          name="quantity"
          label="發放數量"
          required
          error={safeState.errors.quantity}
          description="建立後會先把剩餘數量設成相同數字。"
        >
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue={safeState.values.quantity}
            className="form-input"
            placeholder="例如：50"
          />
        </FormField>
      </div>

      <FormField
        name="location_text"
        label="活動地點"
        required
        error={safeState.errors.location_text}
        description="盡量寫到一般使用者能直接找到的位置。"
      >
        <input
          id="location_text"
          name="location_text"
          defaultValue={safeState.values.location_text}
          className="form-input"
          placeholder="例如：台北小巨蛋 3 號出口旁"
        />
      </FormField>

      <FormField
        name="image_url"
        label="圖片網址"
        description="列表頁會用這張圖當縮圖；如果先沒有，也可以之後補。"
      >
        <input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={safeState.values.image_url}
          className="form-input"
          placeholder="https://..."
        />
      </FormField>

      <FormField
        name="pickup_rules"
        label="領取規則"
        required
        error={safeState.errors.pickup_rules}
        description="這是使用者進詳情頁最想確認的資訊之一。"
      >
        <textarea
          id="pickup_rules"
          name="pickup_rules"
          defaultValue={safeState.values.pickup_rules}
          className="form-input"
          rows={5}
          style={{ resize: "vertical" }}
          placeholder="例如：每人限領一份，需出示當日演唱會票根。"
        />
      </FormField>

      <FormField
        name="organizer_account"
        label="發放者帳號"
        required
        error={safeState.errors.organizer_account}
        description="可填社群帳號、連結，或使用者可聯絡你的方式。"
      >
        <input
          id="organizer_account"
          name="organizer_account"
          defaultValue={safeState.values.organizer_account}
          className="form-input"
          placeholder="@fandrop_example 或 https://..."
        />
      </FormField>

      <FormField
        name="description"
        label="補充說明"
        description="可填應援物內容、注意事項，或其他想補充的資訊。"
      >
        <textarea
          id="description"
          name="description"
          defaultValue={safeState.values.description}
          className="form-input"
          rows={5}
          style={{ resize: "vertical" }}
          placeholder="例如：會發小卡與貼紙，數量有限，可能視現場情況提前結束。"
        />
      </FormField>

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
          建立後會直接產生活動詳情頁，之後你可以再到「我的活動」更新地點、數量或補充紀錄。
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
