import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as jobsSchema from "./schema/jobs.js";
import * as jobSchedulesSchema from "./schema/job-schedules.js";
import * as workersSchema from "./schema/workers.js";

export const schema = {
  ...jobsSchema,
  ...jobSchedulesSchema,
  ...workersSchema,
};

export function createDb(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

export { jobs, jobStatusEnum } from "./schema/jobs.js";
export { jobSchedules } from "./schema/job-schedules.js";
export { workers, workerStatusEnum } from "./schema/workers.js";
