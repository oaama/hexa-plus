import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  { env: { ...process.env, PORT: "3000" }, stdio: "pipe" },
);
let logs = "";
server.stdout.on("data", (b) => (logs += b));
server.stderr.on("data", (b) => (logs += b));
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
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
  });
  const errors = [];
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
  for (const path of paths) {
    const response = await page.goto("http://localhost:3000/ar/" + path, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, path);
    assert.equal(await page.locator("html").getAttribute("lang"), "ar");
    assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    const words = await page.locator("main").innerText();
    const english = words
      .split("\n")
      .filter(
        (l) =>
          /[A-Za-z]{3}/.test(l) &&
          !/(HEXA|Supabase|WhatsApp|you@company|EGP)/.test(l),
      );
    console.log(
      "AR PAGE",
      path || "home",
      "remaining Latin:",
      JSON.stringify(english),
    );
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    ) {
      console.log(
        "OVERFLOW",
        await page.evaluate(() =>
          [...document.querySelectorAll("*")]
            .map((e) => ({
              tag: e.tagName,
              cls: e.className,
              rect: e.getBoundingClientRect().toJSON(),
            }))
            .filter((e) => e.rect.right > innerWidth + 1 || e.rect.left < -1),
        ),
      );
      await page.screenshot({
        path: "/downloads/hexa-ar-overflow.png",
        fullPage: false,
      });
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      path,
    );
  }
  await page.goto("http://localhost:3000/ar/services", {
    waitUntil: "networkidle",
  });
  const links = await page
    .locator(".service-catalog>a")
    .evaluateAll((a) => a.map((n) => n.getAttribute("href")));
  assert.equal(links.length, 20);
  for (const link of links) {
    await page.goto("http://localhost:3000" + link, {
      waitUntil: "networkidle",
    });
    const text = await page.locator("main").innerText();
    console.log(
      "AR SERVICE",
      link,
      "Latin:",
      JSON.stringify(text.split("\n").filter((l) => /[A-Za-z]{3}/.test(l))),
    );
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1050 : 844 });
    for (const path of ["/ar", "/ar/services", "/ar/contact", "/ar/about"]) {
      await page.goto("http://localhost:3000" + path, {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        path + " " + width,
      );
      await page.screenshot({
        path:
          "/downloads/hexa-ar-" +
          (path.split("/")[2] || "home") +
          "-" +
          width +
          ".png",
        fullPage: true,
      });
    }
  }
  await page.goto("http://localhost:3000/ar/contact", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "أرسل استفسارك" }).click();
  assert.ok(
    (await page.locator(".field-error").allTextContents()).every((t) =>
      /[\u0600-\u06ff]/.test(t),
    ),
    "Arabic validation",
  );
  await page.getByRole("link", { name: "View in English" }).click();
  await page.waitForURL("**/contact");
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS all Arabic routes, 20 service details, RTL/responsive/validation/language switch.",
  );
} finally {
  await browser?.close();
  server.kill();
}
