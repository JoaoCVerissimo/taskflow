import type { JobPriority } from "./job.js";

export interface JobSchedule {
  id: string;
  name: string;
  queue: string;
  taskName: string;
  data: Record<string, unknown> | null;
  cronExpression: string;
  timezone: string;
  priority: JobPriority;
  maxAttempts: number;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  name: string;
  queue: string;
  taskName: string;
  data?: Record<string, unknown>;
  cronExpression: string;
  timezone?: string;
  priority?: JobPriority;
  maxAttempts?: number;
}
