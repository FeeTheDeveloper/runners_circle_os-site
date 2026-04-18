import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/config";

const publicPrefixes = ["/sign-in", "/sign-up", "/api/health", "/api/public", "/api/webhooks"];

function isPublicRoute(pathname: string) {
  return publicPrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const signInUrl = request.nextUrl.clone();

    signInUrl.pathname = "/sign-in";

    if (request.nextUrl.pathname !== "/") {
      signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    }

    return NextResponse.redirect(signInUrl);
  }

  if (user && ["/sign-in", "/sign-up"].includes(request.nextUrl.pathname)) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const dashboardUrl = request.nextUrl.clone();

    dashboardUrl.pathname = redirectTo?.startsWith("/") ? redirectTo : "/dashboard";
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
