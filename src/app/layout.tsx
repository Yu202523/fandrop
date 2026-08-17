import type { Metadata } from "next";
import Link from "next/link";

import { AuthNav } from "@/components/auth-nav";
import { isCurrentUserOrganizer } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "FanDrop",
  description: "追蹤應援活動、查看最新發放資訊的平台。",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isOrganizer = await isCurrentUserOrganizer();

  return (
    <html lang="zh-Hant">
      <body>
        <header className="shell" style={{ paddingTop: "1.5rem" }}>
          <div className="card header-card">
            <div className="header-top-row">
              <Link href="/" className="header-brand">
                FanDrop
              </Link>
            </div>

            <div className="header-nav-wrap">
              <nav className="header-nav" aria-label="主要導覽">
                <Link href="/" className="header-nav-link">
                  活動列表
                </Link>
                {isOrganizer ? (
                  <Link href="/events/new" className="header-nav-link">
                    建立活動
                  </Link>
                ) : null}
                {isOrganizer ? (
                  <Link href="/my/events" className="header-nav-link">
                    我的活動
                  </Link>
                ) : null}
                <Link href="/my/follows" className="header-nav-link">
                  我的追蹤
                </Link>
              </nav>
            </div>

            <div className="header-auth-row">
              <AuthNav />
            </div>
          </div>
        </header>
        <main className="shell" style={{ padding: "2rem 0 3rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
