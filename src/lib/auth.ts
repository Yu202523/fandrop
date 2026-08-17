import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getOrganizerAllowedEmails() {
  const rawValue = process.env.ORGANIZER_ALLOWED_EMAILS ?? "";

  return rawValue
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(nextPath?: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/auth/login${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/auth/login${next}`);
  }

  return user;
}

export function isOrganizerUserEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getOrganizerAllowedEmails().includes(normalizeEmail(email));
}

export async function isCurrentUserOrganizer() {
  const user = await getCurrentUser();
  return isOrganizerUserEmail(user?.email);
}

export async function requireOrganizerUser(nextPath?: string) {
  const user = await requireUser(nextPath);

  if (!isOrganizerUserEmail(user.email)) {
    notFound();
  }

  return user;
}
