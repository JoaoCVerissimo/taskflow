import type { FastifyInstance } from "fastify";
import type { JobPriority } from "@taskflow/shared";
import { isValidQueue, isValidCron } from "@taskflow/shared";
import { createScheduleService } from "../services/schedule.service.js";
import { ValidationError } from "../lib/errors.js";

export async function scheduleRoutes(fastify: FastifyInstance) {
  const scheduleService = createScheduleService(fastify.db);

  fastify.post<{
    Body: {
      name: string;
      queue: string;
      taskName: string;
      data?: Record<string, unknown>;
      cronExpression: string;
      timezone?: string;
      priority?: string;
      maxAttempts?: number;
    };
  }>("/api/v1/schedules", async (request, reply) => {
    const { name, queue, taskName, data, cronExpression, timezone, priority, maxAttempts } =
      request.body;

    if (!name || !queue || !taskName || !cronExpression) {
      throw new ValidationError("name, queue, taskName, and cronExpression are required");
    }
    if (!isValidQueue(queue)) {
      throw new ValidationError(`Invalid queue: ${queue}`);
    }
    if (!isValidCron(cronExpression)) {
      throw new ValidationError(`Invalid cron expression: ${cronExpression}`);
    }

    const schedule = await scheduleService.create({
      name,
      queue,
      taskName,
      data,
      cronExpression,
      timezone,
      priority: priority as JobPriority | undefined,
      maxAttempts,
    });

    return reply.code(201).send({ data: schedule });
  });

  fastify.get("/api/v1/schedules", async () => {
    const schedules = await scheduleService.list();
    return { data: schedules };
  });

  fastify.patch<{ Params: { id: string }; Body: { enabled?: boolean } }>(
    "/api/v1/schedules/:id",
    async (request) => {
      const schedule = await scheduleService.update(request.params.id, request.body);
      return { data: schedule };
    },
  );

  fastify.delete<{ Params: { id: string } }>("/api/v1/schedules/:id", async (request) => {
    const schedule = await scheduleService.remove(request.params.id);
    return { data: schedule };
  });
}
