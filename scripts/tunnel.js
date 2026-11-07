const localtunnel = require("localtunnel");
const https = require("https");

function getPublicIp() {
  return new Promise((resolve) => {
    https.get("https://loca.lt/mytunnelpassword", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data.trim()));
    }).on("error", () => resolve("Check ipify.org"));
  });
}

(async () => {
  console.log("[ECLIPSE] Creating public internet tunnel for port 3000...");
  try {
    const ip = await getPublicIp();
    const tunnel = await localtunnel({ port: 3000 });
    console.log("\n=======================================================");
    console.log("  🌐 PUBLIC WORLDWIDE LINK (Phone Data, Any PC):");
    console.log("     " + tunnel.url);
    console.log("-------------------------------------------------------");
    console.log("  🔑 Tunnel Password (if asked on first visit):");
    console.log("     " + ip);
    console.log("=======================================================\n");

    tunnel.on("close", () => {
      console.log("[ECLIPSE] Tunnel disconnected.");
    });
  } catch (err) {
    console.error("Tunnel error:", err);
  }
})();

