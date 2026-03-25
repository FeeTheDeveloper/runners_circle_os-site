import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AUTH_MIDDLEWARE_ENABLED,
  AUTH_SESSION_COOKIE,
  isPublicRoute
} from "@/lib/auth/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!AUTH_MIDDLEWARE_ENABLED || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(AUTH_SESSION_COOKIE)?.value;

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
