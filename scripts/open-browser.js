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
  console.log(` [Inkloom] Local server is live!`);
  console.log(` [Inkloom] Launching browser to: ${TARGET_URL}`);
  console.log(`=============================================================\n`);

  // Use cmd /c start so Windows handles the default browser without blocking
  exec(`start "" "${TARGET_URL}"`, (err) => {
    if (err) {
      console.log(`[Inkloom] Could not auto-launch browser: ${err.message}`);
      console.log(`[Inkloom] Please open ${TARGET_URL} manually in Chrome or Edge.`);
    }
    // Give OS 1.5 seconds to register the browser process before this launcher script exits
    setTimeout(() => process.exit(0), 1500);
  });
}

function probe() {
  if (hasLaunched) return;
  attempts++;

  const req = http.get("http://127.0.0.1:3000", (res) => {
    // Any status (200, 301, 302, 307, 308, 404) means the HTTP server is up and serving!
    launchBrowser();
  });

  req.on("error", () => {
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(probe, INTERVAL_MS);
    } else {
      console.log(`\n[Inkloom] Timed out waiting for server after 36s.`);
      console.log(`[Inkloom] Please check the console output and open ${TARGET_URL} manually.`);
      process.exit(1);
    }
  });

  req.setTimeout(1000, () => {
    req.destroy();
  });
}

// Start probing after a tiny 500ms initial breather
setTimeout(probe, 500);
