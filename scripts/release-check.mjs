import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const base = process.env.BASE_URL || "http://localhost:3000";
const server = process.env.BASE_URL
  ? null
  : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start"], {
      env: { ...process.env, PORT: "3000" },
      stdio: "pipe",
    });
server?.stdout.on("data", () => {});
server?.stderr.on("data", () => {});
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + "/api/health")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const errors = [];
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => errors.push(e.message));
  const paths = [
    "",
    "about",
    "services",
    "portfolio",
    "contact",
    "industries",
    "process",
    "faq",
    "careers",
    "privacy",
    "terms",
  ];
  for (const ar of [false, true])
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({
        width,
        height: width === 1440 ? 1000 : 844,
      });
      for (const path of paths) {
        const url = base + (ar ? "/ar" : "") + "/" + path;
        const res = await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 90000,
        });
        assert.equal(res.status(), 200, url);
        assert.equal(
          await page.locator("html").getAttribute("lang"),
          ar ? "ar" : "en",
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          url + " overflow " + width,
        );
        assert.ok(
          (await page.locator("main").innerText()).length > 70,
          url + " empty",
        );
        if (
          width !== 320 &&
          ["", "services", "portfolio", "contact", "about"].includes(path)
        )
          await page.screenshot({
            path:
              "/downloads/hexa-release-" +
              (ar ? "ar" : "en") +
              "-" +
              (path || "home") +
              "-" +
              width +
              ".png",
            fullPage: true,
          });
      }
      console.log("PASS routes and overflow", ar ? "Arabic" : "English", width);
    }
  for (const ar of [false, true]) {
    await page.goto(base + (ar ? "/ar" : "") + "/contact", {
      waitUntil: "networkidle",
    });
    await page.locator("form button[type=submit]").click();
    assert.ok(
      (await page.locator(".field-error").count()) > 2,
      "required validation",
    );
    console.log("PASS required form validation", ar ? "Arabic" : "English");
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForFunction(() =>
    document.querySelector(".hexa-motion")?.classList.contains("scene-ready"),
  );
  const canvas = page.locator(".hexa-scene canvas");
  const a = await canvas.screenshot();
  await page.waitForTimeout(450);
  assert.notDeepEqual(a, await canvas.screenshot());
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  await page.waitForTimeout(100);
  const b = await canvas.screenshot();
  await page.waitForTimeout(400);
  assert.deepEqual(b, await canvas.screenshot());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() =>
    document.querySelector(".hexa-motion")?.classList.contains("scene-ready"),
  );
  assert.ok(
    (await page.locator(".hexa-motion").getAttribute("class")).includes(
      "motion-paused",
    ),
  );
  const c = await canvas.screenshot();
  await page.waitForTimeout(400);
  assert.deepEqual(c, await canvas.screenshot());
  console.log("PASS actual canvas motion, pause, reduced-motion");
  const fallback = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await fallback.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes("webgl")) return null;
      return orig.call(this, type, ...args);
    };
  });
  await fallback.goto(base + "/ar", { waitUntil: "networkidle" });
  await fallback.waitForTimeout(1000);
  assert.equal(await fallback.locator(".hexa-motion.scene-ready").count(), 0);
  assert.ok(await fallback.locator(".hex-object svg").isVisible());
  await fallback.screenshot({
    path: "/downloads/hexa-release-fallback-390.png",
    fullPage: false,
  });
  await fallback.getByRole("button", { name: "فتح القائمة" }).click();
  await fallback
    .getByRole("navigation", { name: "القائمة الرئيسية" })
    .getByRole("link", { name: "خدماتنا" })
    .click();
  await fallback.waitForURL("**/ar/services");
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS WebGL fallback, Arabic mobile navigation, no runtime errors",
  );
} finally {
  await browser?.close();
  server?.kill();
}
