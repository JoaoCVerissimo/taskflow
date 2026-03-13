import { lt } from "drizzle-orm";
import { workers } from "@taskflow/db";
import type { Database } from "@taskflow/db";

const STALE_THRESHOLD_MS = 30_000;

export function createWorkerService(db: Database) {
  return {
    async list() {
      const allWorkers = await db.select().from(workers);
      const now = Date.now();

      return allWorkers.map((w) => {
        const heartbeatAge = now - new Date(w.lastHeartbeatAt).getTime();
        let status = w.status;
        if (status === "online" && heartbeatAge > STALE_THRESHOLD_MS) {
          status = "stale";
        }
        return { ...w, status };
      });
    },
  };
}

export type WorkerService = ReturnType<typeof createWorkerService>;
