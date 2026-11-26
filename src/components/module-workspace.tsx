"use client";
import { arabicLabels, arabicStates } from "@/lib/rtl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowUpDown,
  Pencil,
  Trash2,
  X,
  Table2,
  Columns3,
  CalendarDays,
  Clock3,
  Download,
  Check,
  LoaderCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Upload,
  ExternalLink,
} from "lucide-react";
import { modules, type Module, type Field, tableLabel } from "@/lib/modules";
import { money, invoiceTotals } from "@/lib/finance";
import { useLocale } from "./dashboard-shell";
import { Button } from "@/components/ui/button";
type Row = Record<string, any>;
const pretty = (v: string) => v.replaceAll("_", " ");
const subnav: Record<string, [string, string][]> = {
  projects: [
    ["milestones", "Milestones"],
    ["project-members", "Project team"],
  ],
  tasks: [
    ["comments", "Comments"],
    ["task-attachments", "Attachments"],
  ],
  team: [["departments", "Departments"]],
  portfolio: [
    ["portfolio-media", "Gallery images"],
    ["testimonials", "Testimonials"],
  ],
  content: [
    ["campaigns", "Campaigns"],
    ["social", "Social accounts"],
  ],
  clients: [
    ["projects", "Projects"],
    ["invoices", "Invoices"],
  ],
  leads: [["lead-activities", "Follow-up activity"]],
  invoices: [
    ["payments", "Payments"],
    ["expenses", "Expenses"],
  ],
};
export function ModuleWorkspace({
  moduleKey,
  canWrite,
  inviteEnabled = false,
}: {
  moduleKey: string;
  canWrite: boolean;
  inviteEnabled?: boolean;
}) {
  const m = modules[moduleKey];
  const { ar, t } = useLocale();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [asc, setAsc] = useState(false);
  const [view, setView] = useState("table");
  const [scope, setScope] = useState("all");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [removing, setRemoving] = useState<Row | null>(null);
  const [toast, setToast] = useState("");
  const [relations, setRelations] = useState<
    Record<string, Record<string, string>>
  >({});
  const [uploading, setUploading] = useState(false);
  const [invite, setInvite] = useState(false);
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const statusField = m.fields.find((f) => f.key === (m.statusKey || "status"));
  const dateField = m.fields.find((f) =>
    [
      "deadline",
      "publishing_date",
      "follow_up_date",
      "due_date",
      "expense_date",
      "paid_at",
    ].includes(f.key),
  );
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 4500);
  };
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        q: query,
        status: filter,
        sort,
        asc: String(asc),
      });
      if (scope === "mine") params.set("mine", "1");
      if (scope === "overdue") params.set("overdue", "1");
      const response = await fetch("/api/modules/" + moduleKey + "?" + params);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.rows);
      setCount(data.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load records");
    } finally {
      setBusy(false);
    }
  }, [moduleKey, page, query, filter, sort, asc, scope]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);
  useEffect(() => {
    if (
      searchParams.get("new") === "1" &&
      canWrite &&
      !m.readOnly &&
      !m.noCreate
    )
      setEditing(null);
  }, [searchParams, canWrite, m]);
  useEffect(() => {
    const tables = [
      ...new Set(m.fields.filter((f) => f.relation).map((f) => f.relation!)),
    ];
    Promise.all(
      tables.map(async (table) => {
        const response = await fetch("/api/relations?table=" + table);
        const data = await response.json();
        return [
          table,
          Object.fromEntries(
            (data.rows || []).map((r: Row) => [r.id, r.label]),
          ),
        ];
      }),
    ).then((entries) => setRelations(Object.fromEntries(entries)));
  }, [m]);
  async function edit(row: Row) {
    try {
      if (m.invoice) {
        const response = await fetch(
          "/api/modules/" + moduleKey + "/" + row.id,
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setEditing(data);
      } else setEditing(row);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not open record");
    }
  }
  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      const response = await fetch(
        (moduleKey === "files"
          ? "/api/files/"
          : "/api/modules/" + moduleKey + "/") + removing.id,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRemoving(null);
      notify(t("Record deleted.", "تم حذف السجل."));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete record");
      setBusy(false);
      setRemoving(null);
    }
  }
  async function drag(result: DropResult) {
    if (!result.destination || !statusField || !canWrite) return;
    const row = rows.find((v) => v.id === result.draggableId);
    if (!row || row[statusField.key] === result.destination.droppableId) return;
    const next = result.destination.droppableId;
    setRows(
      rows.map((v) =>
        v.id === row.id ? { ...v, [statusField.key]: next } : v,
      ),
    );
    const response = await fetch("/api/modules/" + moduleKey + "/" + row.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [statusField.key]: next }),
    });
    const data = await response.json();
    if (!response.ok) {
      notify(data.error);
      load();
    } else notify(t("Stage updated.", "تم تحديث المرحلة."));
  }
  async function download(row: Row) {
    const response = await fetch("/api/files/" + row.id);
    const data = await response.json();
    if (response.ok) window.open(data.url, "_blank", "noopener,noreferrer");
    else notify(data.error);
  }
  const label = (row: Row, f: Field) => {
    const value = row[f.key];
    if (value === null || value === undefined || value === "") return "—";
    if (f.relation)
      return (
        relations[f.relation]?.[value] ||
        t("Restricted / unavailable", "غير متاح")
      );
    if (f.type === "boolean") return value ? t("Yes", "نعم") : t("No", "لا");
    if (f.type === "money") return money(Number(value));
    if (f.type === "percent") return Number(value) / 100 + "%";
    if (f.type === "date")
      return new Date(value + "T12:00:00Z").toLocaleDateString(
        ar ? "ar-EG" : "en-GB",
        { dateStyle: "medium", timeZone: "Africa/Cairo" },
      );
    return String(value);
  };
  const fields = m.fields
    .filter(
      (f) =>
        !["textarea", "boolean"].includes(f.type) &&
        ![
          "id",
          "description",
          "notes",
          "body",
          "actor_id",
          "entity_id",
        ].includes(f.key),
    )
    .slice(0, 5);
  if (m.invoice)
    fields.push(
      { key: "total_minor", label: "Total", type: "money" },
      { key: "status", label: "Payment status", type: "text" },
    );
  return (
    <>
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">
            HEXA PLUS / {t("WORKSPACE", "مساحة العمل")}
          </span>
          <h1>
            {ar ? m.ar : m.label}
            <span className="count-badge">{count}</span>
          </h1>
          <p>
            {m.readOnly
              ? t(
                  "A live record of what happens in your workspace.",
                  "سجل فعلي لما يحدث في مساحة العمل.",
                )
              : t(
                  "Keep the details clear. Keep the work moving.",
                  "كل التفاصيل واضحة، والشغل بيتحرك.",
                )}
          </p>
        </div>
        <div className="head-actions">
          {canWrite && !m.readOnly && !m.noCreate && (
            <Button
              size="sm"
              onClick={() =>
                moduleKey === "files" ? setUploading(true) : setEditing(null)
              }
            >
              <Plus size={15} />
              {t(
                moduleKey === "files" ? "Upload file" : "Add new",
                moduleKey === "files" ? "رفع ملف" : "إضافة جديد",
              )}
            </Button>
          )}
          {moduleKey === "team" && canWrite && (
            <Button
              size="sm"
              disabled={!inviteEnabled}
              title={
                inviteEnabled
                  ? "Invite a team member"
                  : "Server credential setup is required before invitations are available."
              }
              onClick={() => setInvite(true)}
            >
              <Plus size={15} />
              {t("Invite member", "دعوة عضو")}
            </Button>
          )}
        </div>
      </div>
      {subnav[moduleKey] && (
        <div className="module-subnav">
          {subnav[moduleKey].map(([k, v]) => (
            <Link key={k} href={"/dashboard/" + k}>
              {ar ? modules[k].ar : v}
              <ArrowUpRight size={11} className="inline ms-2" />
            </Link>
          ))}
        </div>
      )}
      {moduleKey === "tasks" && (
        <div className="module-subnav">
          {[
            ["all", "All tasks", "كل المهام"],
            ["mine", "My tasks", "مهامي"],
            ["overdue", "Overdue", "المتأخرة"],
          ].map(([k, en, arabic]) => (
            <button
              key={k}
              className={scope === k ? "active" : ""}
              onClick={() => {
                setScope(k);
                setPage(1);
              }}
            >
              {t(en, arabic)}
            </button>
          ))}
        </div>
      )}
      {moduleKey === "team" && (
        <p className="module-note">
          {t(
            "Only the super admin can assign roles or change account access. New members receive an invitation email and set their own password.",
            "المشرف الرئيسي فقط يقدر يحدد الأدوار ويغيّر صلاحية الحساب. الأعضاء الجدد بيستلموا دعوة بالإيميل وبيختاروا كلمة السر.",
          )}
          {!inviteEnabled &&
            t(
              " Invitations are unavailable until the server credential is configured.",
              " الدعوات هتتوفر بعد ضبط بيانات الخادم.",
            )}
        </p>
      )}
      {moduleKey === "settings" && (
        <p className="module-note">
          {t(
            "Public content keys: hero_title, hero_description, address, contact_email, contact_phone, footer_description, site_title, site_description, social_instagram (or another platform), and page_about / page_faq / page_privacy / page_terms / page_careers / page_process / page_industries. Only approved public keys are published. Store brand colors as hex values. Never put passwords or API keys here.",
            "مفاتيح المحتوى العام: hero_title وhero_description وaddress وcontact_email وcontact_phone وsocial_instagram وباقي المنصات، ومحتوى الصفحات page_about / page_faq وغيرها. المفاتيح المسموحة فقط بتظهر للزوار. ممنوع حفظ كلمات سر أو مفاتيح API هنا.",
          )}
        </p>
      )}
      {["content", "campaigns", "social"].includes(moduleKey) && (
        <p className="module-note">
          {t(
            "Planning and manual reporting only. This workspace does not automatically publish posts or run advertising campaigns.",
            "للتخطيط وتسجيل النتائج يدويا فقط. مساحة العمل لا تنشر المحتوى أو تشغل الإعلانات تلقائيا.",
          )}
        </p>
      )}
      {moduleKey === "files" && (
        <p className="module-note">
          {t(
            "Private business files. Access follows the Files permission. Up to 10 MB per file. Portfolio images are uploaded separately and remain private until linked to published content.",
            "ملفات العمل خاصة، والوصول حسب صلاحية الملفات. الحد ١٠ ميجابايت. صور المعرض بترفع منفصلة وتفضل خاصة لحد ربطها بمحتوى منشور.",
          )}
        </p>
      )}
      <div className="module-toolbar">
        <label className="module-search">
          <Search size={14} />
          <input
            placeholder={t("Search records...", "ابحث في السجلات...")}
            aria-label={t("Search records", "البحث في السجلات")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        {statusField && (
          <select
            className="module-filter"
            aria-label="Filter by status"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("All statuses", "كل الحالات")}</option>
            {statusField.options?.map((v) => (
              <option key={v} value={v}>
                {ar ? arabicStates[v] || pretty(v) : pretty(v)}
              </option>
            ))}
          </select>
        )}
        <div className="view-toggle">
          {[
            ["table", Table2, "Table"],
            ...(statusField ? [["board", Columns3, "Board"]] : []),
            ...(dateField ? [["calendar", CalendarDays, "Calendar"]] : []),
            ...(moduleKey === "projects"
              ? [["timeline", Clock3, "Timeline"]]
              : []),
            ...(moduleKey === "files" ? [["grid", FolderOpen, "Grid"]] : []),
          ].map(([key, Icon, title]) => {
            const I = Icon as React.ElementType;
            return (
              <button
                key={key as string}
                className={view === key ? "active" : ""}
                onClick={() => setView(key as string)}
                aria-label={"Show " + title}
              >
                <I size={13} />
                <span>
                  {ar
                    ? {
                        Table: "جدول",
                        Board: "لوحة",
                        Calendar: "تقويم",
                        Timeline: "زمني",
                        Grid: "شبكة",
                      }[title as string] || (title as string)
                    : (title as string)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {view !== "table" && count > 25 && (
        <p className="module-note">
          {t(
            "This view shows the current page of up to 25 records. Use pagination or search to see the rest.",
            "العرض الحالي بيظهر لحد ٢٥ سجل من الصفحة دي. استخدم الصفحات أو البحث لباقي السجلات.",
          )}
        </p>
      )}
      {error && (
        <div className="module-error" role="alert">
          {error}
        </div>
      )}
      {busy ? (
        <div className="dashboard-empty">
          <LoaderCircle className="spin" />
          <p>{t("Loading saved records...", "جاري تحميل البيانات...")}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="dashboard-card dashboard-empty">
          <div className="empty-glyph">
            <FolderOpen size={22} />
          </div>
          <h3>
            {query || filter
              ? t("No matching records.", "مفيش نتائج مطابقة.")
              : t("A clean starting point.", "بداية جديدة.")}
          </h3>
          <p>
            {t(
              "Saved records will appear here. No sample business data is shown.",
              "البيانات المحفوظة هتظهر هنا. مفيش بيانات تجريبية معروضة.",
            )}
          </p>
          {canWrite && !m.readOnly && !m.noCreate && (
            <Button
              size="sm"
              variant="outline"
              className="mt-5"
              onClick={() =>
                moduleKey === "files" ? setUploading(true) : setEditing(null)
              }
            >
              <Plus size={14} />
              {t("Create the first record", "أضف أول سجل")}
            </Button>
          )}
        </div>
      ) : view === "board" && statusField ? (
        <DragDropContext onDragEnd={drag}>
          <div className="kanban-board">
            {statusField.options?.map((stage) => (
              <section className="kanban-column" key={stage}>
                <h3>
                  {ar ? arabicStates[stage] || pretty(stage) : pretty(stage)}
                  <span>
                    {rows.filter((r) => r[statusField.key] === stage).length}
                  </span>
                </h3>
                <Droppable droppableId={stage} isDropDisabled={!canWrite}>
                  {(provided) => (
                    <div
                      className="kanban-drop"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {rows
                        .filter((r) => r[statusField.key] === stage)
                        .map((row, i) => (
                          <Draggable
                            key={row.id}
                            draggableId={row.id}
                            index={i}
                            isDragDisabled={!canWrite}
                          >
                            {(provided) => (
                              <article
                                className="kanban-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Link
                                  href={
                                    "/dashboard/" + moduleKey + "/" + row.id
                                  }
                                >
                                  <h4>{tableLabel(row)}</h4>
                                  <p>
                                    {row.company ||
                                      row.service ||
                                      row.description?.slice(0, 70)}
                                  </p>
                                  <div>
                                    <span>
                                      {row.deadline ||
                                        row.follow_up_date ||
                                        row.publishing_date ||
                                        "No deadline"}
                                    </span>
                                    {row.expected_value_minor > 0 && (
                                      <span>
                                        {money(row.expected_value_minor)}
                                      </span>
                                    )}
                                    {row.priority && (
                                      <span
                                        className={
                                          "status-badge " + row.priority
                                        }
                                      >
                                        {row.priority}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              </article>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      {rows.filter((r) => r[statusField.key] === stage)
                        .length === 0 && (
                        <div className="kanban-empty">
                          {t("Drop a record here", "اسحب سجلا هنا")}
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </section>
            ))}
          </div>
        </DragDropContext>
      ) : view === "calendar" && dateField ? (
        <CalendarView
          rows={rows}
          dateField={dateField.key}
          moduleKey={moduleKey}
          month={month}
          setMonth={setMonth}
        />
      ) : view === "timeline" ? (
        <TimelineView rows={rows} />
      ) : view === "grid" && moduleKey === "files" ? (
        <div className="file-grid">
          {rows.map((row) => (
            <article className="file-card" key={row.id}>
              <FolderOpen size={32} />
              <h3>{row.name}</h3>
              <p>
                {row.folder || "Unfiled"} · {Math.round(row.size_bytes / 1024)}{" "}
                KB
              </p>
              <div>
                <button onClick={() => download(row)}>
                  <Download size={12} />
                  Open
                </button>
                {canWrite && (
                  <button onClick={() => setRemoving(row)}>
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {fields.map((f) => (
                  <th key={f.key}>
                    <button
                      onClick={() => {
                        setSort(
                          f.key === "total_minor" ||
                            (f.key === "status" && m.invoice)
                            ? "created_at"
                            : f.key,
                        );
                        setAsc(sort === f.key ? !asc : true);
                      }}
                    >
                      {ar ? arabicLabels[f.label] || f.label : f.label}
                      <ArrowUpDown size={10} />
                    </button>
                  </th>
                ))}
                <th>{t("Actions", "إجراءات")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {fields.map((f, i) => (
                    <td key={f.key}>
                      {i === 0 ? (
                        <Link href={"/dashboard/" + moduleKey + "/" + row.id}>
                          {label(row, f)}
                        </Link>
                      ) : f.type === "select" || f.key === "status" ? (
                        <span className={"status-badge " + row[f.key]}>
                          {ar
                            ? arabicStates[row[f.key]] ||
                              pretty(row[f.key] || "")
                            : pretty(row[f.key] || "")}
                        </span>
                      ) : (
                        label(row, f)
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <Link
                        href={"/dashboard/" + moduleKey + "/" + row.id}
                        aria-label={"Open " + tableLabel(row)}
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                      {moduleKey === "files" && (
                        <button
                          onClick={() => download(row)}
                          aria-label="Download file"
                        >
                          <Download size={13} />
                        </button>
                      )}
                      {canWrite && !m.readOnly && (
                        <button
                          onClick={() => edit(row)}
                          aria-label={"Edit " + tableLabel(row)}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {canWrite && !m.readOnly && moduleKey !== "team" && (
                        <button
                          onClick={() => setRemoving(row)}
                          aria-label={"Delete " + tableLabel(row)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {m.invoice && (
                        <a
                          href={"/api/invoices/" + row.id + "/pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download invoice PDF"
                        >
                          <Download size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-pagination">
        <span>
          {t("Showing", "عرض")} {count ? (page - 1) * 25 + 1 : 0}–
          {Math.min(page * 25, count)} {t("of", "من")} {count}
        </span>
        <div>
          <button
            disabled={page <= 1 || busy}
            onClick={() => setPage(page - 1)}
          >
            {t("Previous", "السابق")}
          </button>
          <span>
            {page} / {Math.max(1, Math.ceil(count / 25))}
          </span>
          <button
            disabled={page * 25 >= count || busy}
            onClick={() => setPage(page + 1)}
          >
            {t("Next", "التالي")}
          </button>
        </div>
      </div>
      <RecordEditor
        moduleKey={moduleKey}
        record={editing}
        onClose={() => setEditing(undefined)}
        onSaved={() => {
          setEditing(undefined);
          notify(t("Changes saved.", "تم الحفظ."));
          load();
        }}
      />
      <Dialog.Root
        open={!!removing}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="confirm-dialog">
            <Dialog.Title>
              {t("Delete this record?", "حذف السجل؟")}
            </Dialog.Title>
            <Dialog.Description>
              {t(
                "This permanently deletes the selected record. Related records may prevent deletion.",
                "ده بيحذف السجل نهائيا. السجلات المرتبطة ممكن تمنع الحذف.",
              )}
              <br />
              {removing && tableLabel(removing)}
            </Dialog.Description>
            <div className="dialog-actions">
              <Dialog.Close className="secondary-button">
                {t("Cancel", "إلغاء")}
              </Dialog.Close>
              <button className="danger-button" onClick={remove}>
                {t("Delete record", "حذف السجل")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <UploadDialog
        open={uploading}
        onClose={() => setUploading(false)}
        onSaved={() => {
          setUploading(false);
          notify(t("File uploaded.", "تم رفع الملف."));
          load();
        }}
      />
      <InviteDialog
        open={invite}
        onClose={() => setInvite(false)}
        onSaved={() => {
          setInvite(false);
          notify(t("Invitation sent.", "تم إرسال الدعوة."));
          load();
        }}
      />
      {toast && (
        <div className="toast-message" role="status">
          <Check size={15} />
          {toast}
        </div>
      )}
    </>
  );
}
export function RecordEditor({
  moduleKey,
  record,
  onClose,
  onSaved,
}: {
  moduleKey: string;
  record: Row | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const m = modules[moduleKey];
  const { t, ar } = useLocale();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [relations, setRelations] = useState<Record<string, Row[]>>({});
  const [items, setItems] = useState<Row[]>([
    { description: "", quantity: 1, unit_price_minor: 0 },
  ]);
  useEffect(() => {
    setError("");
    if (record !== undefined) {
      setItems(
        record?.items?.length
          ? record.items
          : [{ description: "", quantity: 1, unit_price_minor: 0 }],
      );
      const tables = [
        ...new Set(m.fields.filter((f) => f.relation).map((f) => f.relation!)),
      ];
      Promise.all(
        tables.map(async (table) => {
          const response = await fetch("/api/relations?table=" + table);
          const data = await response.json();
          return [table, data.rows || []];
        }),
      ).then((entries) => setRelations(Object.fromEntries(entries)));
    }
  }, [record, m]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(e.currentTarget);
      const values: Row = {};
      for (const f of m.fields) {
        const raw = form.get(f.key);
        values[f.key] =
          f.type === "boolean"
            ? raw === "on"
            : ["money", "percent"].includes(f.type)
              ? Math.round(Number(raw || 0) * 100)
              : f.type === "number"
                ? Number(raw || 0)
                : raw === "" || raw === null
                  ? f.required
                    ? ""
                    : null
                  : String(raw);
      }
      if (m.invoice)
        values.items = items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit_price_minor: Number(i.unit_price_minor),
        }));
      const response = await fetch(
        "/api/modules/" + moduleKey + (record?.id ? "/" + record.id : ""),
        {
          method: record?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this record.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open={record !== undefined}
      onOpenChange={(v) => {
        if (!v && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-panel">
          <div className="dialog-header">
            <div>
              <Dialog.Title>
                {record?.id ? t("Edit ", "تعديل ") : t("Add ", "إضافة ")}
                {m.label.toLowerCase()}
              </Dialog.Title>
              <Dialog.Description>
                {t(
                  "Changes are saved to your secure database. Required fields are marked *.",
                  "التغييرات بتتحفظ في قاعدة البيانات. الحقول المطلوبة عليها *.",
                )}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close editor">
              <X size={17} />
            </Dialog.Close>
          </div>
          <form className="record-form" onSubmit={submit}>
            <div className="form-grid">
              {m.fields.map((f) =>
                f.type === "boolean" ? (
                  <label className="check-field" key={f.key}>
                    <input
                      type="checkbox"
                      name={f.key}
                      defaultChecked={Boolean(record?.[f.key])}
                    />
                    {ar ? arabicLabels[f.label] || f.label : f.label}
                  </label>
                ) : (
                  <label
                    key={f.key}
                    className={
                      "form-field " + (f.type === "textarea" ? "wide" : "")
                    }
                  >
                    <span>
                      {ar ? arabicLabels[f.label] || f.label : f.label}
                      {f.required ? " *" : ""}
                    </span>
                    {f.type === "textarea" ? (
                      <textarea
                        name={f.key}
                        rows={4}
                        defaultValue={record?.[f.key] || ""}
                        required={f.required}
                        maxLength={10000}
                      />
                    ) : f.type === "select" ? (
                      <select
                        name={f.key}
                        defaultValue={record?.[f.key] || f.options?.[0]}
                        required={f.required}
                      >
                        {f.options?.map((v) => (
                          <option key={v} value={v}>
                            {ar ? arabicStates[v] || pretty(v) : pretty(v)}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "relation" ? (
                      <select
                        name={f.key}
                        defaultValue={record?.[f.key] || ""}
                        required={f.required}
                      >
                        <option value="">{t("Select...", "اختار...")}</option>
                        {relations[f.relation!]?.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={f.key}
                        type={
                          ["money", "number", "percent"].includes(f.type)
                            ? "number"
                            : f.type === "date"
                              ? "date"
                              : f.type === "email"
                                ? "email"
                                : f.type === "url"
                                  ? "url"
                                  : "text"
                        }
                        step={
                          ["money", "percent"].includes(f.type)
                            ? ".01"
                            : f.type === "number"
                              ? "1"
                              : undefined
                        }
                        min={
                          ["money", "number", "percent"].includes(f.type)
                            ? (f.min ?? 0)
                            : undefined
                        }
                        max={f.max}
                        defaultValue={
                          record?.[f.key] !== null &&
                          record?.[f.key] !== undefined
                            ? ["money", "percent"].includes(f.type)
                              ? Number(record[f.key]) / 100
                              : record[f.key]
                            : ["money", "number", "percent"].includes(f.type)
                              ? 0
                              : ""
                        }
                        required={f.required}
                        maxLength={4000}
                      />
                    )}
                  </label>
                ),
              )}
              {m.invoice && (
                <div className="invoice-lines">
                  <h3>{t("Invoice items", "بنود الفاتورة")}</h3>
                  {items.map((item, i) => (
                    <div key={i} className="invoice-line">
                      <label>
                        <span>Description *</span>
                        <input
                          required
                          value={item.description}
                          onChange={(e) =>
                            setItems(
                              items.map((v, j) =>
                                i === j
                                  ? { ...v, description: e.target.value }
                                  : v,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        <span>Qty *</span>
                        <input
                          required
                          type="number"
                          min="1"
                          max="100000"
                          value={item.quantity}
                          onChange={(e) =>
                            setItems(
                              items.map((v, j) =>
                                i === j
                                  ? { ...v, quantity: Number(e.target.value) }
                                  : v,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        <span>Unit EGP *</span>
                        <input
                          required
                          type="number"
                          step=".01"
                          min="0"
                          max="1000000"
                          value={item.unit_price_minor / 100}
                          onChange={(e) =>
                            setItems(
                              items.map((v, j) =>
                                i === j
                                  ? {
                                      ...v,
                                      unit_price_minor: Math.round(
                                        Number(e.target.value) * 100,
                                      ),
                                    }
                                  : v,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        aria-label="Remove invoice line"
                        onClick={() =>
                          setItems(items.filter((_, j) => j !== i))
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={items.length >= 100}
                    onClick={() =>
                      setItems([
                        ...items,
                        { description: "", quantity: 1, unit_price_minor: 0 },
                      ])
                    }
                  >
                    + Add item
                  </button>
                  <div className="invoice-preview-total">
                    <span>
                      {t(
                        "Subtotal (tax calculated on save)",
                        "الإجمالي قبل الضريبة",
                      )}
                    </span>
                    <strong>
                      {money(
                        items.reduce(
                          (a, i) =>
                            a + Number(i.quantity) * Number(i.unit_price_minor),
                          0,
                        ),
                      )}
                    </strong>
                  </div>
                </div>
              )}
            </div>
            {error && (
              <p className="module-error mt-5" role="alert">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <Dialog.Close className="secondary-button" disabled={busy}>
                {t("Cancel", "إلغاء")}
              </Dialog.Close>
              <button className="primary-link" disabled={busy}>
                {busy ? (
                  <LoaderCircle size={16} className="spin" />
                ) : (
                  <Check size={16} />
                )}{" "}
                {t("Save changes", "حفظ التغييرات")}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function CalendarView({
  rows,
  dateField,
  moduleKey,
  month,
  setMonth,
}: {
  rows: Row[];
  dateField: string;
  moduleKey: string;
  month: string;
  setMonth: (m: string) => void;
}) {
  const { ar, t } = useLocale();
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setMonth(d.toISOString().slice(0, 7));
  };
  return (
    <>
      <div className="calendar-controls">
        <button onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeft size={14} />
        </button>
        <strong>
          {first.toLocaleDateString(ar ? "ar-EG" : "en-GB", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </strong>
        <button onClick={() => shift(1)} aria-label="Next month">
          <ChevronRight size={14} />
        </button>
        <button onClick={() => setMonth(new Date().toISOString().slice(0, 7))}>
          {t("Today", "اليوم")}
        </button>
      </div>
      <div className="calendar-scroll">
        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="calendar-header">
              {d}
            </div>
          ))}
          {Array.from(
            { length: Math.ceil((days + offset) / 7) * 7 },
            (_, i) => {
              const day = i - offset + 1;
              const valid = day > 0 && day <= days;
              const date = month + "-" + String(day).padStart(2, "0");
              return (
                <div
                  className={
                    "calendar-day " +
                    (date === new Date().toISOString().slice(0, 10)
                      ? "today"
                      : "")
                  }
                  key={i}
                >
                  {valid && (
                    <>
                      <span>{day}</span>
                      {rows
                        .filter((r) => r[dateField] === date)
                        .map((row) => (
                          <Link
                            key={row.id}
                            className="calendar-event"
                            href={"/dashboard/" + moduleKey + "/" + row.id}
                          >
                            {tableLabel(row)}
                          </Link>
                        ))}
                    </>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    </>
  );
}
function TimelineView({ rows }: { rows: Row[] }) {
  const dates = rows
    .flatMap((r) => [r.start_date, r.deadline])
    .filter(Boolean)
    .map((d) => new Date(d).getTime());
  const min = Math.min(...dates);
  const max = Math.max(...dates, min + 86400000);
  return (
    <div className="timeline-list">
      {rows.map((row) => {
        const start = row.start_date ? new Date(row.start_date).getTime() : min;
        const end = row.deadline ? new Date(row.deadline).getTime() : start;
        return (
          <div className="timeline-row" key={row.id}>
            <div>
              <Link href={"/dashboard/projects/" + row.id}>
                <strong>{row.name}</strong>
              </Link>
              <p>
                {row.start_date || "No start"} → {row.deadline || "No deadline"}
              </p>
            </div>
            <div className="timeline-track">
              {Number.isFinite(start) && (
                <div
                  className="timeline-bar"
                  style={{
                    left: ((start - min) / (max - min)) * 100 + "%",
                    width:
                      Math.max(2, ((end - start) / (max - min)) * 100) + "%",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function UploadDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bucket, setBucket] = useState("business-files");
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-panel">
          <div className="dialog-header">
            <div>
              <Dialog.Title>Upload file</Dialog.Title>
              <Dialog.Description>
                Private storage. Maximum 10 MB per file.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button">
              <X size={17} />
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const response = await fetch("/api/files", {
                  method: "POST",
                  body: new FormData(e.currentTarget),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                if (result.mediaUrl) {
                  await navigator.clipboard.writeText(result.mediaUrl);
                  setError(
                    "Uploaded. The media URL was copied. Paste it into a portfolio thumbnail, gallery image or service image. It remains private until linked to published content.",
                  );
                } else onSaved();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="form-field">
              <span>Storage destination</span>
              <select
                name="bucket"
                value={bucket}
                onChange={(e) => setBucket(e.target.value)}
              >
                <option value="business-files">Private business file</option>
                <option value="portfolio">Portfolio / service image</option>
              </select>
            </label>
            <div className="upload-zone">
              <Upload size={30} className="mx-auto text-blue-300" />
              <p>
                {bucket === "portfolio"
                  ? "JPEG, PNG or WebP. Drafts remain private."
                  : "Images, PDF, TXT, CSV, DOCX or XLSX."}
              </p>
              <input
                type="file"
                name="file"
                required
                accept={
                  bucket === "portfolio"
                    ? "image/jpeg,image/png,image/webp"
                    : ".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv,.docx,.xlsx"
                }
              />
            </div>
            {bucket === "business-files" && (
              <>
                <label className="form-field mb-5">
                  <span>File name *</span>
                  <input name="name" required maxLength={200} />
                </label>
                <label className="form-field">
                  <span>Folder</span>
                  <input name="folder" maxLength={200} />
                </label>
              </>
            )}
            {error && (
              <p className="module-note mt-5" role="status">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <Dialog.Close className="secondary-button">Close</Dialog.Close>
              <button disabled={busy} className="primary-link">
                {busy ? (
                  <LoaderCircle className="spin" size={15} />
                ) : (
                  <Upload size={15} />
                )}
                Upload file
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function InviteDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<Row[]>([]);
  useEffect(() => {
    if (open)
      fetch("/api/relations?table=roles")
        .then((r) => r.json())
        .then((d) => setRoles(d.rows || []));
  }, [open]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-panel">
          <div className="dialog-header">
            <div>
              <Dialog.Title>Invite team member</Dialog.Title>
              <Dialog.Description>
                This sends an invitation email. Confirm the recipient and role
                before sending.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button">
              <X size={17} />
            </Dialog.Close>
          </div>
          <form
            className="record-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const data = Object.fromEntries(new FormData(e.currentTarget));
                const r = await fetch("/api/team", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                const result = await r.json();
                if (!r.ok) throw new Error(result.error);
                onSaved();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Invitation failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-grid">
              <label className="form-field wide">
                <span>Full name *</span>
                <input name="name" required />
              </label>
              <label className="form-field wide">
                <span>Email recipient *</span>
                <input name="email" type="email" required />
              </label>
              <label className="form-field wide">
                <span>Role *</span>
                <select name="role_id" required>
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option value={r.id} key={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p className="module-error mt-5">{error}</p>}
            <div className="dialog-actions">
              <Dialog.Close className="secondary-button">Cancel</Dialog.Close>
              <button className="primary-link" disabled={busy}>
                Send invitation <ArrowUpRight size={16} />
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
