import { NextResponse } from "next/server";
import { hasAllowedOrigin } from "./request-origin";
import { supabase } from "./supabase/server";
export async function apiUser(permission?: string) {
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  if (permission) {
    const { data, error } = await db.rpc("has_permission", {
      requested: permission,
    });
    if (error || !data) throw new Error("PERMISSION_DENIED");
  }
  return { db, user };
}
export function sameOrigin(request: Request) {
  if (!hasAllowedOrigin(request)) throw new Error("PERMISSION_DENIED");
}
export function apiError(e: unknown) {
  const message = e instanceof Error ? e.message : "Request failed";
  return NextResponse.json(
    {
      error:
        message === "AUTH_REQUIRED"
          ? "Please sign in."
          : message === "PERMISSION_DENIED"
            ? "You do not have permission for this action."
            : message.slice(0, 350),
    },
    {
      status:
        message === "AUTH_REQUIRED"
          ? 401
          : message === "PERMISSION_DENIED"
            ? 403
            : 400,
    },
  );
}
export async function readJSON(request: Request) {
  const text = await request.text();
  if (text.length > 100000) throw new Error("Request is too large.");
  return JSON.parse(text);
}
