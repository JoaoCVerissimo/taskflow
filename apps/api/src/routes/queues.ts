import type { FastifyInstance } from "fastify";
import { createQueueService } from "../services/queue.service.js";

export async function queueRoutes(fastify: FastifyInstance) {
  const queueService = createQueueService(fastify.db);

  fastify.get("/api/v1/queues", async () => {
    const stats = await queueService.listAll();
    return { data: stats };
  });

  fastify.get<{ Params: { name: string } }>("/api/v1/queues/:name/stats", async (request) => {
    const stats = await queueService.getStats(request.params.name);
    return { data: stats };
  });
}
