const { spawn } = require("child_process");

function startVite() {
  console.log("[ECLIPSE] Launching resilient Vite development server on 0.0.0.0:3000...");
  const child = spawn("npx.cmd", ["vite", "--host", "0.0.0.0", "--port", "3000"], {
    stdio: ["ignore", "inherit", "inherit"],
    shell: true,
    env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: "true" }
  });

  child.on("exit", (code) => {
    console.log(`[ECLIPSE] Vite exited with code ${code}. Auto-restarting in 1s...`);
    setTimeout(startVite, 1000);
  });
}

startVite();
