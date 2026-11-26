import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  { env: { ...process.env, PORT: "3000" }, stdio: "pipe" },
);
let browser;
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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    recordVideo: {
      dir: "/downloads/hexa-motion-video",
      size: { width: 1440, height: 950 },
    },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000/ar", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const motion = page.locator(".hexa-scene canvas");
  await motion.waitFor();
  await page.waitForFunction(() =>
    document.querySelector(".hexa-motion")?.classList.contains("scene-ready"),
  );
  const before = await motion.screenshot();
  await page.waitForTimeout(600);
  const after = await motion.screenshot();
  assert.notDeepEqual(
    before,
    after,
    "real 3D animation changes rendered pixels",
  );
  await page.getByRole("button", { name: "إيقاف الحركة مؤقتًا" }).click();
  await page.waitForTimeout(100);
  const paused1 = await motion.screenshot();
  await page.waitForTimeout(450);
  assert.deepEqual(
    await motion.screenshot(),
    paused1,
    "pause freezes actual canvas pixels",
  );
  await page.getByRole("button", { name: "تشغيل الحركة" }).click();
  await page.mouse.move(250, 320);
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: "/downloads/hexa-agency-ar-desktop.png",
    fullPage: true,
  });
  await page.evaluate(() => scrollTo({ top: 850, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => scrollTo({ top: 1500, behavior: "smooth" }));
  await page.waitForTimeout(1800);
  await page.evaluate(() => scrollTo({ top: 2400, behavior: "smooth" }));
  await page.waitForTimeout(1800);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(700);
  const video = page.video();
  await page.close();
  await context.close();
  await video.saveAs("/downloads/hexa-redesign-motion.webm");
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await reduced.goto("http://localhost:3000/ar", { waitUntil: "networkidle" });
  assert.equal(
    await reduced
      .locator(".hex-object svg")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  assert.ok(
    (await reduced.locator(".hexa-motion").getAttribute("class")).includes(
      "motion-paused",
    ),
  );
  await reduced.screenshot({
    path: "/downloads/hexa-agency-ar-mobile.png",
    fullPage: true,
  });
  await reduced.getByRole("button", { name: "فتح القائمة" }).click();
  await reduced
    .getByRole("navigation", { name: "القائمة الرئيسية" })
    .getByRole("link", { name: "خدماتنا" })
    .click();
  await reduced.waitForURL("**/ar/services");
  assert.equal(
    await reduced.locator(".site-nav").getAttribute("class"),
    "site-nav",
  );
  assert.equal(
    await reduced.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await reduced.screenshot({
    path: "/downloads/hexa-agency-services-mobile.png",
    fullPage: true,
  });
  await reduced.goto("http://localhost:3000/ar/portfolio", {
    waitUntil: "networkidle",
  });
  await reduced.screenshot({
    path: "/downloads/hexa-agency-work-mobile.png",
    fullPage: true,
  });
  await reduced.goto("http://localhost:3000/ar/contact", {
    waitUntil: "networkidle",
  });
  await reduced.screenshot({
    path: "/downloads/hexa-agency-contact-mobile.png",
    fullPage: true,
  });
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS active animation, pause/resume, reduced-motion, mobile navigation and no runtime errors; video saved",
  );
} finally {
  await browser?.close();
  server.kill();
}
