"use client";

import { useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function resolveNext(pathname: string, searchParams: URLSearchParams) {
  const nextFromQuery = searchParams.get("next");

  if (nextFromQuery && nextFromQuery.startsWith("/")) {
    return nextFromQuery;
  }

  return pathname === "/auth/login" ? "/" : pathname;
}

export function LoginButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="button-primary"
      onClick={() => {
        startTransition(async () => {
          const supabase = createClient();
          const next = resolveNext(pathname, searchParams);

          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
          });
        });
      }}
      disabled={isPending}
      style={{ minWidth: "14rem", justifyContent: "center" }}
    >
      {isPending ? "正在導向 Google..." : "使用 Google 登入"}
    </button>
  );
}
