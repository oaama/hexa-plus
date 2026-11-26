import { publicData as originalData } from "./public-data";
import copy from "./ar-copy.json";
export function translateArabic(value: unknown): string {
  const text = String(value || "");
  return text
    .split("\n")
    .map((line) => (copy as Record<string, string>)[line] || line)
    .join("\n");
}
export async function publicData(opts?: { includeDrafts?: boolean }) {
  const data = await originalData(opts);
  const settings: Record<string, string> = {};
  for (const [key, value] of Object.entries(data.settings)) {
    if (key.endsWith("_ar")) {
      settings[key.slice(0, -3)] = value;
    } else if (
      key === "hero_title" ||
      key === "hero_description" ||
      key.startsWith("page_")
    ) {
      continue;
    } else if (!(key + "_ar" in data.settings)) {
      settings[key] = key === "address" ? translateArabic(value) : value;
    }
  }
  return {
    ...data,
    services: data.services.map((s) => ({
      ...s,
      name: s.name_ar || translateArabic(s.name),
      description: s.description_ar || translateArabic(s.description),
      benefits: s.benefits_ar || translateArabic(s.benefits),
      deliverables: s.deliverables_ar || translateArabic(s.deliverables),
      workflow: s.workflow_ar || translateArabic(s.workflow),
      pricing: s.pricing_ar || s.pricing,
    })),
    portfolio: data.portfolio.map((p) => ({
      ...p,
      title: p.title_ar || p.title,
      description: p.description_ar || p.description,
      category: p.category_ar || p.category,
      industry: p.industry_ar || p.industry,
    })),
    testimonials: data.testimonials
      .filter((t) => t.quote_ar)
      .map((t) => ({ ...t, quote: t.quote_ar })),
    settings,
  };
}
