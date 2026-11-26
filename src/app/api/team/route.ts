import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { apiUser, apiError, sameOrigin, readJSON } from "@/lib/api";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { db } = await apiUser();
    const { data: allowed } = await db.rpc("is_super_admin");
    if (!allowed) throw new Error("PERMISSION_DENIED");
    if (!process.env.SUPABASE_SERVER_KEY)
      throw new Error(
        "Invitations require the server credential to be configured.",
      );
    const values = z
      .object({
        name: z.string().trim().min(2).max(200),
        email: z.email().max(254),
        role_id: z.uuid(),
      })
      .strict()
      .parse(await readJSON(request));
    const { data: role } = await db
      .from("roles")
      .select("id")
      .eq("id", values.role_id)
      .single();
    if (!role) throw new Error("Choose a valid role.");
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVER_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await admin.auth.admin.inviteUserByEmail(
      values.email,
      {
        data: { name: values.name },
        redirectTo:
          (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin) +
          "/auth/confirm",
      },
    );
    if (error) throw new Error(error.message);
    const { error: e } = await admin
      .from("profiles")
      .upsert({ id: data.user.id, ...values, status: "active" });
    if (e)
      throw new Error(
        "The invitation was created but the profile could not be saved. Ask the administrator to complete the profile setup.",
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
