"use client";

import { use } from "react";
import { useQueueStats } from "@/hooks/use-queues";
import { useJobs } from "@/hooks/use-jobs";
import { StatCard, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { truncateId, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function QueueDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const { data: stats } = useQueueStats(name);
  const { data: jobs } = useJobs({ queue: name, perPage: "20" });

  if (!stats) return <Spinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Queue: {name}</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard title="Waiting" value={stats.waiting} />
        <StatCard title="Active" value={stats.active} />
        <StatCard title="Completed" value={stats.completed} />
        <StatCard title="Failed" value={stats.failed} />
        <StatCard title="Dead" value={stats.dead} />
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">Jobs in Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Priority</th>
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
                  <td className="py-2 pr-4">{job.name}</td>
                  <td className="py-2 pr-4">
                    <Badge value={job.status} />
                  </td>
                  <td className="py-2 pr-4">
                    <Badge value={job.priority} />
                  </td>
                  <td className="py-2 text-gray-500">{formatDate(job.createdAt)}</td>
                </tr>
              ))}
              {(!jobs || jobs.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No jobs in this queue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
