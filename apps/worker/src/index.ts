import { randomUUID } from "node:crypto";
import os from "node:os";
import { createDb } from "@taskflow/db";
import { createWorker, closeAllQueues } from "@taskflow/queue";
import type { Worker } from "bullmq";
import { loadConfig } from "./config.js";
import { createProcessorRegistry } from "./registry.js";
import { startHeartbeat } from "./heartbeat.js";

const config = loadConfig();
const db = createDb(config.databaseUrl);
const workerId = `${os.hostname()}-${process.pid}-${randomUUID().slice(0, 8)}`;

console.log(`Starting TaskFlow worker: ${workerId}`);

const registry = createProcessorRegistry(db);
const queues = registry.getAllQueues();
const workers: Worker[] = [];

for (const queueName of queues) {
  const processor = registry.getProcessor(queueName);
  const worker = createWorker(queueName, processor, config.redisUrl, {
    concurrency: config.concurrency,
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} on queue "${queueName}" completed`);
  });

  worker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} on queue "${queueName}" failed: ${err.message}`);
  });

  workers.push(worker);
  console.log(`Listening on queue: ${queueName} (concurrency: ${config.concurrency})`);
}

const stopHeartbeat = startHeartbeat(db, {
  workerId,
  queues,
  concurrency: config.concurrency,
});

async function shutdown() {
  console.log("Shutting down worker...");
  stopHeartbeat();
  await Promise.all(workers.map((w) => w.close()));
  await closeAllQueues();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`TaskFlow worker ${workerId} started. Processing ${queues.length} queues.`);
