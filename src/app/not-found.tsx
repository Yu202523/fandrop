import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card" style={{ padding: "1.5rem" }}>
      <h1 style={{ marginTop: 0 }}>找不到這個活動</h1>
      <p style={{ color: "var(--muted)" }}>
        目前無法從資料庫載入你要查看的活動資料。
      </p>
      <Link href="/" style={{ color: "var(--accent)", fontWeight: 700 }}>
        返回活動列表
      </Link>
    </section>
  );
}
