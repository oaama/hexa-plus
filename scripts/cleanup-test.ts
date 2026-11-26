import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
process.loadEnvFile(".env.local");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVER_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const data = JSON.parse(fs.readFileSync("/tmp/hexa-test-cleanup.json", "utf8"));
let failed = false;
for (const table of [
  "payments",
  "invoice_items",
  "invoices",
  "task_attachments",
  "task_comments",
  "project_milestones",
  "project_members",
  "tasks",
  "portfolio_media",
  "portfolio_projects",
  "content_posts",
  "marketing_campaigns",
  "social_accounts",
  "expenses",
  "files",
  "lead_activities",
  "contact_submissions",
  "leads",
  "projects",
  "clients",
  "services",
  "website_settings",
  "testimonials",
]) {
  if (data.rows[table]?.length) {
    const { error } = await db.from(table).delete().in("id", data.rows[table]);
    if (error) {
      console.log("Cleanup failed", table, error.message);
      failed = true;
    }
  }
}
for (const uid of data.userIds) {
  await db
    .from("clients")
    .delete()
    .eq("created_by", uid)
    .eq("name", "TEST Browser CRUD");
  await db.from("notifications").delete().eq("recipient_id", uid);
  await db.from("activity_logs").delete().eq("actor_id", uid);
  const { error } = await db.auth.admin.deleteUser(uid);
  if (error) {
    console.log("User cleanup failed", error.message);
    failed = true;
  }
}
await db.storage.from("portfolio").remove(["qa/client1.png", "qa/client_.png"]);
if (!failed) {
  fs.unlinkSync("/tmp/hexa-test-session.json");
  fs.unlinkSync("/tmp/hexa-test-cleanup.json");
}
console.log(
  failed
    ? "CLEANUP NEEDS ATTENTION"
    : "QA records, users and test media removed.",
);
process.exit(failed ? 1 : 0);
