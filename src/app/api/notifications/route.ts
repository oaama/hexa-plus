import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser, apiError, sameOrigin, readJSON } from "@/lib/api";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { db } = await apiUser();
    const { ids } = z
      .object({ ids: z.array(z.uuid()).min(1).max(100) })
      .strict()
      .parse(await readJSON(request));
    const { error } = await db.rpc("mark_notifications_read", {
      notification_ids: ids,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
