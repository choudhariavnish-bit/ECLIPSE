/**
 * Inkloom AI - Zero-Error Browser Launcher
 * 
 * Polls the local server until it is fully compiled and responding with HTTP status,
 * guaranteeing Chrome never opens to an 'ERR_CONNECTION_REFUSED' page.
 */
const http = require("http");
const { exec } = require("child_process");

const TARGET_URL = process.argv[2] || "http://localhost:3000";
const MAX_ATTEMPTS = 90; // 90 attempts * 400ms = 36s timeout
const INTERVAL_MS = 400;

let attempts = 0;
let hasLaunched = false;

function launchBrowser() {
  if (hasLaunched) return;
  hasLaunched = true;

  console.log(`\n=============================================================`);
  console.log(` [Inkloom] Local server is live and answering requests!`);
  console.log(` [Inkloom] Launching browser: ${TARGET_URL}`);
  console.log(`=============================================================\n`);

  exec(`start ${TARGET_URL}`, (err) => {
    if (err) {
      console.log(`[Inkloom] Could not auto-launch browser: ${err.message}`);
      console.log(`[Inkloom] Please open ${TARGET_URL} manually in Chrome or Edge.`);
    }
    setTimeout(() => process.exit(0), 1200);
  });
}

function probe() {
  if (hasLaunched) return;
  attempts++;

  // 1. Try 127.0.0.1 directly (instant, no DNS)
  const req = http.get("http://127.0.0.1:3000", (res) => {
    launchBrowser();
  });

  req.on("error", () => {
    // 2. Fallback: try localhost (handles IPv6 dual-stack)
    const req2 = http.get("http://localhost:3000", (res) => {
      launchBrowser();
    });

    req2.on("error", () => {
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(probe, INTERVAL_MS);
      } else {
        console.log(`\n[Inkloom] Timed out waiting for server after 36s.`);
        console.log(`[Inkloom] Please open ${TARGET_URL} manually in your browser.`);
        process.exit(1);
      }
    });

    req2.setTimeout(500, () => req2.destroy());
  });

  req.setTimeout(500, () => req.destroy());
}

// Start probing after initial 500ms breather
setTimeout(probe, 500);
