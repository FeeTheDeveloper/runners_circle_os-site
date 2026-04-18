import "server-only";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "OPERATOR" | "EDITOR" | "ANALYST";
};

function resolveUserRole(user: User): SessionUser["role"] {
  const candidate = user.app_metadata?.role ?? user.user_metadata?.role;

  if (candidate === "ADMIN" || candidate === "OPERATOR" || candidate === "EDITOR" || candidate === "ANALYST") {
    return candidate;
  }

  return "OPERATOR";
}

function mapSupabaseUser(user: User): SessionUser {
  return {
    id: user.id,
    name:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null,
    email: user.email ?? "",
    role: resolveUserRole(user)
  };
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return mapSupabaseUser(user);
}

export async function getCurrentUser() {
  return getUser();
}

export async function assertAuthenticated() {
  const user = await getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
