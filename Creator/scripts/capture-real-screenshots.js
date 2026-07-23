const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, ".cp-images");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const webDir = path.join(root, "apps", "web");

function waitFor(url, timeoutMs = 60000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
        } else {
          setTimeout(tick, 1000);
        }
      });

      req.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
        } else {
          setTimeout(tick, 1000);
        }
      });
    };

    tick();
  });
}

(async () => {
  const server = spawn(process.execPath, [nextBin, "dev", "-p", "3000"], {
    cwd: webDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitFor("http://127.0.0.1:3000/creators/demo/dashboard?demo=true");
  } catch (error) {
    server.kill();
    throw error;
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Users\\仕事用\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });

  await page.goto("http://127.0.0.1:3000/creators/demo/dashboard?demo=true", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, "cocoba-dashboard-twitter.png"), fullPage: false });

  await page.goto("http://127.0.0.1:3000/studio-pro/content?demo=true", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, "cocoba-studio-pro-content-twitter.png"), fullPage: false });

  await browser.close();
  server.kill();
})();
