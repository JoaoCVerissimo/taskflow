import { createDb } from "@taskflow/db";
import { loadConfig } from "./config.js";
import { CronManager } from "./cron-manager.js";

const config = loadConfig();
const db = createDb(config.databaseUrl);

console.log("Starting TaskFlow scheduler...");

const cronManager = new CronManager(db, config.redisUrl);
await cronManager.start();

async function shutdown() {
  console.log("Shutting down scheduler...");
  await cronManager.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("TaskFlow scheduler started.");
