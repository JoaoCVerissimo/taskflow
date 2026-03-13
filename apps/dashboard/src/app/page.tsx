"use client";

import { useQueues } from "@/hooks/use-queues";
import { useJobs } from "@/hooks/use-jobs";
import { useWorkers } from "@/hooks/use-workers";
import { StatCard, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { truncateId, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function OverviewPage() {
  const { data: queues } = useQueues();
  const { data: jobs } = useJobs({ perPage: "10" });
  const { data: workers } = useWorkers();

  if (!queues || !jobs || !workers) return <Spinner />;

  const totalJobs = queues.reduce(
    (sum, q) => sum + q.waiting + q.active + q.completed + q.failed + q.dead,
    0,
  );
  const activeQueues = queues.filter((q) => q.waiting + q.active > 0).length;
  const onlineWorkers = workers.filter((w) => w.status === "online").length;

  const chartData = queues.map((q) => ({
    name: q.name,
    waiting: q.waiting,
    active: q.active,
    completed: q.completed,
    failed: q.failed,
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Jobs" value={totalJobs} />
        <StatCard title="Active Queues" value={activeQueues} subtitle={`of ${queues.length}`} />
        <StatCard
          title="Online Workers"
          value={onlineWorkers}
          subtitle={`of ${workers.length}`}
        />
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">Queue Depth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="waiting" fill="#facc15" name="Waiting" />
            <Bar dataKey="active" fill="#3b82f6" name="Active" />
            <Bar dataKey="completed" fill="#22c55e" name="Completed" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">Recent Jobs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Queue</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Priority</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs">{truncateId(job.id)}</td>
                  <td className="py-2 pr-4">{job.queue}</td>
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
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No jobs yet
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
