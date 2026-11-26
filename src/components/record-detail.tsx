"use client";
import { arabicLabels, arabicStates } from "@/lib/rtl";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Pencil,
  Plus,
  Check,
} from "lucide-react";
import { modules, tableLabel } from "@/lib/modules";
import { money } from "@/lib/finance";
import { RecordEditor } from "./module-workspace";
import { useLocale } from "./dashboard-shell";
type Row = Record<string, any>;
export function RecordDetail({
  moduleKey,
  row,
  canWrite,
  relations,
  related,
  activity,
}: {
  moduleKey: string;
  row: Row;
  canWrite: boolean;
  relations: Record<string, string>;
  related: { title: string; key: string; rows: Row[] }[];
  activity: Row[];
}) {
  const { ar, t } = useLocale();
  const router = useRouter();
  const m = modules[moduleKey];
  const [edit, setEdit] = useState(false);
  const [toast, setToast] = useState("");
  const [child, setChild] = useState<{ key: string; row: Row | null } | null>(
    null,
  );
  function saved() {
    setEdit(false);
    setChild(null);
    setToast(t("Changes saved.", "تم حفظ التغييرات."));
    setTimeout(() => setToast(""), 4000);
    router.refresh();
  }
  return (
    <>
      <Link
        href={"/dashboard/" + moduleKey}
        className="text-link mb-6 pt-0 text-[10px]"
      >
        <ArrowLeft size={13} />
        {t("Back to ", "رجوع إلى ")}
        {ar ? m.ar : m.label}
      </Link>
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">
            {ar ? m.ar : m.label} / {t("DETAILS", "التفاصيل")}
          </span>
          <h1>{tableLabel(row)}</h1>
          <p>
            {t("Created ", "تاريخ الإضافة ")}
            {new Date(row.created_at).toLocaleDateString(
              ar ? "ar-EG" : "en-GB",
              { timeZone: "Africa/Cairo" },
            )}
          </p>
        </div>
        <div className="detail-actions">
          {moduleKey === "tasks" && (
            <select
              className="status-control"
              aria-label="Update task status"
              value={row.status}
              onChange={async (e) => {
                const response = await fetch(
                  "/api/tasks/" + row.id + "/status",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: e.target.value }),
                  },
                );
                const data = await response.json();
                if (!response.ok) setToast(data.error);
                else saved();
              }}
            >
              {["to_do", "in_progress", "in_review", "completed"].map((v) => (
                <option key={v} value={v}>
                  {ar ? arabicStates[v] : v.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          )}
          {canWrite && !m.readOnly && (
            <button
              className="secondary-button flex items-center gap-2"
              onClick={() => setEdit(true)}
            >
              <Pencil size={13} />
              {t("Edit record", "تعديل السجل")}
            </button>
          )}
          {m.invoice && (
            <a
              href={"/api/invoices/" + row.id + "/pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-link compact"
            >
              <Download size={13} />
              {t("Download PDF", "تحميل PDF")}
            </a>
          )}
          {moduleKey === "files" && (
            <button
              className="primary-link compact"
              onClick={async () => {
                const response = await fetch("/api/files/" + row.id);
                const data = await response.json();
                if (response.ok)
                  window.open(data.url, "_blank", "noopener,noreferrer");
                else setToast(data.error);
              }}
            >
              <Download size={13} />
              {t("Open file", "فتح الملف")}
            </button>
          )}
        </div>
      </div>
      <div className="record-detail-grid">
        <div>
          <section className="dashboard-card">
            <div className="card-heading">
              <h2>{t("Record details", "تفاصيل السجل")}</h2>
              {row.status && (
                <span className={"status-badge " + row.status}>
                  {ar
                    ? arabicStates[row.status] || row.status
                    : row.status.replaceAll("_", " ")}
                </span>
              )}
            </div>
            <dl className="record-fields">
              {m.fields.map((f) => (
                <div
                  key={f.key}
                  className={f.type === "textarea" ? "wide" : ""}
                >
                  <dt>{ar ? arabicLabels[f.label] || f.label : f.label}</dt>
                  <dd>
                    {f.type === "relation" ? (
                      row[f.key] ? (
                        <Link
                          href={
                            "/dashboard/" +
                            (Object.keys(modules).find(
                              (k) => modules[k].table === f.relation,
                            ) || f.relation) +
                            "/" +
                            row[f.key]
                          }
                          className="text-blue-300"
                        >
                          {relations[f.key] || "Restricted / unavailable"}
                        </Link>
                      ) : (
                        "—"
                      )
                    ) : f.type === "money" ? (
                      money(row[f.key] || 0)
                    ) : f.type === "percent" ? (
                      (row[f.key] || 0) / 100 + "%"
                    ) : f.type === "boolean" ? (
                      row[f.key] ? (
                        t("Yes", "نعم")
                      ) : (
                        t("No", "لا")
                      )
                    ) : (
                      row[f.key] || "—"
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          {m.invoice && (
            <section className="dashboard-card related-card">
              <div className="card-heading">
                <h2>Invoice items</h2>
              </div>
              <div className="data-table-wrap border-0 rounded-none">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit EGP</th>
                      <th>Total EGP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(row.items || []).map((i: Row) => (
                      <tr key={i.id}>
                        <td>{i.description}</td>
                        <td>{i.quantity}</td>
                        <td>{money(i.unit_price_minor)}</td>
                        <td>{money(i.quantity * i.unit_price_minor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <dl className="record-fields">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{money(row.subtotal_minor)}</dd>
                </div>
                <div>
                  <dt>Tax</dt>
                  <dd>{money(row.tax_minor)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{money(row.total_minor)}</dd>
                </div>
              </dl>
            </section>
          )}
          {related.map((group) => (
            <section className="dashboard-card related-card" key={group.key}>
              <div className="card-heading">
                <h2>{group.title}</h2>
                {canWrite &&
                  !modules[group.key].readOnly &&
                  !modules[group.key].noCreate &&
                  group.key !== "files" && (
                    <button
                      className="icon-button"
                      aria-label={"Add " + group.title}
                      onClick={() => {
                        const fk =
                          moduleKey === "portfolio"
                            ? "portfolio_project_id"
                            : moduleKey === "tasks"
                              ? "task_id"
                              : moduleKey === "clients"
                                ? "client_id"
                                : moduleKey === "leads"
                                  ? "lead_id"
                                  : moduleKey === "invoices"
                                    ? "invoice_id"
                                    : "project_id";
                        setChild({ key: group.key, row: { [fk]: row.id } });
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  )}
              </div>
              {group.rows.length ? (
                <div className="related-list">
                  {group.rows.map((r) => (
                    <Link
                      href={"/dashboard/" + group.key + "/" + r.id}
                      key={r.id}
                    >
                      <strong>{tableLabel(r)}</strong>
                      <span>
                        {r.status?.replaceAll("_", " ") ||
                          (r.amount_minor && money(r.amount_minor)) ||
                          r.created_at?.slice(0, 10)}
                      </span>
                      <ArrowUpRight size={13} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty min-h-[100px] py-3">
                  <p>
                    {t("No related records yet.", "لا توجد سجلات مرتبطة بعد.")}
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
        <div>
          <section className="dashboard-card">
            <div className="card-heading">
              <h2>{t("Activity timeline", "سجل النشاط")}</h2>
            </div>
            {activity.length ? (
              <div className="activity-list">
                {activity.map((a) => (
                  <div key={a.id}>
                    <i />
                    <div>
                      <strong>{a.action}</strong>
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
              <div className="dashboard-empty min-h-[140px]">
                <p>
                  {t(
                    "No activity is visible in your access scope.",
                    "لا يوجد نشاط ظاهر ضمن صلاحياتك.",
                  )}
                </p>
              </div>
            )}
          </section>
          <section className="dashboard-card related-card">
            <div className="card-heading">
              <h2>{t("Record reference", "مرجع السجل")}</h2>
            </div>
            <p className="text-[9px] px-5 pb-5 break-all">{row.id}</p>
          </section>
        </div>
      </div>
      <RecordEditor
        moduleKey={moduleKey}
        record={edit ? row : undefined}
        onClose={() => setEdit(false)}
        onSaved={saved}
      />
      {child && (
        <RecordEditor
          moduleKey={child.key}
          record={child.row}
          onClose={() => setChild(null)}
          onSaved={saved}
        />
      )}
      {toast && (
        <div className="toast-message" role="status">
          <Check size={14} />
          {toast}
        </div>
      )}
    </>
  );
}
