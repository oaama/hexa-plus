"use client";
import Link from "next/link";
import {
  Users,
  ArrowUpRight,
  BriefcaseBusiness,
  Contact,
  CheckSquare,
  TrendingUp,
  Clock3,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { money } from "@/lib/finance";
import { useLocale } from "./dashboard-shell";
type Row = Record<string, any>;
export function DashboardOverview({
  stats,
  projects,
  tasks,
  leads,
  activity,
  months,
  permissions,
  name,
}: {
  stats: Row;
  projects: Row[];
  tasks: Row[];
  leads: Row[];
  activity: Row[];
  months: Row[];
  permissions: string[];
  name: string;
}) {
  const { ar, t } = useLocale();
  const can = (p: string) =>
    permissions.includes("*") || permissions.includes(p + ".read");
  const tiles = [
    {
      key: "clients",
      label: t("Total clients", "إجمالي العملاء"),
      value: stats.clients,
      icon: Users,
      note: t("In your workspace", "في مساحة العمل"),
    },
    {
      key: "projects",
      label: t("Active projects", "المشروعات النشطة"),
      value: stats.activeProjects,
      icon: BriefcaseBusiness,
      note: t("In progress or review", "قيد التنفيذ أو المراجعة"),
    },
    {
      key: "leads",
      label: t("New leads", "فرص جديدة"),
      value: stats.newLeads,
      icon: Contact,
      note: t("Ready for a first conversation", "بانتظار أول تواصل"),
    },
    {
      key: "finance",
      label: t("Revenue this month", "إيراد الشهر"),
      value: money(stats.monthlyRevenue),
      icon: TrendingUp,
      note: t("From recorded payments", "من المدفوعات المسجلة"),
    },
  ];
  return (
    <>
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">
            {t("YOUR BUSINESS, CONNECTED", "أعمالك في مكان واحد")}
          </span>
          <h1>
            {t("Welcome back, ", "أهلا بعودتك، ")}
            {name.split(" ")[0]}
            <span className="welcome-dot">.</span>
          </h1>
          <p>
            {t(
              "A clear view of the work, the people and what comes next.",
              "نظرة واضحة على الشغل والفريق والخطوة الجاية.",
            )}
          </p>
        </div>
        <div className="head-actions">
          {can("projects") && (
            <Link
              href="/dashboard/projects?new=1"
              className="primary-link compact"
            >
              <Plus size={16} />
              {t("New project", "مشروع جديد")}
            </Link>
          )}
        </div>
      </div>
      <div className="stats-grid">
        {tiles
          .filter((v) => can(v.key))
          .map((v) => (
            <Link
              href={"/dashboard/" + (v.key === "finance" ? "payments" : v.key)}
              className="stat-card"
              key={v.key}
            >
              <div>
                <span>{v.label}</span>
                <v.icon size={18} />
              </div>
              <strong>{v.value}</strong>
              <small>{v.note}</small>
            </Link>
          ))}
      </div>
      <div className="analytics-grid">
        {can("finance") && (
          <section className="dashboard-card revenue-card">
            <div className="card-heading">
              <div>
                <h2>{t("Revenue overview", "نظرة على الإيرادات")}</h2>
                <p>
                  {t(
                    "Recorded payments · last 6 months · EGP",
                    "المدفوعات المسجلة · آخر ٦ شهور · جنيه",
                  )}
                </p>
              </div>
              <span className="subtle-badge">
                {t("Actual records", "بيانات فعلية")}
              </span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={months}>
                  <defs>
                    <linearGradient
                      id="revenue-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#134fe9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#134fe9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 5"
                    stroke="var(--line)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8895b2", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8895b2", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                    }}
                    formatter={(v) => money(Number(v) * 100)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#718fff"
                    strokeWidth={2}
                    fill="url(#revenue-fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <div>
                <span>{t("Outstanding", "مستحقات غير محصلة")}</span>
                <strong>{money(stats.outstanding)}</strong>
              </div>
              <div>
                <span>{t("Expenses this month", "مصروفات الشهر")}</span>
                <strong>{money(stats.monthlyExpenses)}</strong>
              </div>
            </div>
          </section>
        )}
        {can("leads") && (
          <section className="dashboard-card pipeline-card">
            <div className="card-heading">
              <div>
                <h2>{t("Lead pipeline", "مسار الفرص")}</h2>
                <p>
                  {t(
                    "Every conversation has a next step",
                    "لكل فرصة خطوة تالية",
                  )}
                </p>
              </div>
              <Link href="/dashboard/leads" aria-label="View leads">
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="pipeline-total">
              <strong>{stats.totalLeads}</strong>
              <span>{t("total leads", "إجمالي الفرص")}</span>
            </div>
            <div className="pipeline-bars">
              {[
                "new",
                "contacted",
                "qualified",
                "proposal_sent",
                "negotiation",
                "won",
                "lost",
              ].map((s, i) => {
                const count = stats.leadStages[s] || 0;
                return (
                  <div key={s}>
                    <span>
                      <i
                        style={{
                          background: [
                            "#134fe9",
                            "#7852ea",
                            "#48b5c4",
                            "#b58bf5",
                            "#deb26c",
                            "#65c4a2",
                            "#9aa4b9",
                          ][i],
                        }}
                      />
                      {t(
                        s.replaceAll("_", " "),
                        [
                          "جديدة",
                          "تم التواصل",
                          "مؤهلة",
                          "تم إرسال عرض",
                          "تفاوض",
                          "ناجحة",
                          "مفقودة",
                        ][i],
                      )}
                    </span>
                    <div>
                      <b
                        style={{
                          width:
                            Math.max(
                              0,
                              (count / Math.max(stats.totalLeads, 1)) * 100,
                            ) + "%",
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
            <div className="pipeline-conversion">
              <span>{t("Conversion rate", "معدل التحويل")}</span>
              <strong>{stats.conversion}%</strong>
            </div>
          </section>
        )}
      </div>
      <div className="workspace-lower-grid">
        {can("projects") && (
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>{t("Projects in motion", "مشروعات جارية")}</h2>
                <p>
                  {t(
                    "Progress, priorities and upcoming deadlines",
                    "التقدم والأولويات والمواعيد",
                  )}
                </p>
              </div>
              <Link href="/dashboard/projects" className="text-link">
                {t("View all", "عرض الكل")}
                <ArrowRight size={15} />
              </Link>
            </div>
            {projects.length ? (
              <div className="overview-projects">
                {projects.map((p) => (
                  <Link href={"/dashboard/projects/" + p.id} key={p.id}>
                    <div className="project-icon">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div className="grow">
                      <strong>{p.name}</strong>
                      <small>
                        {p.deadline || t("No deadline set", "بدون موعد نهائي")}
                      </small>
                    </div>
                    <div className="overview-progress">
                      <span>{p.progress}%</span>
                      <div>
                        <i style={{ width: p.progress + "%" }} />
                      </div>
                    </div>
                    <span className={"status-badge " + p.status}>
                      {p.status.replaceAll("_", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty
                title={t(
                  "Your next project starts here.",
                  "مشروعك الجاي يبدأ هنا.",
                )}
                text={t(
                  "Add a project to start tracking delivery.",
                  "أضف مشروعا لمتابعة التنفيذ.",
                )}
              />
            )}
          </section>
        )}
        {can("tasks") && (
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>{t("Needs your attention", "يحتاج انتباهك")}</h2>
                <p>
                  {t(
                    "Open tasks, ordered by deadline",
                    "المهام المفتوحة حسب الموعد",
                  )}
                </p>
              </div>
              <Clock3 size={18} />
            </div>
            {tasks.length ? (
              <div className="attention-list">
                {tasks.map((task) => (
                  <Link href={"/dashboard/tasks/" + task.id} key={task.id}>
                    <span className="task-checkbox" />
                    <div>
                      <strong>{task.title}</strong>
                      <small>
                        {task.deadline || t("No deadline", "بدون موعد")}
                      </small>
                    </div>
                    <span className={"priority-dot " + task.priority} />
                  </Link>
                ))}
              </div>
            ) : (
              <Empty
                title={t("A little breathing room.", "مساحة لالتقاط الأنفاس.")}
                text={t(
                  "No open tasks in your access scope.",
                  "لا توجد مهام مفتوحة ضمن صلاحياتك.",
                )}
              />
            )}
          </section>
        )}
      </div>
      <div className="workspace-lower-grid">
        {can("leads") && (
          <section className="dashboard-card">
            <div className="card-heading">
              <h2>{t("Recent inquiries", "أحدث الاستفسارات")}</h2>
              <Link href="/dashboard/leads">
                <ArrowUpRight size={18} />
              </Link>
            </div>
            {leads.length ? (
              <div className="attention-list">
                {leads.map((l) => (
                  <Link href={"/dashboard/leads/" + l.id} key={l.id}>
                    <span className="small-avatar">{l.name[0]}</span>
                    <div>
                      <strong>{l.name}</strong>
                      <small>{l.service || l.company || l.source}</small>
                    </div>
                    <span className="status-badge">
                      {l.stage.replaceAll("_", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty
                title={t("Ready for new conversations.", "جاهزين لفرص جديدة.")}
                text={t(
                  "Website inquiries will appear here automatically.",
                  "استفسارات الموقع هتظهر هنا تلقائيا.",
                )}
              />
            )}
          </section>
        )}
        {can("activity") && (
          <section className="dashboard-card">
            <div className="card-heading">
              <h2>{t("Recent activity", "أحدث النشاطات")}</h2>
              <Link href="/dashboard/activity">
                <ArrowUpRight size={18} />
              </Link>
            </div>
            {activity.length ? (
              <div className="activity-list">
                {activity.map((a) => (
                  <div key={a.id}>
                    <i />
                    <div>
                      <strong>
                        {a.action} · {a.entity_table.replaceAll("_", " ")}
                      </strong>
                      <small>
                        {new Date(a.created_at).toLocaleString(
                          ar ? "ar-EG" : "en-GB",
                          {
                            timeZone: "Africa/Cairo",
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title={t("A clean starting point.", "بداية جديدة.")}
                text={t(
                  "Important changes are recorded here automatically.",
                  "التغييرات المهمة بتتسجل هنا تلقائيا.",
                )}
              />
            )}
          </section>
        )}
      </div>
      <p className="scope-note">
        {t(
          "All figures come from saved records and reflect your access permissions. No demo revenue or clients.",
          "كل الأرقام من البيانات المحفوظة وبتعكس صلاحياتك. مفيش إيرادات أو عملاء تجريبيين.",
        )}
      </p>
    </>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="dashboard-empty">
      <div className="empty-glyph">
        <CheckSquare size={21} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
