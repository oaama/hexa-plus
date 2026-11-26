import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800";
export async function GET(request: Request) {
  const edgeCache: Cache | undefined = (
    globalThis as unknown as { caches?: { default?: Cache } }
  ).caches?.default;
  if (edgeCache) {
    const hit = await edgeCache.match(request.url);
    if (hit) return new NextResponse(hit.body, { status: 200, headers: hit.headers });
  }
  const path = new URL(request.url).searchParams.get("path") || "";
  if (
    !/^[a-zA-Z0-9_%-]+(?:\/[a-zA-Z0-9_.%-]+)*\.(jpg|jpeg|png|webp)$/.test(
      path,
    ) ||
    path.includes("..")
  )
    return new NextResponse("Not found", { status: 404 });
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVER_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await db.storage.from("portfolio").download(path);
  if (error || !data) return new NextResponse("Not found", { status: 404 });
  const bytes = await data.arrayBuffer();
  const response = new NextResponse(bytes, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": CACHE_CONTROL,
    },
  });
  if (edgeCache) {
    try {
      await edgeCache.put(request.url, response.clone());
    } catch {
      // cache put is best-effort
    }
  }
  return response;
}
