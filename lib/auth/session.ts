import { cookies } from "next/headers";

import { AUTH_MIDDLEWARE_ENABLED, AUTH_SESSION_COOKIE } from "@/lib/auth/config";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR";
};

const previewUser: SessionUser = {
  id: "preview-operator",
  name: "Marketing Ops",
  email: "ops@runnerscircle.local",
  role: "ADMIN"
};

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!AUTH_MIDDLEWARE_ENABLED && !sessionToken) {
    return previewUser;
  }

  if (!sessionToken) {
    return null;
  }

  return {
    ...previewUser,
    id: sessionToken
  };
}

export async function assertAuthenticated() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
