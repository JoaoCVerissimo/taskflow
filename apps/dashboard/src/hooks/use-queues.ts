"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import type { QueueStats } from "@taskflow/shared";

export function useQueues() {
  return useSWR<QueueStats[]>("/queues", fetcher, { refreshInterval: 5000 });
}

export function useQueueStats(name: string) {
  return useSWR<QueueStats>(`/queues/${name}/stats`, fetcher, { refreshInterval: 3000 });
}
