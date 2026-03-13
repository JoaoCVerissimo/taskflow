"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import type { JobSchedule } from "@taskflow/shared";

export function useSchedules() {
  return useSWR<JobSchedule[]>("/schedules", fetcher, { refreshInterval: 5000 });
}
