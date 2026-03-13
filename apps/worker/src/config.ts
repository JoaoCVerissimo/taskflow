export interface WorkerConfig {
  databaseUrl: string;
  redisUrl: string;
  concurrency: number;
}

export function loadConfig(): WorkerConfig {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
  };

  return {
    databaseUrl: required("DATABASE_URL"),
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? "5", 10),
  };
}
