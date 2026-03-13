export type WorkerStatus = "online" | "stale" | "offline";

export interface WorkerInfo {
  id: string;
  workerId: string;
  hostname: string;
  pid: number;
  queues: string[];
  concurrency: number;
  status: WorkerStatus;
  lastHeartbeatAt: string;
  startedAt: string;
  stoppedAt: string | null;
  processedCount: number;
  failedCount: number;
}
