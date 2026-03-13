import { ALL_QUEUES } from "../constants/queues.js";
import { PRIORITY_MAP } from "../constants/priorities.js";
import type { JobPriority } from "../types/job.js";

export function isValidQueue(queue: string): boolean {
  return ALL_QUEUES.includes(queue as typeof ALL_QUEUES[number]);
}

export function isValidPriority(priority: string): priority is JobPriority {
  return priority in PRIORITY_MAP;
}

export function isValidCron(expression: string): boolean {
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}
