"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Contact,
  KanbanSquare,
  CheckSquare,
  BriefcaseBusiness,
  Palette,
  Megaphone,
  Receipt,
  FolderOpen,
  Settings,
  Activity,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  ChevronRight,
  Languages,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { modules } from "@/lib/modules";
const Locale = createContext({
  ar: false,
  t: (en: string, arabic: string) => en,
});
export const useLocale = () => useContext(Locale);
const icons: Record<string, React.ElementType> = {
  clients: Contact,
  leads: KanbanSquare,
  projects: BriefcaseBusiness,
  tasks: CheckSquare,
  team: Users,
  services: Palette,
  portfolio: FolderOpen,
  content: CalendarDays,
  campaigns: Megaphone,
  invoices: Receipt,
  files: FolderOpen,
  settings: Settings,
  activity: Activity,
  notifications: Bell,
  permissions: ShieldCheck,
};
const groups = [
  ["WORKSPACE", ["clients", "leads", "projects", "tasks", "team"]],
  [
    "CONTENT & GROWTH",
    ["services", "portfolio", "content", "campaigns", "social"],
  ],
  ["BUSINESS", ["invoices", "payments", "expenses", "files"]],
  [
    "ADMINISTRATION",
    ["notifications", "activity", "settings", "roles", "permissions"],
  ],
] as [string, string[]][];
export function DashboardShell({
  children,
  name,
  permissions,
  unread,
}: {
  children: React.ReactNode;
  name: string;
  permissions: string[];
  unread: number;
}) {
  const path = usePathname();
  const [ar, setAr] = useState(false);
  const [light, setLight] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => {
    setAr(localStorage.getItem("hexa-lang") === "ar");
    setLight(localStorage.getItem("hexa-theme") === "light");
  }, []);
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const allowed = (key: string) =>
    permissions.includes("*") ||
    permissions.includes(modules[key]?.permission + ".read");
  const active = path.split("/")[2];
  return (
    <Locale.Provider value={{ ar, t }}>
      <div
        className={"dashboard " + (light ? "light" : "")}
        dir={ar ? "rtl" : "ltr"}
      >
        <a href="#dashboard-main" className="skip-link">
          Skip to workspace content
        </a>
        {menu && (
          <button
            className="sidebar-backdrop"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={"dashboard-sidebar " + (menu ? "visible" : "")}>
          <button
            className="sidebar-close"
            aria-label="Close sidebar"
            onClick={() => setMenu(false)}
          >
            <X size={15} />
          </button>
          <Link href="/dashboard" className="dashboard-brand">
            <img
              src="/hexa-mark.png"
              width="40"
              height="41"
              alt="HEXA PLUS"
            />
            <span>
              HEXA<span>PLUS</span>
              <small>{t("WORKSPACE", "مساحة العمل")}</small>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className={"sidebar-link " + (!active ? "active" : "")}
            onClick={() => setMenu(false)}
          >
            <LayoutDashboard size={18} />
            {t("Overview", "نظرة عامة")}
          </Link>
          <Link
            href="/dashboard/reports"
            className={"sidebar-link " + (active === "reports" ? "active" : "")}
            onClick={() => setMenu(false)}
          >
            <Activity size={18} />
            {t("Reports", "التقارير")}
          </Link>
          {groups.map(([title, keys]) => (
            <div className="sidebar-group" key={title}>
              <span>
                {title === "WORKSPACE"
                  ? t(title, "مساحة العمل")
                  : title === "CONTENT & GROWTH"
                    ? t(title, "المحتوى والنمو")
                    : title === "BUSINESS"
                      ? t(title, "الأعمال")
                      : t(title, "الإدارة")}
              </span>
              {keys.filter(allowed).map((key) => {
                const Icon = icons[key] || FolderOpen;
                return (
                  <Link
                    href={"/dashboard/" + key}
                    key={key}
                    className={
                      "sidebar-link " + (active === key ? "active" : "")
                    }
                    onClick={() => setMenu(false)}
                  >
                    <Icon size={17} />
                    {ar ? modules[key].ar : modules[key].label}
                    {key === "notifications" && unread > 0 && <b>{unread}</b>}
                  </Link>
                );
              })}
            </div>
          ))}
          <div className="sidebar-footer">
            <Link href="/" target="_blank">
              {t("View website", "عرض الموقع")}
              <ArrowUpRight size={16} />
            </Link>
            <div className="team-identity">
              <span>{name.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{name}</strong>
                <small>{t("HEXA PLUS team", "فريق هيكسا بلس")}</small>
              </div>
              <form action={logout}>
                <button title={t("Sign out", "تسجيل الخروج")}>
                  <LogOut size={17} />
                </button>
              </form>
            </div>
          </div>
        </aside>
        <div className="dashboard-body">
          <header className="dashboard-topbar">
            <div className="breadcrumb">
              <button
                className="dashboard-menu"
                aria-label="Open sidebar"
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X /> : <Menu />}
              </button>
              <Link href="/dashboard">{t("Workspace", "مساحة العمل")}</Link>
              <ChevronRight size={14} />
              <span>
                {active
                  ? (ar ? modules[active]?.ar : modules[active]?.label) ||
                    active
                  : t("Overview", "نظرة عامة")}
              </span>
            </div>
            <div className="topbar-actions">
              <form className="global-search" action="/dashboard/search">
                <Search size={15} />
                <input
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t(
                    "Search workspace...",
                    "ابحث في مساحة العمل...",
                  )}
                  aria-label={t("Search workspace", "ابحث في مساحة العمل")}
                />
                <kbd>↵</kbd>
              </form>
              <button
                aria-label={t("Switch to Arabic", "Switch to English")}
                title={t("Switch to Arabic", "Switch to English")}
                onClick={() => {
                  setAr(!ar);
                  localStorage.setItem("hexa-lang", !ar ? "ar" : "en");
                }}
              >
                <Languages size={18} />
              </button>
              <button
                aria-label={t("Toggle theme", "تغيير المظهر")}
                onClick={() => {
                  setLight(!light);
                  localStorage.setItem("hexa-theme", !light ? "light" : "dark");
                }}
              >
                {light ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <Link
                href="/dashboard/notifications"
                className="notification-button"
                aria-label={t("Notifications", "الإشعارات")}
              >
                <Bell size={18} />
                {unread > 0 && <i />}
              </Link>
              <span className="profile-avatar">
                {name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </header>
          <main id="dashboard-main" className="dashboard-main">
            {children}
          </main>
          <footer className="dashboard-footer">
            <span>
              HEXA PLUS / {t("Workspace", "مساحة العمل")}
            </span>
            <span>{t("Private. Connected. Yours.", "خاص. متصل. لك.")}</span>
          </footer>
        </div>
      </div>
    </Locale.Provider>
  );
}
