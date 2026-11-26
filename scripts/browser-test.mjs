import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import assert from "node:assert/strict";
const state = JSON.parse(fs.readFileSync("/tmp/hexa-test-session.json"));
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  { env: { ...process.env, PORT: "3000" }, stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
child.stdout.on("data", (b) => (logs += b));
child.stderr.on("data", (b) => (logs += b));
let browser;
try {
  for (let i = 0; i < 80; i++) {
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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.addCookies(
    state.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    })),
  );
  const oldResponse = await context.request.get(
    "http://localhost:3000/api/modules/clients?q=TEST%20Browser%20CRUD",
  );
  const oldData = await oldResponse.json();
  for (const r of oldData.rows || [])
    if (r.name === "TEST Browser CRUD" && r.created_by === state.userId)
      await context.request.delete(
        "http://localhost:3000/api/modules/clients/" + r.id,
      );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const resp = await page.goto("http://localhost:3000/dashboard", {
    waitUntil: "networkidle",
  });
  assert.equal(resp.status(), 200);
  assert.ok(page.url().endsWith("/dashboard"));
  await page.screenshot({
    path: "/downloads/hexa-dashboard-1440.png",
    fullPage: true,
  });
  console.log("PASS authenticated dashboard renders");
  await page.goto("http://localhost:3000/dashboard/clients", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Add new", exact: true }).click();
  await page.getByLabel("Name *", { exact: true }).fill("TEST Browser CRUD");
  await page
    .getByLabel("Company", { exact: true })
    .fill("TEST Browser Company");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByPlaceholder("Search records...").fill("TEST Browser CRUD");
  await page.waitForTimeout(600);
  await page
    .getByRole("link", { name: "TEST Browser CRUD", exact: true })
    .waitFor();
  await page.screenshot({
    path: "/downloads/hexa-clients-1440.png",
    fullPage: true,
  });
  console.log("PASS real client create/search from UI");
  const browserClientLink = page.getByRole("link", {
    name: "TEST Browser CRUD",
    exact: true,
  });
  await browserClientLink.click();
  await page
    .getByRole("heading", { name: "TEST Browser CRUD", exact: true })
    .waitFor();
  assert.ok(
    await page.getByText("TEST Browser Company", { exact: true }).count(),
  );
  console.log("PASS real detail route and client fields");
  await page.goto("http://localhost:3000/dashboard/projects", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Show Board" }).click();
  await page.locator(".kanban-board").waitFor();
  await page.screenshot({
    path: "/downloads/hexa-project-board.png",
    fullPage: true,
  });
  console.log("PASS real project Kanban renders");
  const pdf = await context.request.get(
    "http://localhost:3000/api/invoices/" + state.invoiceId + "/pdf",
  );
  assert.equal(pdf.status(), 200, await pdf.text().catch(() => ""));
  assert.ok(pdf.headers()["content-type"].includes("application/pdf"));
  fs.writeFileSync("/downloads/hexa-test-invoice.pdf", await pdf.body());
  console.log("PASS authorized downloadable invoice PDF");
  const upload = await context.request.post("http://localhost:3000/api/files", {
    multipart: {
      bucket: "business-files",
      name: "TEST Uploaded file",
      folder: "TEST QA",
      file: {
        name: "qa.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("TEST private file"),
      },
    },
  });
  assert.equal(upload.status(), 201, await upload.text());
  const file = await upload.json();
  const fileResponse = await context.request.get(
    "http://localhost:3000/api/files/" + file.id,
  );
  assert.equal(fileResponse.status(), 200);
  const signed = (await fileResponse.json()).url;
  assert.equal((await context.request.get(signed)).status(), 200);
  const deleted = await context.request.delete(
    "http://localhost:3000/api/files/" + file.id,
  );
  assert.equal(deleted.status(), 200);
  console.log("PASS private file upload, signed download and deletion");
  await page.goto("http://localhost:3000/dashboard/reports", {
    waitUntil: "networkidle",
  });
  await page.screenshot({
    path: "/downloads/hexa-reports-1440.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/dashboard", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: "/downloads/hexa-dashboard-390.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Switch to Arabic", exact: true })
    .click();
  await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.screenshot({
    path: "/downloads/hexa-dashboard-rtl-390.png",
    fullPage: true,
  });
  assert.equal(await page.locator(".dashboard").getAttribute("dir"), "rtl");
  console.log("PASS mobile dashboard and Arabic RTL sidebar");
  await page
    .getByRole("button", { name: "Close sidebar", exact: true })
    .click();
  await page.goto("http://localhost:3000/dashboard/tasks", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: "/downloads/hexa-tasks-390.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log("PASS no browser runtime errors");
  const anon = await browser.newContext();
  const anonResponse = await anon.request.get(
    "http://localhost:3000/api/modules/clients",
  );
  assert.equal(anonResponse.status(), 401);
  const anonPDF = await anon.request.get(
    "http://localhost:3000/api/invoices/" + state.invoiceId + "/pdf",
  );
  assert.equal(anonPDF.status(), 401);
  console.log("PASS anonymous private API and invoice PDF denied");
  // Remove only the one extra UI-created QA client. The rest is cleaned by cleanup-test.ts.
  await page.goto("http://localhost:3000/dashboard/clients", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("button", { name: "حذف TEST Browser CRUD" })
    .count()
    .catch(() => 0);
  await page.getByRole("button", { name: "Delete TEST Browser CRUD" }).click();
  await page.getByRole("button", { name: "حذف السجل", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  console.log("PASS client deletion confirmation");
} catch (e) {
  console.error("BROWSER TEST FAILED", e.message);
  console.error(logs.slice(-2500));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  child.kill("SIGTERM");
}
process.exit(process.exitCode || 0);
