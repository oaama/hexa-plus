import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
process.loadEnvFile(".env.local");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVER_KEY, { auth: { persistSession: false } });
const projects = [
  { slug: "mr-vet-dashboard", file: "/downloads/project-mr-vet.png", key: "showcase/mr-vet-dashboard.png", sort_order: 8,
    title: "Mr Vet Admin Dashboard", title_ar: "لوحة تحكم مستر فيت",
    category: "Digital solutions", category_ar: "الحلول الرقمية",
    industry: "E-learning", industry_ar: "التعليم الإلكتروني",
    description: "Admin dashboard for the Mr Vet e-learning platform: manage users, courses and platform activity from one place.",
    description_ar: "لوحة تحكم لمنصة مستر فيت التعليمية: إدارة المستخدمين والكورسات ونشاط المنصة من مكان واحد." },
  { slug: "tabibak-medical-guide", file: "/downloads/project-dr-angelo.png", key: "showcase/tabibak-medical-guide.png", sort_order: 9,
    title: "Tabibak - Smart Medical Guide", title_ar: "طبيبك - دليلك الطبي الذكي",
    category: "Digital solutions", category_ar: "الحلول الرقمية",
    industry: "Healthcare", industry_ar: "الرعاية الصحية",
    description: "An Arabic smart medical platform connecting patients with specialist doctors, with AI-assisted tools like medication search and symptom-based recommendations.",
    description_ar: "منصة طبية عربية ذكية تربط المرضى بالأطباء المتخصصين، مع أدوات بالذكاء الاصطناعي مثل البحث عن الأدوية وتوصيات حسب الأعراض." },
  { slug: "sidra-agency-website", file: "/downloads/project-sidra.png", key: "showcase/sidra-agency-website.png", sort_order: 10,
    title: "SIDRA Agency Website", title_ar: "موقع وكالة سيدرا",
    category: "Website development", category_ar: "تطوير المواقع",
    industry: "Digital services", industry_ar: "الخدمات الرقمية",
    description: "Company website for SIDRA, a digital agency: services, work and contact, in Arabic and English.",
    description_ar: "موقع شركة سيدرا للخدمات الرقمية: الخدمات والأعمال والتواصل، بالعربية والإنجليزية." },
];
for (const p of projects) {
  const { file, key, ...row } = p;
  const { error: ue } = await db.storage.from("portfolio").upload(key, fs.readFileSync(file), { contentType: "image/png", upsert: true });
  if (ue) throw ue;
  const thumbnail_url = db.storage.from("portfolio").getPublicUrl(key).data.publicUrl;
  const full = { ...row, thumbnail_url, external_url: null, featured: false, published: true };
  const { data: ex } = await db.from("portfolio_projects").select("id").eq("slug", row.slug).maybeSingle();
  const r = ex ? await db.from("portfolio_projects").update(full).eq("id", ex.id).select("slug,published") : await db.from("portfolio_projects").insert(full).select("slug,published");
  if (r.error) throw r.error;
  console.log(JSON.stringify(r.data));
}
