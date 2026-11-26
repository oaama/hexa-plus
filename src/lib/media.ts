export function mediaSource(url: string) {
  const base =
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "") +
    "/storage/v1/object/public/portfolio/";
  return url.startsWith(base)
    ? "/api/media?path=" + encodeURIComponent(url.slice(base.length))
    : url;
}
