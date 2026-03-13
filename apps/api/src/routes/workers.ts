import type { FastifyInstance } from "fastify";
import { createWorkerService } from "../services/worker.service.js";

export async function workerRoutes(fastify: FastifyInstance) {
  const workerService = createWorkerService(fastify.db);

  fastify.get("/api/v1/workers", async () => {
    const workers = await workerService.list();
    return { data: workers };
  });
}
