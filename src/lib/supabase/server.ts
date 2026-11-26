import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
export async function supabase() {
  if (!configured()) throw new Error("The database is not configured yet.");
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Server Components cannot set cookies. The proxy refreshes them. */
          }
        },
      },
    },
  );
}
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVER_KEY;
  if (!url || !key) throw new Error("The database is not configured yet.");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
