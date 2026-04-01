import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: isWindows
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL detected. Syncing Prisma schema before build.");
  run(npmCommand, ["run", "prisma:push"]);
  run(npmCommand, ["run", "prisma:generate"]);
} else {
  console.log("DATABASE_URL is not set. Skipping Prisma schema sync for this deployment.");
  run(npmCommand, ["run", "prisma:generate"]);
}

run(npmCommand, ["run", "build"]);
