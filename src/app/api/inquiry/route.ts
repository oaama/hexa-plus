import { NextResponse } from "next/server";
import { hasAllowedOrigin } from "@/lib/request-origin";
import { inquirySchema } from "@/lib/validation";
import { supabase, configured } from "@/lib/supabase/server";
export async function POST(request: Request) {
  try {
    if (!hasAllowedOrigin(request))
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    if (Number(request.headers.get("content-length") || 0) > 30000)
      return NextResponse.json({ error: "Message too long." }, { status: 413 });
    if (!configured())
      return NextResponse.json(
        {
          error:
            "The inquiry form is not connected yet. Please try again later.",
        },
        { status: 503 },
      );
    const body = await request.text();
    if (body.length > 30000)
      return NextResponse.json({ error: "Message too long." }, { status: 413 });
    const parsed = inquirySchema.safeParse(JSON.parse(body));
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const db = await supabase();
    const { error } = await db.rpc("submit_inquiry", { payload: parsed.data });
    if (error)
      return NextResponse.json(
        {
          error: error.message.includes("wait")
            ? "Please wait before sending another inquiry."
            : "We could not save your inquiry. Please try again later.",
        },
        { status: 400 },
      );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Please check your message and try again." },
      { status: 400 },
    );
  }
}
