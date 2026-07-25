import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const reactSnapBin = resolve(root, "node_modules/.bin/react-snap");
const logPath = resolve(root, "dist/react-snap-error.log");

if (!existsSync(resolve(root, "dist"))) {
  mkdirSync(resolve(root, "dist"), { recursive: true });
}

const log = createWriteStream(logPath, { flags: "w" });

console.log("[postbuild] Starting react-snap prerender. Output is streamed below and saved to dist/react-snap-error.log if it fails.");

const child = spawn(reactSnapBin, [], {
  cwd: root,
  env: {
    ...process.env,
    PUPPETEER_DISABLE_DEV_SHM_USAGE: "true",
  },
  shell: process.platform === "win32",
});

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  log.write(chunk);
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  log.write(chunk);
});

child.on("error", (error) => {
  const message = `[postbuild] react-snap failed to start: ${error.stack ?? error.message}\n`;
  process.stderr.write(message);
  log.write(message);
});

child.on("close", (code, signal) => {
  log.end();

  if (code === 0) {
    console.log("[postbuild] react-snap prerender completed successfully.");
    process.exit(0);
  }

  const reason = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
  console.error(`[postbuild] react-snap prerender failed with ${reason}.`);
  console.error("[postbuild] The full react-snap/Puppeteer error output was streamed above and saved to dist/react-snap-error.log.");
  console.error("[postbuild] Continuing so the production build can finish; fix the prerender error using the logged stack trace.");
  process.exit(0);
});