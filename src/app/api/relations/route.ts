import { NextResponse } from "next/server";
import { apiUser, apiError } from "@/lib/api";
import { tableLabel, modules } from "@/lib/modules";
export async function GET(request: Request) {
  try {
    const { db } = await apiUser();
    const table = new URL(request.url).searchParams.get("table") || "";
    if (
      !Object.values(modules).some((m) => m.table === table) &&
      table !== "permissions"
    )
      throw new Error("Unknown relation.");
    const label =
      table === "invoices"
        ? "invoice_number"
        : table === "tasks" ||
            table === "portfolio_projects" ||
            table === "content_posts"
          ? "title"
          : table === "website_settings"
            ? "key"
            : "name";
    const { data, error } = await db
      .from(table)
      .select("id," + label)
      .order(label)
      .limit(500);
    if (error) throw new Error(error.message);
    return NextResponse.json({
      rows: (data || []).map((r) => ({
        id: (r as unknown as Record<string, unknown>).id,
        label: tableLabel(r as unknown as Record<string, unknown>),
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}
