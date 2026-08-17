import { redirect } from "next/navigation";

import { LoginButton } from "@/app/auth/login/login-button";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const next = params.next && params.next.startsWith("/") ? params.next : "/";

  if (user) {
    redirect(next);
  }

  return (
    <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
      <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>登入帳號</p>
      <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>登入後開始管理與追蹤活動</h1>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
        FanDrop 使用 Supabase Auth 搭配 Google OAuth。登入成功後，系統會建立 session，讓你可以建立活動、追蹤活動並查看個人頁面。
      </p>
      <LoginButton />
      <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
        Google 登入完成後，你會回到 <code>{next}</code>。
      </p>
    </section>
  );
}
