import { Queue, Worker, type Processor, type WorkerOptions, type JobsOptions } from "bullmq";
import { PRIORITY_MAP, type JobPriority } from "@taskflow/shared";
import { parseRedisUrl } from "./connection.js";

const queues = new Map<string, Queue>();

export function getQueue(name: string, redisUrl: string): Queue {
  const key = `${name}:${redisUrl}`;
  let queue = queues.get(key);
  if (!queue) {
    queue = new Queue(name, { connection: parseRedisUrl(redisUrl) });
    queues.set(key, queue);
  }
  return queue;
}

export function createWorker(
  name: string,
  processor: Processor,
  redisUrl: string,
  opts?: Partial<WorkerOptions>,
): Worker {
  return new Worker(name, processor, {
    connection: parseRedisUrl(redisUrl),
    concurrency: 5,
    ...opts,
  });
}

export async function closeAllQueues(): Promise<void> {
  const promises = Array.from(queues.values()).map((q) => q.close());
  await Promise.all(promises);
  queues.clear();
}

export class JobOptionsBuilder {
  private opts: JobsOptions = {};

  priority(level: JobPriority): this {
    this.opts.priority = PRIORITY_MAP[level];
    return this;
  }

  attempts(count: number): this {
    this.opts.attempts = count;
    return this;
  }

  backoff(type: "exponential" | "fixed", delay: number): this {
    this.opts.backoff = { type, delay };
    return this;
  }

  delay(ms: number): this {
    this.opts.delay = ms;
    return this;
  }

  build(): JobsOptions {
    return { ...this.opts };
  }
}

export type { Queue, Worker, Job, Processor } from "bullmq";
