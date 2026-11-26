// Trust the configured public origin, not the internal URL of a reverse-proxied request.
// Missing Origin is allowed for non-browser callers; database policies still apply.
export function hasAllowedOrigin(
  request: Request,
  siteURL = process.env.NEXT_PUBLIC_SITE_URL,
): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expected = new URL(siteURL || request.url);
    return new URL(origin).origin === expected.origin;
  } catch {
    return false;
  }
}
