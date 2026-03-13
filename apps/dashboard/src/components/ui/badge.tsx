import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  waiting: "bg-yellow-100 text-yellow-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  dead: "bg-gray-100 text-gray-800",
  cancelled: "bg-gray-100 text-gray-500",
  online: "bg-green-100 text-green-800",
  stale: "bg-yellow-100 text-yellow-800",
  offline: "bg-red-100 text-red-800",
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  normal: "bg-blue-100 text-blue-800",
  low: "bg-gray-100 text-gray-600",
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[value] ?? "bg-gray-100 text-gray-800",
        className,
      )}
    >
      {value}
    </span>
  );
}
