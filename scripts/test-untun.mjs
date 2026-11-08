import { startTunnel } from "untun";

async function main() {
  console.log("Starting Cloudflare tunnel...");
  try {
    const tunnel = await startTunnel({ port: 3000 });
    const url = await tunnel.getURL();
    console.log("CLOUDFLARE_URL:" + url);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();

