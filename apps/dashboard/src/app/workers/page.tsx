"use client";

import { useWorkers } from "@/hooks/use-workers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

export default function WorkersPage() {
  const { data: workers } = useWorkers();

  if (!workers) return <Spinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Workers</h2>

      {workers.length === 0 && (
        <p className="text-gray-500">No workers registered</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workers.map((worker) => (
          <Card key={worker.id}>
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold">{worker.workerId}</h3>
              <Badge value={worker.status} />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Hostname</dt>
                <dd>{worker.hostname}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">PID</dt>
                <dd>{worker.pid}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Concurrency</dt>
                <dd>{worker.concurrency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Processed</dt>
                <dd className="text-green-600">{worker.processedCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Failed</dt>
                <dd className="text-red-600">{worker.failedCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Heartbeat</dt>
                <dd className="text-xs">{formatDate(worker.lastHeartbeatAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Started</dt>
                <dd className="text-xs">{formatDate(worker.startedAt)}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <p className="text-xs text-gray-500">
                Queues: {(worker.queues as string[]).join(", ")}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
