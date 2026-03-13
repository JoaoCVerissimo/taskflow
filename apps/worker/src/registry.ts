import type { Job, Processor } from "bullmq";
import type { Database } from "@taskflow/db";
import { QUEUE_NAMES } from "@taskflow/shared";
import { processEmail } from "./processors/email.processor.js";
import { processDataProcessing } from "./processors/data-processing.processor.js";
import { processWebhook } from "./processors/webhook.processor.js";
import { processReportGeneration } from "./processors/report-generation.processor.js";

export function createProcessorRegistry(db: Database) {
  const processors = new Map<string, Processor>();

  processors.set(QUEUE_NAMES.EMAIL, async (job: Job) => processEmail(job, db));
  processors.set(QUEUE_NAMES.DATA_PROCESSING, async (job: Job) => processDataProcessing(job, db));
  processors.set(QUEUE_NAMES.WEBHOOK, async (job: Job) => processWebhook(job, db));
  processors.set(QUEUE_NAMES.REPORT_GENERATION, async (job: Job) => processReportGeneration(job, db));

  return {
    getProcessor(queueName: string): Processor {
      const processor = processors.get(queueName);
      if (!processor) throw new Error(`No processor registered for queue: ${queueName}`);
      return processor;
    },
    getAllQueues(): string[] {
      return Array.from(processors.keys());
    },
  };
}
