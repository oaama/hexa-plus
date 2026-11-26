import { requireUser } from "@/lib/auth";
import { DashboardOverview } from "@/components/dashboard-overview";
export default async function Dashboard() {
  const { db, user } = await requireUser();
  const [overview, projects, tasks, leads, activity, p, grants] =
    await Promise.all([
      db.rpc("dashboard_overview"),
      db
        .from("projects")
        .select("id,name,status,progress,deadline")
        .not("status", "in", "(completed,cancelled)")
        .order("deadline", { nullsFirst: false })
        .limit(5),
      db
        .from("tasks")
        .select("id,title,status,priority,deadline")
        .neq("status", "completed")
        .order("deadline", { nullsFirst: false })
        .limit(5),
      db
        .from("leads")
        .select("id,name,service,company,stage,source")
        .order("created_at", { ascending: false })
        .limit(4),
      db
        .from("activity_logs")
        .select("id,action,entity_table,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      db
        .from("profiles")
        .select("name,role_id,roles(name)")
        .eq("id", user.id)
        .single(),
      db.from("role_permissions").select("role_id,permissions(name)"),
    ]);
  if (overview.error) throw new Error("Could not load workspace analytics");
  const isSuper =
    (p.data?.roles as unknown as { name: string })?.name === "super_admin";
  const permissions = isSuper
    ? ["*"]
    : (grants.data || [])
        .filter((g) => g.role_id === p.data?.role_id)
        .map((g) => (g.permissions as unknown as { name: string }).name);
  return (
    <DashboardOverview
      stats={overview.data.stats}
      months={overview.data.months}
      projects={projects.data || []}
      tasks={tasks.data || []}
      leads={leads.data || []}
      activity={activity.data || []}
      permissions={permissions}
      name={p.data?.name || "Team"}
    />
  );
}
