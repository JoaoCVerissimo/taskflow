CREATE TYPE "public"."job_status" AS ENUM('waiting', 'active', 'completed', 'failed', 'dead', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."worker_status" AS ENUM('online', 'stale', 'offline');--> statement-breakpoint
CREATE TABLE "job_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"queue" varchar(100) NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"data" jsonb,
	"cron_expression" varchar(100) NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "job_status" DEFAULT 'waiting' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"result" jsonb,
	"error" text,
	"stack_trace" text,
	"delay" integer DEFAULT 0 NOT NULL,
	"scheduled_for" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" varchar(255) NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"pid" integer NOT NULL,
	"queues" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"concurrency" integer NOT NULL,
	"status" "worker_status" DEFAULT 'online' NOT NULL,
	"last_heartbeat_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stopped_at" timestamp with time zone,
	"processed_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "workers_worker_id_unique" UNIQUE("worker_id")
);
--> statement-breakpoint
CREATE INDEX "idx_jobs_status" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_jobs_queue" ON "jobs" USING btree ("queue");--> statement-breakpoint
CREATE INDEX "idx_jobs_priority" ON "jobs" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_jobs_created_at" ON "jobs" USING btree ("created_at");