"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import type { WorkerInfo } from "@taskflow/shared";

export function useWorkers() {
  return useSWR<WorkerInfo[]>("/workers", fetcher, { refreshInterval: 5000 });
}
