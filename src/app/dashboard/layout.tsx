import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Workspace",
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { db, user } = await requireUser();
  const { data: p } = await db
    .from("profiles")
    .select("name,status,role_id,roles(name)")
    .eq("id", user.id)
    .single();
  if (!p || p.status !== "active") redirect("/login");
  const { data: grants } = await db
    .from("role_permissions")
    .select("permissions(name)")
    .eq("role_id", p.role_id);
  const role = p.roles as unknown as { name: string };
  const permissions =
    role?.name === "super_admin"
      ? ["*"]
      : (grants || [])
          .map((g) => (g.permissions as unknown as { name: string })?.name)
          .filter(Boolean);
  await db.rpc("sync_deadline_notifications");
  const { count } = await db
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);
  return (
    <DashboardShell name={p.name} permissions={permissions} unread={count || 0}>
      {children}
    </DashboardShell>
  );
}
