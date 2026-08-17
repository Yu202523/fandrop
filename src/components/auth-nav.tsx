import Link from "next/link";

import { signOut } from "@/app/auth/login/actions";
import { getCurrentUser } from "@/lib/auth";

export async function AuthNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/auth/login" className="button-primary auth-nav-button">
        登入
      </Link>
    );
  }

  return (
    <div className="auth-nav">
      <div className="auth-nav-user">
        <p className="auth-nav-name">{user.user_metadata?.name ?? "使用者"}</p>
        <p className="auth-nav-email">{user.email}</p>
      </div>
      <form action={signOut}>
        <button type="submit" className="button-secondary auth-nav-button">
          登出
        </button>
      </form>
    </div>
  );
}
