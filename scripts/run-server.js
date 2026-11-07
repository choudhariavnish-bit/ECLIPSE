const { spawn } = require("child_process");

function startVite() {
  console.log("[ECLIPSE] Launching Vite development server...");
  const child = spawn("npx", ["vite", "--host", "0.0.0.0", "--port", "3000"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: "true" }
  });

  child.on("exit", (code) => {
    console.log(`[ECLIPSE] Server stopped with code ${code}. Restarting in 2s...`);
    setTimeout(startVite, 2000);
  });
}

startVite();

