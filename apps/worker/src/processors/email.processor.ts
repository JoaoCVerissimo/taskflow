import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { jobs } from "@taskflow/db";
import type { Database } from "@taskflow/db";

export async function processEmail(job: Job, db: Database): Promise<void> {
  const { jobId, to, subject } = job.data;

  await db
    .update(jobs)
    .set({ status: "active", startedAt: new Date(), attempts: job.attemptsMade + 1, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  try {
    await job.updateProgress(10);

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Random failure 20% of the time for demo
    if (Math.random() < 0.2) {
      throw new Error(`Failed to deliver email to ${to}: SMTP connection refused`);
    }

    await job.updateProgress(100);

    await db
      .update(jobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        result: { delivered: true, to, subject, sentAt: new Date().toISOString() },
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
