import { createClient } from "@supabase/supabase-js";
import { serviceCatalog } from "../src/lib/service-catalog";
process.loadEnvFile(".env.local");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVER_KEY!,
  { auth: { persistSession: false } },
);
const { error } = await db
  .from("services")
  .upsert(serviceCatalog, { onConflict: "slug", ignoreDuplicates: true });
if (error) throw new Error(error.message);
const settings = [
  {
    key: "hero_title",
    value: "Your vision.\nOur digital\nexecution.",
    is_public: true,
  },
  {
    key: "hero_description",
    value:
      "We combine technology, creativity, and strategy to build digital experiences that move businesses forward.",
    is_public: true,
  },
  { key: "address", value: "Minya, Egypt", is_public: true },
];
const { error: e } = await db
  .from("website_settings")
  .upsert(settings, { onConflict: "key", ignoreDuplicates: true });
if (e) throw new Error(e.message);
console.log(
  "Seeded requested service catalog and public identity only. No demo clients, testimonials, projects or revenue.",
);
