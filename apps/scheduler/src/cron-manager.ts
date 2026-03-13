import { eq } from "drizzle-orm";
import cronParser from "cron-parser";
const { parseExpression } = cronParser;
import { jobSchedules } from "@taskflow/db";
import type { Database } from "@taskflow/db";
import { getQueue, JobOptionsBuilder, closeAllQueues } from "@taskflow/queue";
import { PRIORITY_MAP, type JobPriority } from "@taskflow/shared";

const POLL_INTERVAL = 10_000;

export class CronManager {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private db: Database,
    private redisUrl: string,
  ) {}

  async start(): Promise<void> {
    await this.checkSchedules();
    this.timer = setInterval(() => this.checkSchedules().catch(console.error), POLL_INTERVAL);
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await closeAllQueues();
  }

  private async checkSchedules(): Promise<void> {
    const schedules = await this.db
      .select()
      .from(jobSchedules)
      .where(eq(jobSchedules.enabled, true));

    const now = new Date();

    for (const schedule of schedules) {
      if (!schedule.cronExpression) continue;

      if (schedule.nextRunAt && new Date(schedule.nextRunAt) <= now) {
        await this.enqueueScheduledJob(schedule);

        const interval = parseExpression(schedule.cronExpression, {
          currentDate: now,
          tz: schedule.timezone,
        });
        const nextRun = interval.next().toDate();

        await this.db
          .update(jobSchedules)
          .set({
            lastRunAt: now,
            nextRunAt: nextRun,
            updatedAt: now,
          })
          .where(eq(jobSchedules.id, schedule.id));
      }
    }
  }

  private async enqueueScheduledJob(
    schedule: typeof jobSchedules.$inferSelect,
  ): Promise<void> {
    const queue = getQueue(schedule.queue, this.redisUrl);
    const priority = schedule.priority as JobPriority;

    const opts = new JobOptionsBuilder()
      .priority(priority in PRIORITY_MAP ? priority : "normal")
      .attempts(schedule.maxAttempts)
      .backoff("exponential", 1000)
      .build();

    await queue.add(schedule.taskName, {
      scheduleId: schedule.id,
      ...((schedule.data as object) ?? {}),
    }, opts);

    console.log(
      `Enqueued scheduled job: ${schedule.name} (${schedule.taskName}) on queue ${schedule.queue}`,
    );
  }
}
