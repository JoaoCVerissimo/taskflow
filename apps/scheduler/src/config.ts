export interface SchedulerConfig {
  databaseUrl: string;
  redisUrl: string;
}

export function loadConfig(): SchedulerConfig {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
  };

  return {
    databaseUrl: required("DATABASE_URL"),
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  };
}
