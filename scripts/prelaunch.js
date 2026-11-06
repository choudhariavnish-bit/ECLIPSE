/**
 * Inkloom AI - Pre-launch Verification & Environment Setup
 * Pure Node.js - 100% immune to Windows Batch syntax bugs
 */
const { execSync } = require("child_process");
const os = require("os");

console.log("=====================================================================");
console.log("          INKLOOM AI - ENTERPRISE GOVERNANCE PLATFORM");
console.log("=====================================================================\n");

// 1. Release port 3000 if occupied
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
  // netstat exit 1 means port 3000 is already free
  console.log("[1/3] Port 3000 is clean and available.");
}

// 2. Resolve local LAN IP
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

console.log("[2/3] Network endpoints ready:");
console.log("      - Primary:          http://localhost:3000");
console.log("      - Alternative:      http://127.0.0.1:3000");
if (lanIp !== "localhost") {
  console.log(`      - Wi-Fi Devices:    http://${lanIp}:3000`);
}
console.log("      - Database Studio:  http://localhost:3000/dashboard/database\n");

console.log("[3/3] Starting server & smart browser monitor...");
console.log("      Browser will open automatically once the server answers.\n");

console.log("=====================================================================");
console.log("  IMPORTANT: KEEP THIS TERMINAL WINDOW OPEN WHILE USING INKLOOM!");
console.log("  (Minimizing this window is completely fine. Closing it stops the server.)");
console.log("=====================================================================\n");

