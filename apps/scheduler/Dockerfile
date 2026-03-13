FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/queue/package.json packages/queue/
COPY apps/scheduler/package.json apps/scheduler/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx turbo run build --filter=@taskflow/scheduler

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/queue/dist ./packages/queue/dist
COPY --from=builder /app/packages/queue/package.json ./packages/queue/
COPY --from=builder /app/apps/scheduler/dist ./apps/scheduler/dist
COPY --from=builder /app/apps/scheduler/package.json ./apps/scheduler/

CMD ["node", "apps/scheduler/dist/index.js"]
