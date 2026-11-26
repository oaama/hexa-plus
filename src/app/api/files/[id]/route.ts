import { NextResponse } from "next/server";
import { apiUser, apiError, sameOrigin } from "@/lib/api";
import { z } from "zod";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    z.uuid().parse(id);
    const { db } = await apiUser("files.read");
    const { data: f, error } = await db
      .from("files")
      .select("storage_path")
      .eq("id", id)
      .single();
    if (error || !f) throw new Error("File not found.");
    const { data, error: e } = await db.storage
      .from("business-files")
      .createSignedUrl(f.storage_path, 60);
    if (e) throw new Error(e.message);
    return NextResponse.json(
      { url: data.signedUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    const { id } = await params;
    z.uuid().parse(id);
    const { db } = await apiUser("files.write");
    const { data: f, error } = await db
      .from("files")
      .select("storage_path")
      .eq("id", id)
      .single();
    if (error || !f) throw new Error("File not found.");
    const { error: e } = await db.storage
      .from("business-files")
      .remove([f.storage_path]);
    if (e) throw new Error(e.message);
    const { error: de } = await db.from("files").delete().eq("id", id);
    if (de)
      throw new Error(
        "The stored file was removed, but its record could not be deleted. Retry deleting the record.",
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
