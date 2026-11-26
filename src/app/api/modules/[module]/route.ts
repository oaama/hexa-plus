import { NextResponse } from "next/server";
import { modules, tableLabel } from "@/lib/modules";
import { moduleSchema } from "@/lib/validation";
import { invoiceLine } from "@/lib/finance";
import { apiUser, apiError, sameOrigin, readJSON } from "@/lib/api";
import { z } from "zod";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const { module: key } = await params;
    const m = modules[key];
    if (!m) throw new Error("Unknown module.");
    const { db } = await apiUser(m.permission + ".read");
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const size = 25;
    const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
    const sort = url.searchParams.get("sort") || "created_at";
    const validSort = ["created_at", ...m.fields.map((f) => f.key)].includes(
      sort,
    )
      ? sort
      : "created_at";
    let query = db
      .from(m.table)
      .select("*", { count: "exact" })
      .order(validSort, {
        ascending: url.searchParams.get("asc") === "true",
        nullsFirst: false,
      });
    const field =
      m.fields.find(
        (f) =>
          f.key === "name" ||
          f.key === "title" ||
          f.key === "invoice_number" ||
          f.key === "key",
      ) || m.fields.find((f) => f.type === "text");
    if (q && field)
      query = query.ilike(
        field.key,
        "%" +
          q
            .replaceAll("%", "")
            .replaceAll("_", "")
            .replaceAll(String.fromCharCode(92), "") +
          "%",
      );
    const status = m.fields.find((f) => f.key === (m.statusKey || "status"));
    const filter = url.searchParams.get("status");
    if (filter && status?.options?.includes(filter))
      query = query.eq(status.key, filter);
    if (url.searchParams.get("mine") === "1") {
      const {
        data: { user },
      } = await db.auth.getUser();
      query = query.eq("assigned_to", user!.id);
    }
    if (url.searchParams.get("overdue") === "1")
      query = query
        .lt("deadline", new Date().toISOString().slice(0, 10))
        .neq("status", "completed");
    const { data, error, count } = await query.range(
      (page - 1) * size,
      page * size - 1,
    );
    if (error) throw new Error(error.message);
    let rows = data || [];
    if (key === "invoices" && rows.length) {
      const { data: payments, error: pe } = await db
        .from("payments")
        .select("invoice_id,amount_minor")
        .in(
          "invoice_id",
          rows.map((r) => r.id),
        );
      if (pe) throw new Error(pe.message);
      rows = rows.map((r) => {
        const paid = (payments || [])
          .filter((p) => p.invoice_id === r.id)
          .reduce((a, p) => a + Number(p.amount_minor), 0);
        return {
          ...r,
          paid_minor: paid,
          status:
            paid >= r.total_minor
              ? "paid"
              : paid > 0
                ? "partially_paid"
                : r.due_date < new Date().toISOString().slice(0, 10)
                  ? "overdue"
                  : "unpaid",
        };
      });
    }
    return NextResponse.json({ rows, count: count || 0, page, size });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    sameOrigin(request);
    const { module: key } = await params;
    const m = modules[key];
    if (!m || m.readOnly || m.noCreate || key === "files")
      throw new Error("This module uses a dedicated creation flow.");
    const { db } = await apiUser(m.permission + ".write");
    const body = await readJSON(request);
    if (m.invoice) {
      const { items, ...header } = body;
      const h = moduleSchema(m).parse(header);
      const lines = z.array(invoiceLine).min(1).max(100).parse(items);
      const { data, error } = await db.rpc("save_invoice", {
        record_id: null,
        header: h,
        items: lines,
      });
      if (error) throw new Error(error.message);
      return NextResponse.json({ id: data }, { status: 201 });
    }
    const values = moduleSchema(m).parse(body);
    const { data, error } = await db
      .from(m.table)
      .insert(values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
