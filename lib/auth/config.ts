export const AUTH_SESSION_COOKIE = "rc_session";

export const AUTH_MIDDLEWARE_ENABLED =
  process.env.AUTH_MIDDLEWARE_ENABLED?.toLowerCase() === "true";

const publicPrefixes = ["/sign-in", "/api/health", "/api/webhooks"];

export function isPublicRoute(pathname: string) {
  return publicPrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
