import { pgTable, uuid, varchar, text, integer, pgEnum, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const jobStatusEnum = pgEnum("job_status", [
  "waiting",
  "active",
  "completed",
  "failed",
  "dead",
  "cancelled",
]);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    queue: varchar("queue", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    data: jsonb("data").notNull().default({}),
    status: jobStatusEnum("status").default("waiting").notNull(),
    priority: varchar("priority", { length: 20 }).default("normal").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    progress: integer("progress").default(0).notNull(),
    result: jsonb("result"),
    error: text("error"),
    stackTrace: text("stack_trace"),
    delay: integer("delay").default(0).notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_jobs_status").on(table.status),
    index("idx_jobs_queue").on(table.queue),
    index("idx_jobs_priority").on(table.priority),
    index("idx_jobs_created_at").on(table.createdAt),
  ],
);
