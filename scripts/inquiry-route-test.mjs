import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
process.loadEnvFile(".env.local");
const origin = process.env.TEST_SITE_ORIGIN || "https://hexa-plus.onrender.com";
const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVER_KEY,
  { auth: { persistSession: false } },
);
const email = "hexa-route-qa-" + Date.now() + "@example.invalid";
const payload = {
  name: "TEST route rate limit",
  email,
  phone: "+201000000000",
  service: "Website Development",
  description: "TEST ONLY route-level acceptance probe, remove after checking.",
  consent: true,
  website: "",
};
const post = (body, headers = {}) =>
  fetch(origin + "/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", origin, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
try {
  const mismatch = await post(payload, { origin: "https://example.invalid" });
  assert.equal(mismatch.status, 403);
  console.log("PASS live route rejects cross-origin POST");
  const malformed = await post("{");
  assert.equal(malformed.status, 400);
  console.log("PASS live route rejects malformed JSON");
  const large = await post(" ".repeat(30001));
  assert.equal(large.status, 413);
  console.log("PASS live route rejects oversized body");
  const consent = await post({ ...payload, consent: false });
  assert.equal(consent.status, 400);
  console.log("PASS live route rejects consent=false");
  const honey = await post({ ...payload, website: "bot" });
  assert.equal(honey.status, 400);
  console.log("PASS live route rejects honeypot");
  for (let i = 0; i < 3; i++) {
    const r = await post({ ...payload, name: "TEST route rate limit " + i });
    assert.equal(r.status, 201, await r.text());
  }
  const limited = await post(payload);
  const data = await limited.json();
  assert.equal(limited.status, 400);
  assert.match(data.error, /wait/i);
  console.log(
    "PASS live route accepts 3 inquiries then returns rate-limit rejection from durable DB ceiling",
  );
  const { data: rows, error } = await service
    .from("leads")
    .select("id")
    .eq("email", email);
  assert.equal(error, null);
  assert.equal(rows.length, 3);
  console.log("PASS exactly 3 persisted leads; fourth did not create a record");
  console.log(
    "NOTE no independent IP limiter is implemented; this tests actual durable email/global route throttling.",
  );
} finally {
  const { data: rows } = await service
    .from("leads")
    .select("id")
    .eq("email", email);
  for (const row of rows || []) {
    await service
      .from("notifications")
      .delete()
      .eq("link", "/dashboard/leads/" + row.id);
    await service.from("leads").delete().eq("id", row.id);
    await service.from("activity_logs").delete().eq("entity_id", row.id);
  }
  console.log("Removed temporary route-test records and notifications");
}
process.exit(0);
