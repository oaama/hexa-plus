import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function GET(request: Request) {
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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await db.storage.from("portfolio").download(path);
  if (error || !data) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
