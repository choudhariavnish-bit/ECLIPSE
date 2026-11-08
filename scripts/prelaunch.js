/**
 * Inkloom AI - Pre-launch Verification & Environment Setup
 * Pure Node.js - 100% immune to Windows Batch syntax bugs
 */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

console.log("=====================================================================");
console.log("          ECLIPSE - INTELLIGENT BRAND GOVERNANCE");
console.log("=====================================================================\n");

// 1. Release port 3000 if occupied by any stale process
try {
  const output = execSync('netstat -ano | findstr :3000 | findstr LISTENING', { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const lines = output.trim().split("\n");
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== "0" && !isNaN(Number(pid))) {
      console.log(`[1/3] Releasing port 3000 held by stale process (PID: ${pid})...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      } catch {}
    }
  }
} catch {
  console.log("[1/3] Port 3000 is clean and available.");
}

// 2. Ensure local SQLite3 file database exists
const sqliteDbPath = path.join(process.cwd(), "database", "governance.sqlite");
if (!fs.existsSync(sqliteDbPath)) {
  try {
    console.log("[DB] Seeding local SQLite3 offline database...");
    execSync("node scripts/init_sqlite.js", { stdio: "inherit" });
  } catch (e) {}
}

// 3. Resolve local LAN IP for multi-device / mobile testing
let lanIp = "localhost";
const ifaces = os.networkInterfaces();
for (const dev in ifaces) {
  for (const details of ifaces[dev] || []) {
    if (details.family === "IPv4" && !details.internal && details.address !== "127.0.0.1") {
      lanIp = details.address;
      break;
    }
  }
  if (lanIp !== "localhost") break;
}

console.log("[2/3] Database & Network endpoints ready:");
console.log("      - Local Disk DB:    SQLite3 (database/governance.sqlite)");
console.log("      - Browser DB:       MongoDB (Document Collections Engine)");
console.log("      - Primary Web:      http://localhost:3000");
if (lanIp !== "localhost") {
  console.log(`      - Wi-Fi Devices:    http://${lanIp}:3000`);
}
console.log("      - Database Studio:  http://localhost:3000/dashboard/database\n");

// 4. Start smart background browser monitor:
console.log("[3/3] Starting server & smart browser monitor...");
console.log("      Browser will open automatically once the server is ready.\n");

const launcherScript = `
  const http = require('http');
  const { exec } = require('child_process');
  let tries = 0;
  function check() {
    tries++;
    if (tries > 120) process.exit(0); // 60s timeout
    const req = http.get('http://localhost:3000', (res) => {
      exec('start http://localhost:3000');
      process.exit(0);
    });
    req.on('error', () => {
      setTimeout(check, 500);
    });
    req.setTimeout(800, () => {
      req.destroy();
      setTimeout(check, 500);
    });
  }
  setTimeout(check, 1000);
`;

try {
  const launcher = spawn("node", ["-e", launcherScript], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  launcher.unref();
} catch (e) {}

console.log("=====================================================================");
console.log("  SERVER LAUNCHING — KEEP THIS WINDOW OPEN WHILE USING ECLIPSE");
console.log("=====================================================================\n");
