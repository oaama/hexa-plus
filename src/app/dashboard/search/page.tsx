import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { modules, tableLabel } from "@/lib/modules";
import { ArrowUpRight } from "lucide-react";
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { db } = await requireUser();
  const keys = [
    "clients",
    "leads",
    "projects",
    "tasks",
    "services",
    "portfolio",
    "content",
    "campaigns",
    "invoices",
    "files",
  ];
  const results = await Promise.all(
    keys.map(async (key) => {
      const m = modules[key];
      const field = m.fields.find((f) =>
        ["name", "title", "invoice_number"].includes(f.key),
      )!;
      if (!q.trim()) return { key, rows: [] };
      const { data } = await db
        .from(m.table)
        .select("id," + field.key)
        .ilike(
          field.key,
          "%" + q.slice(0, 100).replaceAll("%", "").replaceAll("_", "") + "%",
        )
        .limit(10);
      return { key, rows: (data || []) as unknown as Record<string, any>[] };
    }),
  );
  return (
    <>
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">WORKSPACE SEARCH</span>
          <h1>Results for “{q.slice(0, 100)}”</h1>
          <p>
            Up to 10 results per module. Results follow your access permissions.
          </p>
        </div>
      </div>
      <div className="search-results">
        {results.map(({ key, rows }) => (
          <section key={key}>
            <h2>{modules[key].label}</h2>
            {rows.length ? (
              rows.map((row) => (
                <Link href={"/dashboard/" + key + "/" + row.id} key={row.id}>
                  {tableLabel(row as unknown as Record<string, unknown>)}
                  <ArrowUpRight size={15} />
                </Link>
              ))
            ) : (
              <p>No matching records in your access scope.</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
