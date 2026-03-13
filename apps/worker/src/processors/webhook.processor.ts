import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { jobs } from "@taskflow/db";
import type { Database } from "@taskflow/db";

export async function processWebhook(job: Job, db: Database): Promise<void> {
  const { jobId, url } = job.data;

  await db
    .update(jobs)
    .set({ status: "active", startedAt: new Date(), attempts: job.attemptsMade + 1, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  try {
    await job.updateProgress(30);

    // Simulate HTTP POST to webhook URL
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500));

    // Random failure 15% of the time
    if (Math.random() < 0.15) {
      throw new Error(`Webhook delivery failed: connection to ${url ?? "unknown"} timed out`);
    }

    await job.updateProgress(100);

    await db
      .update(jobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        result: { delivered: true, url, responseCode: 200, deliveredAt: new Date().toISOString() },
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
