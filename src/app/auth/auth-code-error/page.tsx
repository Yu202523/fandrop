import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <section className="card" style={{ padding: "1.5rem" }}>
      <h1 style={{ marginTop: 0 }}>登入驗證失敗</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
        FanDrop 無法把 Google 登入回傳的驗證碼轉換成有效的 session。請檢查 Supabase 的 Google provider 設定，以及允許的 redirect URL 是否正確。
      </p>
      <Link href="/auth/login" style={{ color: "var(--accent)", fontWeight: 700 }}>
        返回登入頁
      </Link>
    </section>
  );
}
