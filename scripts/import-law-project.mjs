import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
process.loadEnvFile(".env.local");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVER_KEY, { auth: { persistSession: false } });
const p = { slug: "law-firm-website", title: "Law Firm Website", title_ar: "موقع مكتب محاماة", category: "Website development", category_ar: "تطوير المواقع", industry: "Legal services", industry_ar: "الخدمات القانونية",
  description: "An Arabic-first, right-to-left website for a lawyer's practice, with services, an about section and contact. All content is edited from a single configuration file.",
  description_ar: "موقع عربي بالكامل لمكتب محاماة، فيه الخدمات ونبذة عن المحامية وطرق التواصل. كل المحتوى بيتعدل من ملف إعدادات واحد.",
  external_url: null, sort_order: 7 };
const key = "showcase/law-firm-website-v2.jpg";
const { error: ue } = await db.storage.from("portfolio").upload(key, fs.readFileSync("supabase/seed-assets/hexa-project-law.jpg"), { contentType: "image/jpeg", upsert: true });
if (ue) throw ue;
const thumbnail_url = db.storage.from("portfolio").getPublicUrl(key).data.publicUrl;
const row = { ...p, thumbnail_url, featured: true, published: true };
const { data: ex } = await db.from("portfolio_projects").select("id").eq("slug", p.slug).maybeSingle();
const r = ex ? await db.from("portfolio_projects").update(row).eq("id", ex.id).select("id,slug,published") : await db.from("portfolio_projects").insert(row).select("id,slug,published");
if (r.error) throw r.error;
console.log(JSON.stringify(r.data));
