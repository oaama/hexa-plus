import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
process.loadEnvFile(".env.local");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVER_KEY!,
  { auth: { persistSession: false } },
);
// Import only the three links supplied by the owner. Screenshots show public pages, never authenticated project data.
const projects = [
  {
    title: "Matcha Café",
    title_ar: "ماتشا كافيه",
    slug: "matcha-cafe",
    category: "Digital solutions",
    category_ar: "الحلول الرقمية",
    industry: "Food & beverage",
    industry_ar: "المطاعم والمقاهي",
    description:
      "An Arabic café menu with category navigation, product listings and an order basket.",
    description_ar:
      "قائمة مقهى عربية مع تصنيفات للمنتجات وعرض للأصناف وسلة للطلبات.",
    external_url: "https://matcha-cafe-two.vercel.app/",
    featured: true,
    published: true,
    sort_order: 0,
    screenshot: "/downloads/hexa-project-matcha.jpg",
  },
  {
    title: "Backstage",
    title_ar: "باكستيج",
    slug: "backstage",
    category: "Digital solutions",
    category_ar: "الحلول الرقمية",
    industry: "Arts & culture",
    industry_ar: "الفنون والثقافة",
    description:
      "A theatre website with show listings, cast navigation and booking entry points.",
    description_ar: "موقع مسرحي يعرض العروض وطاقم العمل وروابط بدء الحجز.",
    external_url: "https://backstage-company-eight.vercel.app/",
    featured: true,
    published: true,
    sort_order: 1,
    screenshot: "/downloads/hexa-project-backstage.jpg",
  },
  {
    title: "Faroj Basha",
    title_ar: "فروج باشا",
    slug: "faroj-basha",
    category: "Digital solutions",
    category_ar: "الحلول الرقمية",
    industry: "Food & beverage",
    industry_ar: "المطاعم والمقاهي",
    description:
      "Inventory management system. Public login reviewed only; further approved project material is awaited.",
    description_ar:
      "نظام لإدارة المخزون. تمت مراجعة صفحة الدخول العامة فقط، وننتظر المواد المعتمدة لعرض المشروع.",
    external_url: "https://faroj-basha-systym.vercel.app/login",
    featured: false,
    published: false,
    sort_order: 2,
    screenshot: null,
  },
];
for (const { screenshot, ...project } of projects) {
  const { data: existing } = await db
    .from("portfolio_projects")
    .select("id")
    .eq("slug", project.slug)
    .maybeSingle();
  if (existing) {
    console.log("Preserved existing", project.slug);
    continue;
  }
  let thumbnail_url = null;
  if (screenshot) {
    const key = "showcase/" + project.slug + ".jpg";
    const { error } = await db.storage
      .from("portfolio")
      .upload(key, fs.readFileSync(screenshot), {
        contentType: "image/jpeg",
        upsert: false,
      });
    if (error && !error.message.toLowerCase().includes("already exists"))
      throw error;
    thumbnail_url = db.storage.from("portfolio").getPublicUrl(key)
      .data.publicUrl;
  }
  const { data, error } = await db
    .from("portfolio_projects")
    .insert({ ...project, thumbnail_url })
    .select("id,slug,published");
  if (error) throw error;
  console.log("Imported supplied project", data);
}
process.exit(0);
