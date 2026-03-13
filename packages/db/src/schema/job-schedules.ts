import { pgTable, uuid, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";

export const jobSchedules = pgTable("job_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  queue: varchar("queue", { length: 100 }).notNull(),
  taskName: varchar("task_name", { length: 255 }).notNull(),
  data: jsonb("data"),
  cronExpression: varchar("cron_expression", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
