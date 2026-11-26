import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
process.loadEnvFile(".env.local");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVER_KEY,
  { auth: { persistSession: false } },
);
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);
const email = "hexa-form-qa-" + Date.now() + "@example.invalid";
let leadId;
let browser;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  { env: { ...process.env, PORT: "3000" }, stdio: "pipe" },
);
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://localhost:3000/api/health")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  for (const prefix of ["", "/ar"]) {
    await page.goto("http://localhost:3000" + prefix + "/portfolio", {
      waitUntil: "networkidle",
    });
    assert.equal(await page.locator(".project-card").count(), 2);
    for (const image of await page.locator(".project-card img").all()) {
      assert.ok(
        await image.evaluate((e) => e.complete && e.naturalWidth > 0),
        "published screenshot image",
      );
    }
    await page.screenshot({
      path: "/downloads/hexa-portfolio" + (prefix ? "-ar" : "-en") + ".png",
      fullPage: true,
    });
    await page.goto(
      "http://localhost:3000" + prefix + "/portfolio/matcha-cafe",
      { waitUntil: "networkidle" },
    );
    const live = page.locator('a[href="https://matcha-cafe-two.vercel.app/"]');
    assert.equal(await live.count(), 1);
    assert.equal(await live.getAttribute("target"), "_blank");
    assert.ok((await live.getAttribute("rel")).includes("noopener"));
    await page.screenshot({
      path: "/downloads/hexa-case" + (prefix ? "-ar" : "-en") + ".png",
      fullPage: true,
    });
    const draft = await page.goto(
      "http://localhost:3000" + prefix + "/portfolio/faroj-basha",
    );
    assert.equal(draft.status(), 404);
  }
  const invalid = {
    name: "TEST invalid consent",
    email,
    phone: "+201000000000",
    service: "Website Development",
    description: "TEST ONLY invalid inquiry, never retain.",
    consent: false,
    website: "",
  };
  if (!process.env.SKIP_RPC_NEGATIVES)
    for (const patch of [
      { consent: false },
      { consent: null },
      { consent: true, website: "spam" },
      { consent: true, phone: "" },
      { consent: true, service: "" },
    ]) {
      const { error } = await anon.rpc("submit_inquiry", {
        payload: { ...invalid, ...patch },
      });
      assert.ok(
        error,
        "Direct RPC rejects invalid payload " + JSON.stringify(patch),
      );
    }
  if (!process.env.SKIP_RPC_NEGATIVES)
    console.log(
      "PASS direct anonymous RPC rejects missing consent, honeypot and absent required fields",
    );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/ar/contact", {
    waitUntil: "networkidle",
  });
  await page.locator("[name=name]").fill("TEST استفسار تجريبي");
  await page.locator("[name=company]").fill("TEST ONLY");
  await page.locator("[name=email]").fill(email);
  await page.locator("[name=phone]").fill("+201000000000");
  await page.locator("[name=service]").selectOption({ label: "تطوير المواقع" });
  await page
    .locator("textarea[name=description]")
    .fill(
      "TEST ONLY هذه رسالة اختبار للتأكد من حفظ الاستفسار العربي، وسوف تُحذف بعد الاختبار.",
    );
  await page.locator("[name=consent]").check();
  await page.getByRole("button", { name: "أرسل استفسارك" }).click();
  await page.locator(".inquiry-success").waitFor();
  await page.screenshot({
    path: "/downloads/hexa-ar-inquiry-test-success.png",
    fullPage: true,
  });
  const { data: lead, error } = await db
    .from("leads")
    .select("id,service,stage,source")
    .eq("email", email)
    .single();
  assert.equal(error, null, error?.message);
  leadId = lead.id;
  assert.equal(lead.service, "تطوير المواقع");
  assert.equal(lead.stage, "new");
  assert.equal(lead.source, "website");
  const { data: consent } = await db
    .from("contact_submissions")
    .select("consent")
    .eq("lead_id", leadId)
    .single();
  assert.equal(consent.consent, true);
  const { count } = await db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("link", "/dashboard/leads/" + leadId);
  assert.ok(count > 0);
  console.log(
    "PASS Arabic inquiry persisted as real CRM lead, explicit consent and staff notification",
  );
  console.log(
    "PASS two bilingual portfolio cards, real published screenshots, safe live links and draft exclusion",
  );
} finally {
  const { data: remaining } = await db
    .from("leads")
    .select("id")
    .eq("email", email);
  for (const l of remaining || []) {
    await db
      .from("notifications")
      .delete()
      .eq("link", "/dashboard/leads/" + l.id);
    await db.from("leads").delete().eq("id", l.id);
    await db.from("activity_logs").delete().eq("entity_id", l.id);
  }
  console.log("Temporary public inquiry fixture removed");
  await browser?.close();
  server.kill();
}
