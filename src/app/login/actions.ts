"use server";
import { supabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
export async function login(form: FormData) {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  try {
    const db = await supabase();
    const { error } = await db.auth.signInWithPassword(parsed.data);
    if (error)
      return {
        error: "We could not sign you in. Check your email and password.",
      };
    const { data: p } = await db
      .from("profiles")
      .select("status")
      .eq("id", (await db.auth.getUser()).data.user!.id)
      .single();
    if (!p || p.status !== "active") {
      await db.auth.signOut();
      return { error: "This account has not been granted workspace access." };
    }
  } catch {
    return { error: "Sign-in is not available yet. Please try again later." };
  }
  redirect("/dashboard");
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  redirect("/login");
}
