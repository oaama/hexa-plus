import { requireUser } from "@/lib/auth";
import { NotificationCenter } from "@/components/notification-center";
export default async function Notifications() {
  const { db } = await requireUser();
  await db.rpc("sync_deadline_notifications");
  const { data, error } = await db
    .from("notifications")
    .select("id,title,body,link,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Could not load notifications");
  return <NotificationCenter rows={data || []} />;
}
