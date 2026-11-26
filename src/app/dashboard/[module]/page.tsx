import { notFound } from "next/navigation";
import { modules } from "@/lib/modules";
import { requirePermission } from "@/lib/auth";
import { ModuleWorkspace } from "@/components/module-workspace";
export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: key } = await params;
  const m = modules[key];
  if (!m) notFound();
  const { db } = await requirePermission(m.permission + ".read");
  const { data } = await db.rpc("has_permission", {
    requested: m.permission + ".write",
  });
  return (
    <ModuleWorkspace
      moduleKey={key}
      canWrite={Boolean(data)}
      inviteEnabled={Boolean(process.env.SUPABASE_SERVER_KEY)}
    />
  );
}
