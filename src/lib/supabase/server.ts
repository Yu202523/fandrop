import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr/src/types";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In Server Components, Next.js does not allow mutating cookies.
          // Session refresh is handled by proxy.ts before the request reaches the page.
        }
      },
    },
  });
}
