"use client";
import { useEffect, useState } from "react";
import { browserSupabase } from "@/lib/supabase/client";
export default function Confirm() {
  const [message, setMessage] = useState("Confirming your invitation...");
  useEffect(() => {
    async function confirm() {
      try {
        const db = browserSupabase();
        const hash = new URLSearchParams(location.hash.slice(1));
        const query = new URLSearchParams(location.search);
        let error;
        if (hash.get("access_token") && hash.get("refresh_token")) {
          const r = await db.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token")!,
          });
          error = r.error;
          history.replaceState(null, "", "/auth/confirm");
        } else if (query.get("code")) {
          const r = await db.auth.exchangeCodeForSession(query.get("code")!);
          error = r.error;
        } else {
          setMessage(
            "This invitation is missing or has expired. Ask your administrator for a new one.",
          );
          return;
        }
        if (error) throw error;
        location.replace("/auth/password");
      } catch {
        setMessage(
          "This invitation could not be confirmed. Ask your administrator for a new one.",
        );
      }
    }
    confirm();
  }, []);
  return (
    <main className="empty-page">
      <h1>HEXA PLUS</h1>
      <p>{message}</p>
      <a href="/login">Team sign in</a>
    </main>
  );
}
