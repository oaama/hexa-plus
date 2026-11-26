"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { useLocale } from "./dashboard-shell";
import { money } from "@/lib/finance";
import { arabicStates } from "@/lib/rtl";
type Row = Record<string, any>;
export function BusinessReports({
  overview,
  projects,
  campaigns,
}: {
  overview: Row;
  projects: Row[];
  campaigns: Row[];
}) {
  const { ar, t } = useLocale();
  const colors = [
    "#134fe9",
    "#7852ea",
    "#60baa7",
    "#deb979",
    "#6db4d1",
    "#ad7d9b",
  ];
  const group = (key: string) =>
    Object.entries(
      projects.reduce((a: Record<string, number>, p: Row) => {
        const v = p[key] || t("Uncategorized", "بدون تصنيف");
        a[v] = (a[v] || 0) + 1;
        return a;
      }, {}),
    ).map(([name, value]) => ({
      name: ar ? arabicStates[name] || name : name.replaceAll("_", " "),
      value,
    }));
  const tooltip = {
    contentStyle: {
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: 8,
    },
    labelStyle: { color: "var(--text)" },
  };
  return (
    <>
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">
            {t("BUSINESS INTELLIGENCE", "تقارير الأعمال")}
          </span>
          <h1>{t("A clearer view forward.", "رؤية أوضح للخطوة الجاية.")}</h1>
          <p>
            {t(
              "Actual saved records, limited to your permission scope. No advertising integrations are connected.",
              "بيانات فعلية حسب صلاحياتك. لا توجد منصات إعلانية متصلة تلقائيا.",
            )}
          </p>
        </div>
      </div>
      <div className="stats-grid">
        {[
          [
            "Completed projects",
            "المشروعات المكتملة",
            overview.stats.completedProjects,
          ],
          [
            "Pending projects",
            "المشروعات المنتظرة",
            overview.stats.pendingProjects,
          ],
          ["Active team", "أعضاء الفريق النشطين", overview.stats.team],
          [
            "Tasks in progress",
            "المهام الجارية",
            overview.stats.tasksInProgress,
          ],
        ].map(([en, arabic, n]) => (
          <div key={en} className="stat-card">
            <div>{t(en, arabic)}</div>
            <strong>{n}</strong>
            <small>{t("Within your access scope", "ضمن صلاحياتك")}</small>
          </div>
        ))}
      </div>
      <div className="workspace-lower-grid grid-cols-2">
        {[
          ["leads", "Lead acquisition", "اكتساب الفرص"],
          ["clients", "Client acquisition", "اكتساب العملاء"],
        ].map(([key, en, arabic]) => (
          <section key={key} className="dashboard-card">
            <div className="card-heading">
              <h2>{t(en, arabic)}</h2>
              <span className="subtle-badge">6 months</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={overview.months}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#899ab9", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#899ab9", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltip} />
                  <Bar
                    dataKey={key}
                    fill={key === "leads" ? "#134fe9" : "#7852ea"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ))}
      </div>
      <div className="workspace-lower-grid grid-cols-2">
        {[
          ["status", "Projects by status", "المشروعات حسب الحالة"],
          [
            "category",
            "Service / project distribution",
            "توزيع الخدمات والمشروعات",
          ],
        ].map(([key, en, arabic]) => (
          <section className="dashboard-card" key={key}>
            <div className="card-heading">
              <h2>{t(en, arabic)}</h2>
            </div>
            {projects.length ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
                    <Pie
                      data={group(key)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {group(key).map((v, i) => (
                        <Cell key={v.name} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltip} />
                    <Legend wrapperStyle={{ fontSize: 9, color: "#899ab9" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="dashboard-empty">
                <h3>
                  {t("No projects recorded yet.", "لا توجد مشروعات مسجلة.")}
                </h3>
                <p>
                  {t(
                    "This chart appears when there is real data.",
                    "الرسم هيظهر لما تكون فيه بيانات فعلية.",
                  )}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>
      <section className="dashboard-card mb-6">
        <div className="card-heading">
          <h2>{t("Monthly performance", "الأداء الشهري")}</h2>
          <p>
            {t(
              "Payments in EGP on left axis, leads on right axis",
              "المدفوعات بالجنيه على اليسار والفرص على اليمين",
            )}
          </p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={overview.months}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#899ab9", fontSize: 10 }} />
              <YAxis yAxisId="money" tick={{ fill: "#899ab9", fontSize: 10 }} />
              <YAxis
                yAxisId="count"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: "#899ab9", fontSize: 10 }}
              />
              <Tooltip {...tooltip} />
              <Bar
                yAxisId="money"
                dataKey="revenue"
                fill="#134fe9"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="count"
                dataKey="leads"
                stroke="#a48aff"
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="dashboard-card">
        <div className="card-heading">
          <h2>{t("Marketing performance", "أداء التسويق")}</h2>
          <p>
            {t(
              "Manually entered campaign records",
              "نتائج الحملات المسجلة يدويا",
            )}
          </p>
        </div>
        {campaigns.length ? (
          <div className="data-table-wrap border-0">
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    "Campaign",
                    "Budget",
                    "Ad spend",
                    "Leads",
                    "Engagement",
                    "Reach",
                    "Conversions",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{money(c.budget_minor)}</td>
                    <td>{money(c.ad_spend_minor)}</td>
                    <td>{c.leads_generated}</td>
                    <td>{c.engagement}</td>
                    <td>{c.reach}</td>
                    <td>{c.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty">
            <h3>
              {t("No campaign reports yet.", "لا توجد تقارير حملات بعد.")}
            </h3>
            <p>
              {t(
                "Add campaign results in the marketing workspace.",
                "أضف نتائج الحملات في قسم التسويق.",
              )}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
