import { requireUser } from "@/lib/auth";
import { BusinessReports } from "@/components/business-reports";
export default async function Reports() {
  const { db } = await requireUser();
  const [{ data: overview, error }, { data: projects }, { data: campaigns }] =
    await Promise.all([
      db.rpc("dashboard_overview"),
      db.from("projects").select("status,category"),
      db
        .from("marketing_campaigns")
        .select(
          "name,budget_minor,ad_spend_minor,leads_generated,engagement,reach,conversions",
        ),
    ]);
  if (error) throw new Error("Could not load reports.");
  return (
    <BusinessReports
      overview={overview}
      projects={projects || []}
      campaigns={campaigns || []}
    />
  );
}
