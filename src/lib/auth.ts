import { redirect } from "next/navigation";
import { supabase } from "./supabase/server";
export async function requireUser() {
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  return { db, user };
}
export async function requirePermission(permission: string) {
  const { db, user } = await requireUser();
  const { data, error } = await db.rpc("has_permission", {
    requested: permission,
  });
  if (error || !data)
    throw new Error("You do not have permission for this action.");
  return { db, user };
}
