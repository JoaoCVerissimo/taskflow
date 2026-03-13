import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { jobs } from "@taskflow/db";
import type { Database } from "@taskflow/db";

export async function processDataProcessing(job: Job, db: Database): Promise<void> {
  const { jobId } = job.data;

  await db
    .update(jobs)
    .set({ status: "active", startedAt: new Date(), attempts: job.attemptsMade + 1, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  try {
    // Simulate long-running data processing with progress
    const totalSteps = 4;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 1250 + Math.random() * 2500));
      await job.updateProgress(Math.round((step / totalSteps) * 100));
    }

    // Random failure 10% of the time
    if (Math.random() < 0.1) {
      throw new Error("Data processing pipeline failed: corrupted input data");
    }

    const recordsProcessed = Math.floor(Math.random() * 10000) + 1000;

    await db
      .update(jobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        result: { recordsProcessed, duration: `${(5 + Math.random() * 10).toFixed(1)}s` },
        progress: 100,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack ?? null : null;
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 3);

    await db
      .update(jobs)
      .set({
        status: isLastAttempt ? "dead" : "failed",
        error: message,
        stackTrace: stack,
        failedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    throw error;
  }
}
