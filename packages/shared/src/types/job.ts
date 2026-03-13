export type JobStatus = "waiting" | "active" | "completed" | "failed" | "dead" | "cancelled";

export type JobPriority = "critical" | "high" | "normal" | "low";

export interface Job {
  id: string;
  queue: string;
  name: string;
  data: Record<string, unknown>;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  progress: number;
  result: Record<string, unknown> | null;
  error: string | null;
  stackTrace: string | null;
  delay: number;
  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  queue: string;
  name: string;
  data: Record<string, unknown>;
  priority?: JobPriority;
  delay?: number;
  maxAttempts?: number;
}
