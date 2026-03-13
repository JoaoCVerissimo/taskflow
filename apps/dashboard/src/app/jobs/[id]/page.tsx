"use client";

import { use } from "react";
import { useJob } from "@/hooks/use-jobs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { apiPost, apiDelete } from "@/lib/api-client";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: job, mutate } = useJob(id);

  if (!job) return <Spinner />;

  const handleRetry = async () => {
    await apiPost(`/jobs/${id}/retry`, {});
    mutate();
  };

  const handleCancel = async () => {
    await apiDelete(`/jobs/${id}`);
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Detail</h2>
        <div className="flex gap-2">
          {(job.status === "failed" || job.status === "dead") && (
            <button
              onClick={handleRetry}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Retry
            </button>
          )}
          {job.status === "waiting" && (
            <button
              onClick={handleCancel}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">ID</dt>
            <dd className="mt-1 font-mono">{job.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge value={job.status} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Queue</dt>
            <dd className="mt-1">{job.queue}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Name</dt>
            <dd className="mt-1">{job.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Priority</dt>
            <dd className="mt-1">
              <Badge value={job.priority} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Attempts</dt>
            <dd className="mt-1">
              {job.attempts}/{job.maxAttempts}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Progress</dt>
            <dd className="mt-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span>{job.progress}%</span>
              </div>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Delay</dt>
            <dd className="mt-1">{job.delay}ms</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Created</dt>
            <dd className="mt-1">{formatDate(job.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Started</dt>
            <dd className="mt-1">{formatDate(job.startedAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Completed</dt>
            <dd className="mt-1">{formatDate(job.completedAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Failed</dt>
            <dd className="mt-1">{formatDate(job.failedAt)}</dd>
          </div>
        </dl>
      </Card>

      {job.data && Object.keys(job.data).length > 0 && (
        <Card>
          <h3 className="mb-2 font-semibold">Payload</h3>
          <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(job.data, null, 2)}
          </pre>
        </Card>
      )}

      {job.result && (
        <Card>
          <h3 className="mb-2 font-semibold">Result</h3>
          <pre className="overflow-x-auto rounded bg-green-50 p-3 text-xs">
            {JSON.stringify(job.result, null, 2)}
          </pre>
        </Card>
      )}

      {job.error && (
        <Card>
          <h3 className="mb-2 font-semibold text-red-600">Error</h3>
          <p className="text-sm text-red-700">{job.error}</p>
          {job.stackTrace && (
            <pre className="mt-2 overflow-x-auto rounded bg-red-50 p-3 text-xs text-red-800">
              {job.stackTrace}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
}
