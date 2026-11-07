/**
 * ECLIPSE - Safe Prelaunch Diagnostics & Environment Preparation
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
      console.log(`[1/3] Releasing port 3000 held by stale process (PID: ${pid})...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore", shell: true });
      } catch (e) {}
    }
  }
} catch (e) {
  console.log("[1/3] Port 3000 is clean and ready.");
}

// 2. Patch Vite Windows spawn EPERM bug if present
try {
  const viteChunkPath = path.join(__dirname, "..", "node_modules", "vite", "dist", "node", "chunks", "node.js");
  if (fs.existsSync(viteChunkPath)) {
    let content = fs.readFileSync(viteChunkPath, "utf8");
    if (content.includes('exec("net use"') && !content.includes('try {\n\t\texec("net use"')) {
      content = content.replace(
        /exec\("net use", \{ windowsHide: true \}, \(error, stdout\) => \{[\s\S]*?\}\);/m,
        `try {
\t\texec("net use", { windowsHide: true }, (error, stdout) => {
\t\t\tif (error) return;
\t\t\tconst lines = stdout.split("\\n");
\t\t\tfor (const line of lines) {
\t\t\t\tconst m = parseNetUseRE.exec(line);
\t\t\t\tif (m) windowsNetworkMap.set(m[2], m[1]);
\t\t\t}
\t\t\tif (windowsNetworkMap.size === 0) safeRealpathSync = fs.realpathSync.native;
\t\t\telse safeRealpathSync = windowsMappedRealpathSync;
\t\t});
\t} catch (e) {
\t\tsafeRealpathSync = fs.realpathSync.native;
\t}`
      );
      fs.writeFileSync(viteChunkPath, content, "utf8");
    }
  }
} catch (e) {}

// 3. Ensure local SQLite3 file database exists
const sqliteDbPath = path.join(process.cwd(), "database", "governance.sqlite");
if (!fs.existsSync(sqliteDbPath)) {
  try {
    console.log("[DB] Seeding local SQLite3 offline database...");
    execSync("node scripts/init_sqlite.js", { stdio: "ignore" });
  } catch (e) {}
}

// 4. Resolve local LAN IP for multi-device / mobile testing
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

console.log("[2/3] Database & Network Endpoints Configured:");
console.log(`      - Local Disk DB:    SQLite3 (database/governance.sqlite)`);
console.log(`      - Browser DB:       MongoDB (Document Collections Engine)`);
console.log(`      - Primary Web:      http://localhost:3000`);
if (lanIp !== "localhost") {
  console.log(`      - Wi-Fi Devices:    http://${lanIp}:3000`);
}
console.log(`      - Database Studio:  http://localhost:3000/dashboard/database\n`);

console.log("[3/3] Platform Engine Ready (Pure React + Vite)...\n");
console.log("=====================================================================");
console.log("  SERVER LAUNCHING — ACCESS ON ANY DEVICE ON YOUR WI-FI");
console.log("=====================================================================\n");

process.exit(0);
