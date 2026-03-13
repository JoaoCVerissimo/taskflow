import { pgTable, uuid, varchar, integer, pgEnum, jsonb, timestamp } from "drizzle-orm/pg-core";

export const workerStatusEnum = pgEnum("worker_status", ["online", "stale", "offline"]);

export const workers = pgTable("workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: varchar("worker_id", { length: 255 }).notNull().unique(),
  hostname: varchar("hostname", { length: 255 }).notNull(),
  pid: integer("pid").notNull(),
  queues: jsonb("queues").notNull().default([]),
  concurrency: integer("concurrency").notNull(),
  status: workerStatusEnum("status").default("online").notNull(),
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  stoppedAt: timestamp("stopped_at", { withTimezone: true }),
  processedCount: integer("processed_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
});
