"use client";

import Link from "next/link";
import { useQueues } from "@/hooks/use-queues";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function QueuesPage() {
  const { data: queues } = useQueues();

  if (!queues) return <Spinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Queues</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {queues.map((q) => (
          <Link key={q.name} href={`/queues/${q.name}`}>
            <Card className="cursor-pointer transition hover:shadow-md">
              <h3 className="text-lg font-semibold">{q.name}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Waiting:</span>{" "}
                  <span className="font-medium text-yellow-600">{q.waiting}</span>
                </div>
                <div>
                  <span className="text-gray-500">Active:</span>{" "}
                  <span className="font-medium text-blue-600">{q.active}</span>
                </div>
                <div>
                  <span className="text-gray-500">Completed:</span>{" "}
                  <span className="font-medium text-green-600">{q.completed}</span>
                </div>
                <div>
                  <span className="text-gray-500">Failed:</span>{" "}
                  <span className="font-medium text-red-600">{q.failed}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dead:</span>{" "}
                  <span className="font-medium text-gray-600">{q.dead}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
