/**
 * Inkloom AI - Safe Network Diagnostics
 */
const os = require("os");

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

console.log("Network Endpoints Ready:");
console.log("  - Local:       http://localhost:3000");
if (lanIp !== "localhost") {
  console.log(`  - Local Wi-Fi: http://${lanIp}:3000`);
}
