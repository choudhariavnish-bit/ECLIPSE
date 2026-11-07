/**
 * ECLIPSE - Safe Prelaunch Diagnostics & Environment Preparation
 */
const { execSync, spawn } = require("child_process");
const os = require("os");

console.log("=====================================================================");
console.log("          ECLIPSE - INTELLIGENT BRAND GOVERNANCE");
console.log("=====================================================================\n");

// 1. Release port 3000 if occupied by any stale process
try {
  const output = execSync('netstat -ano | findstr :3000 | findstr LISTENING', {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    shell: true
  });
  const lines = output.trim().split("\n");
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== "0" && !isNaN(Number(pid))) {
      console.log(`[1/2] Releasing port 3000 held by stale process (PID: ${pid})...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore", shell: true });
      } catch (e) {}
    }
  }
} catch (e) {
  console.log("[1/2] Port 3000 is clean and ready.");
}

// 2. Resolve local LAN IP for multi-device / mobile testing
let lanIp = "localhost";
try {
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
} catch (e) {}

console.log("[2/2] Network Endpoints Configured:");
console.log(`      - Local:            http://localhost:3000`);
if (lanIp !== "localhost") {
  console.log(`      - Mobile / Devices: http://${lanIp}:3000`);
}
console.log(`      - Database Studio:  http://localhost:3000/dashboard/database\n`);

console.log("=====================================================================");
console.log("  SERVER LAUNCHING — ACCESS ON ANY DEVICE ON YOUR WI-FI");
console.log("=====================================================================\n");

process.exit(0);
