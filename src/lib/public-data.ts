import { supabase, configured } from "./supabase/server";
import { serviceCatalog } from "./service-catalog";
export async function publicData() {
  if (!configured())
    return {
      services: serviceCatalog,
      portfolio: [],
      testimonials: [],
      settings: {} as Record<string, string>,
      connected: false,
    };
  const db = await supabase();
  const [s, p, t, w] = await Promise.all([
    db.from("published_services").select("*").order("sort_order"),
    db
      .from("published_portfolio")
      .select(
        "id,title,slug,client_name,category,industry,description,thumbnail_url,featured,title_ar,description_ar,category_ar,industry_ar,external_url",
      )
      .order("sort_order"),
    db.from("published_testimonials").select("id,name,company,quote,quote_ar"),
    db.from("published_settings").select("key,value"),
  ]);
  if (s.error || p.error || t.error || w.error)
    throw new Error("Website content is temporarily unavailable.");
  return {
    services: s.data || [],
    portfolio: p.data || [],
    testimonials: t.data || [],
    settings: Object.fromEntries(
      (w.data || []).map((v) => [v.key, v.value]),
    ) as Record<string, string>,
    connected: true,
  };
}
