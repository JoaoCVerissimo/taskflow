import { eq, sql } from "drizzle-orm";
import { jobs } from "@taskflow/db";
import type { Database } from "@taskflow/db";
import { ALL_QUEUES, type QueueStats } from "@taskflow/shared";

export function createQueueService(db: Database) {
  return {
    async listAll(): Promise<QueueStats[]> {
      const stats: QueueStats[] = [];

      for (const name of ALL_QUEUES) {
        const rows = await db
          .select({
            status: jobs.status,
            count: sql<number>`count(*)::int`,
          })
          .from(jobs)
          .where(eq(jobs.queue, name))
          .groupBy(jobs.status);

        const counts: Record<string, number> = {};
        for (const row of rows) {
          counts[row.status] = row.count;
        }

        stats.push({
          name,
          waiting: counts["waiting"] ?? 0,
          active: counts["active"] ?? 0,
          completed: counts["completed"] ?? 0,
          failed: counts["failed"] ?? 0,
          delayed: 0,
          dead: counts["dead"] ?? 0,
        });
      }

      return stats;
    },

    async getStats(name: string): Promise<QueueStats> {
      const rows = await db
        .select({
          status: jobs.status,
          count: sql<number>`count(*)::int`,
        })
        .from(jobs)
        .where(eq(jobs.queue, name))
        .groupBy(jobs.status);

      const counts: Record<string, number> = {};
      for (const row of rows) {
        counts[row.status] = row.count;
      }

      return {
        name,
        waiting: counts["waiting"] ?? 0,
        active: counts["active"] ?? 0,
        completed: counts["completed"] ?? 0,
        failed: counts["failed"] ?? 0,
        delayed: 0,
        dead: counts["dead"] ?? 0,
      };
    },
  };
}

export type QueueService = ReturnType<typeof createQueueService>;
