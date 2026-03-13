import type { JobPriority } from "../types/job.js";

export const PRIORITY_MAP: Record<JobPriority, number> = {
  critical: 1,
  high: 2,
  normal: 5,
  low: 10,
} as const;

export const JOB_DEFAULTS = {
  priority: "normal" as JobPriority,
  maxAttempts: 3,
  backoffDelay: 1000,
  delay: 0,
} as const;
