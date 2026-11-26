import { NextResponse } from "next/server";
import { supabase, configured } from "@/lib/supabase/server";
export async function GET() {
  if (!configured())
    return NextResponse.json(
      { ready: false, database: "not configured" },
      { status: 503 },
    );
  try {
    const db = await supabase();
    const { error } = await db.from("published_services").select("id").limit(1);
    return NextResponse.json({ ready: !error }, { status: error ? 503 : 200 });
  } catch {
    return NextResponse.json({ ready: false }, { status: 503 });
  }
}
