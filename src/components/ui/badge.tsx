import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  urgent: { label: "Urgente", className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  high: { label: "Alta", className: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
  normal: { label: "Normal", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  low: { label: "Baixa", className: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = priorityConfig[priority];
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}
