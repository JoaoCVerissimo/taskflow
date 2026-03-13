import { eq, desc, and, sql, type SQL } from "drizzle-orm";
import { jobs } from "@taskflow/db";
import type { Database } from "@taskflow/db";
import type { CreateJobInput, JobStatus, JobPriority } from "@taskflow/shared";
import { JOB_DEFAULTS } from "@taskflow/shared";
import { getQueue, JobOptionsBuilder } from "@taskflow/queue";
import { NotFoundError } from "../lib/errors.js";

export function createJobService(db: Database, redisUrl: string) {
  return {
    async create(input: CreateJobInput) {
      const priority = input.priority ?? JOB_DEFAULTS.priority;
      const maxAttempts = input.maxAttempts ?? JOB_DEFAULTS.maxAttempts;
      const delay = input.delay ?? JOB_DEFAULTS.delay;

      const [job] = await db
        .insert(jobs)
        .values({
          queue: input.queue,
          name: input.name,
          data: input.data,
          priority,
          maxAttempts,
          delay,
          scheduledFor: delay > 0 ? new Date(Date.now() + delay) : null,
        })
        .returning();

      const queue = getQueue(input.queue, redisUrl);
      const opts = new JobOptionsBuilder()
        .priority(priority)
        .attempts(maxAttempts)
        .backoff("exponential", JOB_DEFAULTS.backoffDelay)
        .delay(delay)
        .build();

      await queue.add(input.name, { jobId: job.id, ...input.data }, opts);

      return job;
    },

    async findById(id: string) {
      const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
      if (!job) throw new NotFoundError("Job", id);
      return job;
    },

    async list(filters: {
      status?: JobStatus;
      queue?: string;
      priority?: JobPriority;
      limit: number;
      offset: number;
    }) {
      const conditions: SQL[] = [];
      if (filters.status) conditions.push(eq(jobs.status, filters.status));
      if (filters.queue) conditions.push(eq(jobs.queue, filters.queue));
      if (filters.priority) conditions.push(eq(jobs.priority, filters.priority));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [result, [countRow]] = await Promise.all([
        db
          .select()
          .from(jobs)
          .where(where)
          .orderBy(desc(jobs.createdAt))
          .limit(filters.limit)
          .offset(filters.offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(jobs)
          .where(where),
      ]);

      return { items: result, total: countRow.count };
    },

    async cancel(id: string) {
      const [job] = await db
        .update(jobs)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(jobs.id, id), eq(jobs.status, "waiting")))
        .returning();

      if (!job) throw new NotFoundError("Job", id);
      return job;
    },

    async retry(id: string) {
      const existing = await this.findById(id);
      if (existing.status !== "failed" && existing.status !== "dead") {
        throw new NotFoundError("Job", id);
      }

      const [job] = await db
        .update(jobs)
        .set({
          status: "waiting",
          attempts: 0,
          error: null,
          stackTrace: null,
          failedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, id))
        .returning();

      const queue = getQueue(job.queue, redisUrl);
      const opts = new JobOptionsBuilder()
        .priority(job.priority as JobPriority)
        .attempts(job.maxAttempts)
        .backoff("exponential", JOB_DEFAULTS.backoffDelay)
        .build();

      await queue.add(job.name, { jobId: job.id, ...(job.data as object) }, opts);

      return job;
    },
  };
}

export type JobService = ReturnType<typeof createJobService>;
