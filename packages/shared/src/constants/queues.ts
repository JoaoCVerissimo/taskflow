export const QUEUE_NAMES = {
  EMAIL: "email",
  DATA_PROCESSING: "data-processing",
  WEBHOOK: "webhook",
  REPORT_GENERATION: "report-generation",
} as const;

export const ALL_QUEUES = Object.values(QUEUE_NAMES);

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
