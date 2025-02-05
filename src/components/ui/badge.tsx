import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  urgent: { label: "Urgente", className: "bg-red-100 text-red-700" },
  high: { label: "Alta", className: "bg-orange-100 text-orange-700" },
  normal: { label: "Normal", className: "bg-blue-100 text-blue-700" },
  low: { label: "Baixa", className: "bg-gray-100 text-gray-600" },
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
