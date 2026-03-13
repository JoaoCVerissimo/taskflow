# TaskFlow

A distributed job queue system built with Node.js, TypeScript, Redis (BullMQ), and PostgreSQL. Features horizontal worker scaling, retry with exponential backoff, job scheduling, priority queues, and a real-time monitoring dashboard.

## Architecture

```
                    +-----------------+
                    |   Dashboard     |
                    | (Next.js 15)    |
                    |   :3000         |
                    +--------+--------+
                             |
                     HTTP (SWR polling)
                             |
                    +--------v--------+
                    |   API Server    |
                    | (Fastify 5)     |
                    |   :3001         |
                    +--+---------+----+
                       |         |
              +--------v--+  +---v-----------+
              | PostgreSQL |  |    Redis       |
              | (Drizzle)  |  | (BullMQ)       |
              | :5432      |  | :6379          |
              +------+-----+  +---+---------+--+
                     |            |         |
              +------v-----+ +---v---+  +--v--------+
              | (reads for  | |Worker |  | Scheduler |
              |  dashboard) | |(x N)  |  | (cron)    |
              +-------------+ +-------+  +-----------+
```

### Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API** | Fastify 5 | REST API for job submission, monitoring |
| **Worker** | BullMQ | Processes jobs from queues (horizontally scalable) |
| **Scheduler** | cron-parser | Runs scheduled/recurring jobs |
| **Dashboard** | Next.js 15 + Tailwind | Real-time monitoring UI |
| **Queue Broker** | Redis 7 + BullMQ | Job delivery, priority, retry mechanics |
| **Database** | PostgreSQL 16 + Drizzle | Durable job state, audit trail |

### Design Decisions

- **Dual storage**: Redis handles fast job delivery and retry mechanics. PostgreSQL stores the durable audit trail for querying and dashboards.
- **Competing consumers**: Workers atomically dequeue jobs from BullMQ. Multiple workers on the same queue share the workload. Scale by adding more worker containers.
- **Exponential backoff**: Failed jobs retry with `delay = 1000ms * 2^attempt` with jitter. After max retries, jobs move to "dead" status.
- **SWR polling**: The dashboard uses SWR with 3-5 second polling intervals for near-real-time updates without WebSocket complexity.

## Project Structure

```
taskflow/
├── packages/
│   ├── shared/     # Types, constants, validation utils
│   ├── db/         # Drizzle ORM schema + migrations
│   └── queue/      # BullMQ wrapper (queue factories, options builder)
├── apps/
│   ├── api/        # Fastify REST API (:3001)
│   ├── worker/     # Job processor (scalable)
│   ├── scheduler/  # Cron job scheduler
│   └── dashboard/  # Next.js monitoring UI (:3000)
```

## Quick Start

### Prerequisites

- Node.js >= 20
- Docker and Docker Compose

### 1. Install dependencies

```bash
make install
```

### 2. Start infrastructure (Postgres + Redis)

```bash
make infra
```

### 3. Set up environment and run migrations

```bash
cp .env.example .env
make migrate
```

### 4. Start development

```bash
make dev
```

This starts all apps:
- API: http://localhost:3001
- Dashboard: http://localhost:3000

### Docker (Full Stack)

```bash
# Start everything
make docker-up

# Scale workers
docker compose up --scale worker=3 -d

# Stop
make docker-down
```

## API Reference

Base URL: `http://localhost:3001/api/v1`

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/jobs` | Submit a job |
| `GET` | `/jobs` | List jobs (query: status, queue, priority, page, perPage) |
| `GET` | `/jobs/:id` | Get job details |
| `DELETE` | `/jobs/:id` | Cancel a waiting job |
| `POST` | `/jobs/:id/retry` | Retry a failed/dead job |

### Queues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/queues` | List all queues with stats |
| `GET` | `/queues/:name/stats` | Detailed queue statistics |

### Workers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/workers` | List active workers |

### Schedules

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/schedules` | Create a recurring schedule |
| `GET` | `/schedules` | List schedules |
| `PATCH` | `/schedules/:id` | Update (enable/disable) |
| `DELETE` | `/schedules/:id` | Delete a schedule |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

## Example Jobs

```bash
# Submit an email job
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "email",
    "name": "send-welcome",
    "data": {"to": "user@example.com", "subject": "Welcome", "body": "Hello!"},
    "priority": "high"
  }'

# Submit a data processing job
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "data-processing",
    "name": "etl-pipeline",
    "data": {"source": "users_table", "destination": "analytics"},
    "priority": "normal",
    "maxAttempts": 5
  }'

# Submit a webhook job with delay
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "webhook",
    "name": "notify-partner",
    "data": {"url": "https://httpbin.org/post", "payload": {"event": "order.created"}},
    "delay": 5000
  }'

# Submit a report generation job
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "report-generation",
    "name": "monthly-report",
    "data": {"reportType": "monthly", "month": "2024-01"},
    "priority": "low"
  }'

# Create a recurring schedule
curl -X POST http://localhost:3001/api/v1/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hourly health check",
    "queue": "webhook",
    "taskName": "health-ping",
    "cronExpression": "0 * * * *",
    "priority": "low"
  }'

# List all jobs
curl http://localhost:3001/api/v1/jobs

# Get queue stats
curl http://localhost:3001/api/v1/queues

# Check workers
curl http://localhost:3001/api/v1/workers
```

## Available Queues

| Queue | Processor | Description | Failure Rate |
|-------|-----------|-------------|-------------|
| `email` | EmailProcessor | Simulates SMTP email delivery | 20% |
| `data-processing` | DataProcessingProcessor | Simulates long-running ETL | 10% |
| `webhook` | WebhookProcessor | Simulates HTTP POST delivery | 15% |
| `report-generation` | ReportGenerationProcessor | Simulates PDF generation | 5% |

## Priority Levels

| Priority | BullMQ Value | Description |
|----------|-------------|-------------|
| `critical` | 1 | Processed first |
| `high` | 2 | High priority |
| `normal` | 5 | Default |
| `low` | 10 | Processed last |

## Job State Machine

```
waiting → active → completed
                 → failed → waiting (retry, if attempts < max)
                          → dead (if attempts >= max)
waiting → cancelled (via API DELETE)
```

## Retry Logic

- **Strategy**: Exponential backoff (`delay = 1000ms * 2^attempt`)
- **Default retries**: 3 attempts
- **Dead letter**: After max retries exhausted, status becomes `dead`
- **Manual retry**: `POST /api/v1/jobs/:id/retry` resets attempts and re-enqueues

## Horizontal Scaling

Workers are stateless competing consumers. Scale by running more worker instances:

```bash
# Docker Compose
docker compose up --scale worker=5 -d

# Or run multiple worker processes locally
WORKER_CONCURRENCY=10 npm run dev --workspace=@taskflow/worker
```

Each worker:
- Gets a unique ID (`hostname-pid-uuid`)
- Registers itself in PostgreSQL
- Sends heartbeats every 15 seconds
- Processes all 4 queues concurrently

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies |
| `make dev` | Start infra + all apps in dev mode |
| `make build` | Build all packages |
| `make typecheck` | Typecheck all packages |
| `make migrate` | Generate and run DB migrations |
| `make infra` | Start Postgres + Redis only |
| `make infra-down` | Stop infrastructure |
| `make docker-up` | Start full stack in Docker |
| `make docker-down` | Stop Docker services |
| `make clean` | Remove build artifacts |

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Monorepo**: npm workspaces + Turborepo
- **API Framework**: Fastify 5
- **Queue Engine**: BullMQ 5 (Redis-backed)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Cache/Queue Store**: Redis 7
- **Frontend**: Next.js 15, React 19, Tailwind CSS, recharts, SWR
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
