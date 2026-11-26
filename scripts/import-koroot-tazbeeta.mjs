import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
process.loadEnvFile(".env.local");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVER_KEY, { auth: { persistSession: false } });
async function upload(key, file) {
  const { error } = await db.storage.from("portfolio").upload(key, fs.readFileSync(file), { contentType: "image/png", upsert: true });
  if (error) throw error;
  return db.storage.from("portfolio").getPublicUrl(key).data.publicUrl;
}
const projects = [
  { slug: "koroot-loyalty-cards", sort_order: 11,
    title: "Koroot - Loyalty Cards for Cafes", title_ar: "كروت - كروت ولاء للكافيهات",
    category: "Digital solutions", category_ar: "الحلول الرقمية",
    industry: "Cafes & restaurants", industry_ar: "الكافيهات والمطاعم",
    description: "A loyalty-card system for cafes: the customer joins with their phone number and gets a QR stamp card, the cashier stamps it, and after a number of visits the owner sets, the customer earns a reward. The owner can see customers who stopped visiting and message them on WhatsApp.",
    description_ar: "نظام كروت ولاء للكافيهات: العميل يسجل برقم موبايله ويجيله كارت بـ QR، الكاشير يختم، وبعد عدد الزيارات اللي صاحب الكافيه يحدده، العميل ياخد مكافأة. صاحب الكافيه يشوف العملاء اللي بطلوا ييجوا ويكلمهم على واتساب.",
    challenge: "Cafes lose regular customers without noticing, and paper loyalty cards get lost or forgotten.",
    challenge_ar: "الكافيهات بتخسر عملائها الدائمين من غير ما تاخد بالها، وكروت الولاء الورقية بتضيع أو بتتنسى.",
    solution: "A lightweight web app: no app install for the customer, registration by phone number, QR stamping for the cashier, and a simple panel for the owner.",
    solution_ar: "تطبيق ويب خفيف: العميل مش محتاج ينزل حاجة، التسجيل برقم الموبايل، الختم بالـ QR للكاشير، ولوحة بسيطة لصاحب الكافيه.",
    results: "Live and free to use, running on serverless infrastructure at zero hosting cost. WhatsApp win-back messages go through a small bridge service.",
    results_ar: "شغال ومجاني، على بنية سيرفرلس بتكلفة استضافة صفر. رسائل واتساب للعملاء المتوقفين بتعدي عن طريق خدمة ربط صغيرة.",
    services_provided: "Product design, web application, owner panel, WhatsApp integration",
    services_provided_ar: "تصميم المنتج، تطبيق الويب، لوحة صاحب الكافيه، تكامل واتساب",
    technologies: "Cloudflare Workers, Durable Objects (SQLite), JavaScript, WhatsApp Web bridge",
    project_date: null, external_url: "https://koroot.angluosr.workers.dev",
    thumb: ["showcase/koroot-loyalty-cards.png", "/downloads/cloud-browser-20261126-033605.png"],
    media: [] },
  { slug: "tazbeeta-home-services", sort_order: 12,
    title: "Tazbeeta - Home Services Platform", title_ar: "تظبيطة - منصة خدمات منزلية",
    category: "Mobile applications", category_ar: "تطبيقات الموبايل",
    industry: "Home services", industry_ar: "الخدمات المنزلية",
    description: "A home-services platform: a customer app for booking technicians, a technician app, and a nine-section admin dashboard covering requests, technicians, users, services, activity, conversations, feedback and content. In Arabic and English.",
    description_ar: "منصة خدمات منزلية: تطبيق للعميل لحجز الفنيين، وتطبيق للفني، ولوحة تحكم من تسع أقسام بتغطي الطلبات والفنيين والمستخدمين والخدمات والنشاط والمحادثات والتقييمات والمحتوى. بالعربية والإنجليزية.",
    challenge: "Home-service bookings often run on phone calls and paper notes, with no clear request status for the customer or the company.",
    challenge_ar: "حجوزات الخدمات المنزلية غالبًا بتتم بالتليفون وورق، من غير حالة واضحة للطلب للعميل أو للشركة.",
    solution: "A pair of Flutter apps for customers and technicians, a Node.js API with Supabase authentication and PostgreSQL storage, and a browser admin dashboard.",
    solution_ar: "تطبيقين فلاتر للعميل والفني، وواجهة برمجية Node.js مع توثيق Supabase وتخزين PostgreSQL، ولوحة تحكم من المتصفح.",
    results: "Working demo with sample data and a fully tested API lifecycle; production deployment is the next step.",
    results_ar: "ديمو شغال ببيانات تجريبية ودورة طلبات مختبرة بالكامل؛ الخطوة الجاية هي النشر الفعلي.",
    services_provided: "Mobile apps, backend API, admin dashboard",
    services_provided_ar: "تطبيقات موبايل، واجهة برمجية، لوحة تحكم",
    technologies: "Flutter, Node.js, Supabase Auth, PostgreSQL",
    project_date: null, external_url: null,
    thumb: ["showcase/tazbeeta-home-services.png", "/downloads/project-tazbeeta-dash.png"],
    media: [["showcase/tazbeeta-admin-login.png", "/downloads/project-tazbeeta-admin.png", "Tazbeeta admin login, in English and Arabic"]] },
];
for (const p of projects) {
  const { thumb, media, ...row } = p;
  const thumbnail_url = await upload(thumb[0], thumb[1]);
  const full = { ...row, thumbnail_url, featured: false, published: false };
  const { data: ex } = await db.from("portfolio_projects").select("id").eq("slug", row.slug).maybeSingle();
  const r = ex
    ? await db.from("portfolio_projects").update(full).eq("id", ex.id).select("id,slug,published")
    : await db.from("portfolio_projects").insert(full).select("id,slug,published");
  if (r.error) throw r.error;
  const pid = r.data[0].id;
  console.log("project", JSON.stringify(r.data));
  let i = 0;
  for (const [key, file, alt] of media) {
    const url = await upload(key, file);
    const m = await db.from("portfolio_media").insert({ portfolio_project_id: pid, url, alt, sort_order: ++i }).select("id");
    if (m.error) throw m.error;
    console.log("media", key, "ok");
  }
}
