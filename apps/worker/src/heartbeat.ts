import { eq } from "drizzle-orm";
import { workers } from "@taskflow/db";
import type { Database } from "@taskflow/db";
import os from "node:os";

interface HeartbeatOpts {
  workerId: string;
  queues: string[];
  concurrency: number;
  interval?: number;
}

export function startHeartbeat(db: Database, opts: HeartbeatOpts) {
  const { workerId, queues, concurrency, interval = 15_000 } = opts;
  const hostname = os.hostname();
  const pid = process.pid;

  const register = async () => {
    await db
      .insert(workers)
      .values({
        workerId,
        hostname,
        pid,
        queues,
        concurrency,
        status: "online",
      })
      .onConflictDoUpdate({
        target: workers.workerId,
        set: {
          status: "online",
          lastHeartbeatAt: new Date(),
          startedAt: new Date(),
          stoppedAt: null,
          queues,
          concurrency,
          pid,
          hostname,
        },
      });
  };

  const beat = async () => {
    await db
      .update(workers)
      .set({ lastHeartbeatAt: new Date(), status: "online" })
      .where(eq(workers.workerId, workerId));
  };

  register().catch(console.error);
  const timer = setInterval(() => beat().catch(console.error), interval);

  return () => {
    clearInterval(timer);
    db.update(workers)
      .set({ status: "offline", stoppedAt: new Date() })
      .where(eq(workers.workerId, workerId))
      .then(() => {})
      .catch(console.error);
  };
}
