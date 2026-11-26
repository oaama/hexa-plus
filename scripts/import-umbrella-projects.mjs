import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
process.loadEnvFile(".env.local");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVER_KEY, { auth: { persistSession: false } });
// Public, owner-built projects. Screenshots show public pages only. No invented metrics or client claims.
const projects = [
  { slug: "zone-a-academy", title: "ZONE A Academy", title_ar: "منصة زون إيه التعليمية", category: "Digital solutions", category_ar: "الحلول الرقمية", industry: "Education", industry_ar: "التعليم",
    description: "An online learning platform with course pages, student accounts and progress, certificates and an admin dashboard for managing students and course activation. Arabic and English.",
    description_ar: "منصة تعليمية أونلاين فيها صفحات كورسات وحسابات للطلاب ومتابعة تقدمهم وشهادات، مع لوحة تحكم لإدارة الطلاب وتفعيل الكورسات. بالعربية والإنجليزية.",
    external_url: "https://zone-a-platform.onrender.com/", sort_order: 3, shot: "zone" },
  { slug: "rayeq-barber-app", title: "Rayeq", title_ar: "رايق", category: "Mobile applications", category_ar: "تطبيقات الموبايل", industry: "Personal care", industry_ar: "العناية الشخصية",
    description: "A barber booking app concept with a customer side, a barber side and an admin dashboard. The public preview uses sample data only.",
    description_ar: "تطبيق لحجز الحلاقين فيه جانب للعميل وجانب للحلاق ولوحة تحكم للإدارة. المعاينة العامة بتعرض بيانات تجريبية فقط.",
    external_url: "https://rayeq-platform.onrender.com/mobile-demo", sort_order: 4, shot: "rayeq" },
  { slug: "mraya-arts-center", title: "Mraya Arts Center", title_ar: "مركز مرايا للفنون", category: "Digital solutions", category_ar: "الحلول الرقمية", industry: "Arts & culture", industry_ar: "الفنون والثقافة",
    description: "A bilingual website for an arts center, with content sections managed from its own admin dashboard.",
    description_ar: "موقع ثنائي اللغة لمركز فني، وأقسام المحتوى بتتدار من لوحة تحكم خاصة بالمركز.",
    external_url: "https://mraya-company.vercel.app/", sort_order: 5, shot: "mraya" },
  { slug: "engineer-portfolio", title: "Software Engineer Portfolio", title_ar: "بورتفوليو مهندس برمجيات", category: "Website development", category_ar: "تطوير المواقع", industry: "Software engineering", industry_ar: "هندسة البرمجيات",
    description: "A personal portfolio site with a project showcase, a downloadable CV, Arabic and English, and a private dashboard.",
    description_ar: "موقع بورتفوليو شخصي فيه عرض للمشاريع وتحميل السيرة الذاتية بالعربية والإنجليزية، مع لوحة تحكم خاصة.",
    external_url: "https://eng-angluos-rezq.angluosr.workers.dev/", sort_order: 6, shot: "portfolio" },
];
for (const { shot, ...p } of projects) {
  const key = "showcase/" + p.slug + ".jpg";
  const { error: ue } = await db.storage.from("portfolio").upload(key, fs.readFileSync("supabase/seed-assets/hexa-project-" + shot + ".jpg"), { contentType: "image/jpeg", upsert: true });
  if (ue) throw ue;
  const thumbnail_url = db.storage.from("portfolio").getPublicUrl(key).data.publicUrl;
  const row = { ...p, thumbnail_url, featured: true, published: true };
  const { data: ex } = await db.from("portfolio_projects").select("id").eq("slug", p.slug).maybeSingle();
  const r = ex ? await db.from("portfolio_projects").update(row).eq("id", ex.id).select("id,slug,published") : await db.from("portfolio_projects").insert(row).select("id,slug,published");
  if (r.error) throw r.error;
  console.log(ex ? "updated" : "added", JSON.stringify(r.data));
}
