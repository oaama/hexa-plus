"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase/client";
import { useLocale } from "./dashboard-shell";
type Row = {
  id: string;
  title: string;
  body: string;
  link: string;
  read_at: string | null;
  created_at: string;
};
export function NotificationCenter({ rows }: { rows: Row[] }) {
  const { ar, t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const db = browserSupabase();
    const channel = db
      .channel("own-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => router.refresh(),
      )
      .on("system", {}, (event) => {
        if (event.extension === "postgres_changes" && event.status === "ok")
          router.refresh();
      })
      .subscribe();
    return () => {
      db.removeChannel(channel);
    };
  }, [router]);
  async function mark(ids: string[]) {
    setBusy(true);
    setError("");
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error);
    else router.refresh();
    setBusy(false);
  }
  const unread = rows.filter((r) => !r.read_at);
  return (
    <>
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">
            {t("STAY IN THE LOOP", "متابعين كل جديد")}
          </span>
          <h1>
            {t("Notifications", "الإشعارات")}
            <span className="count-badge">{unread.length}</span>
          </h1>
          <p>
            {t(
              "Your 100 most recent updates. Deadline notices are checked when you visit the workspace.",
              "آخر ١٠٠ إشعار. المواعيد القريبة بتتراجع عند زيارة مساحة العمل.",
            )}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => mark(unread.map((r) => r.id))}
          >
            {t("Mark all read", "تعليم الكل كمقروء")}
          </button>
        )}
      </div>
      {error && <p className="module-error">{error}</p>}
      {rows.length ? (
        <div className="notification-list">
          {rows.map((row) => (
            <article
              className={"notification-row " + (!row.read_at ? "unread" : "")}
              key={row.id}
            >
              <Bell size={19} />
              <div>
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                {row.link?.startsWith("/dashboard/") && (
                  <Link className="text-link text-[9px]" href={row.link}>
                    {t("Open record", "فتح السجل")}
                    <ArrowUpRight size={13} />
                  </Link>
                )}
                <small>
                  {new Date(row.created_at).toLocaleString(
                    ar ? "ar-EG" : "en-GB",
                    {
                      timeZone: "Africa/Cairo",
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  )}
                </small>
              </div>
              {!row.read_at && (
                <button disabled={busy} onClick={() => mark([row.id])}>
                  {t("Mark read", "تمت القراءة")}
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="dashboard-card dashboard-empty">
          <div className="empty-glyph">
            <Check size={22} />
          </div>
          <h3>{t("You are all caught up.", "متابع كل الجديد.")}</h3>
          <p>
            {t(
              "New inquiries, assignments and work updates will appear here.",
              "الاستفسارات الجديدة والمهام وتحديثات الشغل هتظهر هنا.",
            )}
          </p>
        </div>
      )}
    </>
  );
}
