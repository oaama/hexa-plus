import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  {
    env: { ...process.env, PORT: "3000" },
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  },
);
let log = "";
server.stdout.on("data", (b) => (log += b));
server.stderr.on("data", (b) => (log += b));
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch("http://localhost:3000/api/health");
      if (r.status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 1440 ? 1000 : 844 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    await page.screenshot({
      path: "/downloads/hexa-home-" + width + ".png",
      fullPage: true,
    });
    console.log(
      JSON.stringify({
        width,
        title: await page.title(),
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        errors,
      }),
    );
    if (width === 390) {
      await page.goto("http://localhost:3000/contact", {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        path: "/downloads/hexa-contact-390.png",
        fullPage: true,
      });
      await page.goto("http://localhost:3000/login", {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        path: "/downloads/hexa-login-390.png",
        fullPage: true,
      });
    }
    await page.close();
  }
} catch (e) {
  console.error(e.message);
  console.error(log.slice(-3000));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}

process.exit(process.exitCode || 0);
