import { NextResponse } from "next/server";
import { modules } from "@/lib/modules";
import { moduleSchema } from "@/lib/validation";
import { invoiceLine } from "@/lib/finance";
import { apiUser, apiError, sameOrigin, readJSON } from "@/lib/api";
import { z } from "zod";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> },
) {
  try {
    const { module: key, id } = await params;
    z.uuid().parse(id);
    const m = modules[key];
    if (!m) throw new Error("Unknown module.");
    const { db } = await apiUser(m.permission + ".read");
    const { data, error } = await db
      .from(m.table)
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error("Record not found or not accessible.");
    if (m.invoice) {
      const { data: items, error: ie } = await db
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id)
        .order("sort_order");
      if (ie) throw new Error(ie.message);
      return NextResponse.json({ ...data, items });
    }
    return NextResponse.json(data);
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> },
) {
  try {
    sameOrigin(request);
    const { module: key, id } = await params;
    z.uuid().parse(id);
    const m = modules[key];
    if (!m || m.readOnly) throw new Error("This record cannot be edited here.");
    const { db } = await apiUser(m.permission + ".write");
    const body = await readJSON(request);
    if (m.invoice) {
      const { items, ...header } = body;
      const h = moduleSchema(m).parse(header);
      const lines = z.array(invoiceLine).min(1).max(100).parse(items);
      const { error } = await db.rpc("save_invoice", {
        record_id: id,
        header: h,
        items: lines,
      });
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }
    const values = moduleSchema(m).partial().parse(body);
    const { data, error } = await db
      .from(m.table)
      .update(values)
      .eq("id", id)
      .select("id")
      .single();
    if (error || !data)
      throw new Error(error?.message || "Record not found or not accessible.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> },
) {
  try {
    sameOrigin(request);
    const { module: key, id } = await params;
    z.uuid().parse(id);
    const m = modules[key];
    if (!m || m.readOnly || key === "team" || key === "files")
      throw new Error("This record cannot be deleted here.");
    const { db } = await apiUser(m.permission + ".write");
    const { data, error } = await db
      .from(m.table)
      .delete()
      .eq("id", id)
      .select("id")
      .single();
    if (error || !data)
      throw new Error(
        error?.code === "23503"
          ? "This record is used elsewhere. Remove its related records first."
          : error?.message || "Record not found or not accessible.",
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
