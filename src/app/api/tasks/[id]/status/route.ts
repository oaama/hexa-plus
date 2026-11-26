import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser, apiError, sameOrigin, readJSON } from "@/lib/api";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    const { id } = await params;
    z.uuid().parse(id);
    const { status } = z
      .object({
        status: z.enum(["to_do", "in_progress", "in_review", "completed"]),
      })
      .strict()
      .parse(await readJSON(request));
    const { db } = await apiUser();
    const { error } = await db.rpc("set_task_status", {
      task: id,
      next_status: status,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
