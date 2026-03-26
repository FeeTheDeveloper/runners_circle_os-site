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

run(npmCommand, ["run", "prisma:generate"]);

if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL detected. Applying Prisma migrations before build.");
  run(npmCommand, ["run", "prisma:migrate:deploy"]);
} else {
  console.log("DATABASE_URL is not set. Skipping Prisma migrations for this deployment.");
}

run(npmCommand, ["run", "build"]);
