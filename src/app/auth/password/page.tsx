"use client";
import { useState } from "react";
import { browserSupabase } from "@/lib/supabase/client";
export default function SetPassword() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="empty-page">
      <span className="eyebrow">YOUR HEXA PLUS ACCOUNT</span>
      <h1>Set your password.</h1>
      <p>Choose at least 12 characters. Keep it unique to this account.</p>
      <form
        className="record-form w-full max-w-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const data = new FormData(e.currentTarget);
          if (data.get("password") !== data.get("confirm")) {
            setError("Passwords do not match.");
            setBusy(false);
            return;
          }
          const db = browserSupabase();
          const { error } = await db.auth.updateUser({
            password: String(data.get("password")),
          });
          if (error) {
            setError(
              "Your session may have expired. Ask your administrator for a new invitation.",
            );
            setBusy(false);
          } else location.replace("/dashboard");
        }}
      >
        <label className="form-field mb-5">
          <span>New password</span>
          <input
            type="password"
            name="password"
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="form-field mb-5">
          <span>Confirm password</span>
          <input
            type="password"
            name="confirm"
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </label>
        {error && <p className="field-error">{error}</p>}
        <button disabled={busy} className="primary-link">
          Save password
        </button>
      </form>
    </main>
  );
}
