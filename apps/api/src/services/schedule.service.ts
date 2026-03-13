import { eq } from "drizzle-orm";
import { jobSchedules } from "@taskflow/db";
import type { Database } from "@taskflow/db";
import type { CreateScheduleInput } from "@taskflow/shared";
import { NotFoundError } from "../lib/errors.js";

export function createScheduleService(db: Database) {
  return {
    async create(input: CreateScheduleInput) {
      const [schedule] = await db
        .insert(jobSchedules)
        .values({
          name: input.name,
          queue: input.queue,
          taskName: input.taskName,
          data: input.data ?? null,
          cronExpression: input.cronExpression,
          timezone: input.timezone ?? "UTC",
          priority: input.priority ?? "normal",
          maxAttempts: input.maxAttempts ?? 3,
          nextRunAt: new Date(),
        })
        .returning();

      return schedule;
    },

    async list() {
      return db.select().from(jobSchedules);
    },

    async update(id: string, data: { enabled?: boolean }) {
      const [schedule] = await db
        .update(jobSchedules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(jobSchedules.id, id))
        .returning();

      if (!schedule) throw new NotFoundError("Schedule", id);
      return schedule;
    },

    async remove(id: string) {
      const [schedule] = await db
        .delete(jobSchedules)
        .where(eq(jobSchedules.id, id))
        .returning();

      if (!schedule) throw new NotFoundError("Schedule", id);
      return schedule;
    },
  };
}

export type ScheduleService = ReturnType<typeof createScheduleService>;
