// Minimal service worker registration smoke test.
// Run against a production build served at SW_CHECK_URL (default: http://localhost:3000).
import { chromium } from "playwright";

const target = process.env.SW_CHECK_URL ?? "http://localhost:3000";

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(target, { waitUntil: "networkidle" });

    const infoHandle = await page.waitForFunction(
      async () => {
        if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return { status: "unsupported" };
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return null;
        const active = registration.active ?? registration.waiting ?? registration.installing;
        return {
          status: active?.state ?? "registered",
          scope: registration.scope,
          scriptURL: active?.scriptURL ?? registration.active?.scriptURL ?? null,
        };
      },
      { timeout: 15000 },
    );

    const info = await infoHandle?.jsonValue();
    if (!info) throw new Error("Service worker did not register within 15s.");
    if (info.status === "unsupported") throw new Error("Service workers are not supported in this browser environment.");
    if (!info.scriptURL || !info.scriptURL.includes("/sw.js")) {
      throw new Error(`Unexpected service worker script: ${info.scriptURL ?? "unknown"}`);
    }

    console.log(`Service worker active (${info.status}): ${info.scriptURL}`);
  } finally {
    await page.close();
    await browser.close();
  }
};

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
