import type { FastifyInstance } from "fastify";
import type { JobStatus, JobPriority } from "@taskflow/shared";
import { isValidQueue, isValidPriority } from "@taskflow/shared";
import { createJobService } from "../services/job.service.js";
import { parsePagination, buildPaginationMeta } from "../lib/pagination.js";
import { ValidationError } from "../lib/errors.js";

export async function jobRoutes(fastify: FastifyInstance) {
  const jobService = createJobService(fastify.db, fastify.redisUrl);

  fastify.post<{
    Body: {
      queue: string;
      name: string;
      data: Record<string, unknown>;
      priority?: string;
      delay?: number;
      maxAttempts?: number;
    };
  }>("/api/v1/jobs", async (request, reply) => {
    const { queue, name, data, priority, delay, maxAttempts } = request.body;

    if (!queue || !name) {
      throw new ValidationError("queue and name are required");
    }
    if (!isValidQueue(queue)) {
      throw new ValidationError(`Invalid queue: ${queue}`);
    }
    if (priority && !isValidPriority(priority)) {
      throw new ValidationError(`Invalid priority: ${priority}`);
    }

    const job = await jobService.create({
      queue,
      name,
      data: data ?? {},
      priority: (priority as JobPriority) ?? undefined,
      delay,
      maxAttempts,
    });

    return reply.code(201).send({ data: job });
  });

  fastify.get<{
    Querystring: {
      status?: string;
      queue?: string;
      priority?: string;
      page?: number;
      perPage?: number;
    };
  }>("/api/v1/jobs", async (request) => {
    const { status, queue, priority, page, perPage } = request.query;
    const pagination = parsePagination({ page, perPage });

    const { items, total } = await jobService.list({
      status: status as JobStatus | undefined,
      queue,
      priority: priority as JobPriority | undefined,
      limit: pagination.perPage,
      offset: pagination.offset,
    });

    return {
      data: items,
      meta: buildPaginationMeta(pagination.page, pagination.perPage, total),
    };
  });

  fastify.get<{ Params: { id: string } }>("/api/v1/jobs/:id", async (request) => {
    const job = await jobService.findById(request.params.id);
    return { data: job };
  });

  fastify.delete<{ Params: { id: string } }>("/api/v1/jobs/:id", async (request) => {
    const job = await jobService.cancel(request.params.id);
    return { data: job };
  });

  fastify.post<{ Params: { id: string } }>("/api/v1/jobs/:id/retry", async (request) => {
    const job = await jobService.retry(request.params.id);
    return { data: job };
  });
}
