import type { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/api/v1/health", async (request, reply) => {
    try {
      await fastify.redis.ping();
      return { status: "ok", redis: "connected", timestamp: new Date().toISOString() };
    } catch {
      return reply.code(503).send({ status: "error", redis: "disconnected" });
    }
  });
}
