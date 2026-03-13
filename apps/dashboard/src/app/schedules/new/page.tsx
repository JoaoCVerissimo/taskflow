"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { apiPost } from "@/lib/api-client";

const QUEUES = ["email", "data-processing", "webhook", "report-generation"];
const PRIORITIES = ["critical", "high", "normal", "low"];

export default function NewSchedulePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    queue: "email",
    taskName: "",
    cronExpression: "",
    timezone: "UTC",
    priority: "normal",
    maxAttempts: 3,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/schedules", form);
      router.push("/schedules");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
    }
  };

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Schedule</h2>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Daily email digest"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Queue</label>
              <select
                value={form.queue}
                onChange={(e) => update("queue", e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                {QUEUES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Name</label>
              <input
                type="text"
                value={form.taskName}
                onChange={(e) => update("taskName", e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="send-digest"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cron Expression</label>
            <input
              type="text"
              value={form.cronExpression}
              onChange={(e) => update("cronExpression", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono"
              placeholder="0 9 * * *"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: minute hour day-of-month month day-of-week
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Attempts</label>
              <input
                type="number"
                value={form.maxAttempts}
                onChange={(e) => update("maxAttempts", parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                min={1}
                max={10}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Create Schedule
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
