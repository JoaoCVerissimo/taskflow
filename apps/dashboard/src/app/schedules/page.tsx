"use client";

import Link from "next/link";
import { useSchedules } from "@/hooks/use-schedules";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { apiPatch } from "@/lib/api-client";
import { mutate } from "swr";

export default function SchedulesPage() {
  const { data: schedules } = useSchedules();

  if (!schedules) return <Spinner />;

  const toggleSchedule = async (id: string, enabled: boolean) => {
    await apiPatch(`/schedules/${id}`, { enabled: !enabled });
    mutate("/schedules");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedules</h2>
        <Link
          href="/schedules/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          New Schedule
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Queue</th>
                <th className="pb-2 pr-4">Task</th>
                <th className="pb-2 pr-4">Cron</th>
                <th className="pb-2 pr-4">Priority</th>
                <th className="pb-2 pr-4">Last Run</th>
                <th className="pb-2 pr-4">Next Run</th>
                <th className="pb-2">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{s.name}</td>
                  <td className="py-2 pr-4">{s.queue}</td>
                  <td className="py-2 pr-4">{s.taskName}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{s.cronExpression}</td>
                  <td className="py-2 pr-4">
                    <Badge value={s.priority} />
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-500">
                    {formatDate(s.lastRunAt)}
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-500">
                    {formatDate(s.nextRunAt)}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleSchedule(s.id, s.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        s.enabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          s.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    No schedules configured
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
