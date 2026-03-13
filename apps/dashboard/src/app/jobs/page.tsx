"use client";

import { useState } from "react";
import Link from "next/link";
import { useJobs } from "@/hooks/use-jobs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { truncateId, formatDate } from "@/lib/utils";

const STATUSES = ["", "waiting", "active", "completed", "failed", "dead", "cancelled"];
const QUEUES = ["", "email", "data-processing", "webhook", "report-generation"];

export default function JobsPage() {
  const [status, setStatus] = useState("");
  const [queue, setQueue] = useState("");

  const params: Record<string, string> = { perPage: "50" };
  if (status) params.status = status;
  if (queue) params.queue = queue;

  const { data: jobs, isLoading } = useJobs(params);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Jobs</h2>

      <div className="flex gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={queue}
          onChange={(e) => setQueue(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Queues</option>
          {QUEUES.filter(Boolean).map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Queue</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Priority</th>
                  <th className="pb-2 pr-4">Attempts</th>
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {jobs?.map((job) => (
                  <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {truncateId(job.id)}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{job.queue}</td>
                    <td className="py-2 pr-4">{job.name}</td>
                    <td className="py-2 pr-4">
                      <Badge value={job.status} />
                    </td>
                    <td className="py-2 pr-4">
                      <Badge value={job.priority} />
                    </td>
                    <td className="py-2 pr-4">
                      {job.attempts}/{job.maxAttempts}
                    </td>
                    <td className="py-2 text-gray-500">{formatDate(job.createdAt)}</td>
                  </tr>
                ))}
                {(!jobs || jobs.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
