import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { jobs } from "@taskflow/db";
import type { Database } from "@taskflow/db";

export async function processReportGeneration(job: Job, db: Database): Promise<void> {
  const { jobId, reportType } = job.data;

  await db
    .update(jobs)
    .set({ status: "active", startedAt: new Date(), attempts: job.attemptsMade + 1, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  try {
    // Simulate report generation phases
    await job.updateProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    await job.updateProgress(50);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    await job.updateProgress(80);
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500));

    // Random failure 5% of the time
    if (Math.random() < 0.05) {
      throw new Error("Report generation failed: insufficient data for aggregation");
    }

    await job.updateProgress(100);

    await db
      .update(jobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        result: {
          reportType: reportType ?? "summary",
          pages: Math.floor(Math.random() * 50) + 5,
          generatedAt: new Date().toISOString(),
        },
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
