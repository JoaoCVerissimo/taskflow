"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import type { Job } from "@taskflow/shared";

export function useJobs(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<Job[]>(`/jobs${query}`, fetcher, { refreshInterval: 5000 });
}

export function useJob(id: string) {
  return useSWR<Job>(`/jobs/${id}`, fetcher, { refreshInterval: 3000 });
}
