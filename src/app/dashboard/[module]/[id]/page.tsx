import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { modules, tableLabel } from "@/lib/modules";
import { requirePermission } from "@/lib/auth";
import { RecordDetail } from "@/components/record-detail";
export default async function Detail({
  params,
}: {
  params: Promise<{ module: string; id: string }>;
}) {
  const { module: key, id } = await params;
  const m = modules[key];
  if (!m || !z.uuid().safeParse(id).success) notFound();
  const { db } = await requirePermission(m.permission + ".read");
  const { data: row, error } = await db
    .from(m.table)
    .select("*")
    .eq("id", id)
    .single();
  if (error || !row) notFound();
  const { data: canWrite } = await db.rpc("has_permission", {
    requested: m.permission + ".write",
  });
  const relations: Record<string, string> = {};
  for (const f of m.fields.filter((f) => f.relation && row[f.key])) {
    const label =
      f.relation === "invoices"
        ? "invoice_number"
        : f.relation === "tasks" || f.relation === "portfolio_projects"
          ? "title"
          : "name";
    const { data } = await db
      .from(f.relation!)
      .select("id," + label)
      .eq("id", row[f.key])
      .single();
    relations[f.key] = data
      ? tableLabel(data as unknown as Record<string, unknown>)
      : "Restricted / unavailable";
  }
  let items = [];
  if (m.invoice) {
    const { data } = await db
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sort_order");
    items = data || [];
  }
  const related: { title: string; key: string; rows: Record<string, any>[] }[] =
    [];
  const defs: Record<string, [string, string, string][]> = {
    clients: [
      ["Projects", "projects", "client_id"],
      ["Invoices", "invoices", "client_id"],
      ["Files", "files", "client_id"],
    ],
    projects: [
      ["Milestones", "milestones", "project_id"],
      ["Tasks", "tasks", "project_id"],
      ["Team", "project-members", "project_id"],
      ["Files", "files", "project_id"],
      ["Invoices", "invoices", "project_id"],
    ],
    tasks: [
      ["Comments", "comments", "task_id"],
      ["Attachments", "task-attachments", "task_id"],
    ],
    team: [
      ["Assigned tasks", "tasks", "assigned_to"],
      ["Managed projects", "projects", "manager_id"],
    ],
    leads: [["Follow-up history", "lead-activities", "lead_id"]],
    portfolio: [["Gallery images", "portfolio-media", "portfolio_project_id"]],
    invoices: [["Payments", "payments", "invoice_id"]],
  };
  for (const [title, k, fk] of defs[key] || []) {
    if (!modules[k]) continue;
    const { data } = await db
      .from(modules[k].table)
      .select("*")
      .eq(fk, id)
      .order("created_at", { ascending: false })
      .limit(30);
    related.push({ title, key: k, rows: data || [] });
  }
  const { data: activity } = await db
    .from("activity_logs")
    .select("id,action,created_at")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  return (
    <RecordDetail
      moduleKey={key}
      row={{ ...row, ...(m.invoice ? { items } : {}) }}
      canWrite={Boolean(canWrite)}
      relations={relations}
      related={related}
      activity={activity || []}
    />
  );
}
