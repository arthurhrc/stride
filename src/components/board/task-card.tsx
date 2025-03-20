import { MessageSquare, Calendar } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/ui/badge";
import type { TaskData } from "@/types";

interface TaskCardProps {
  task: TaskData;
  onClick: (task: TaskData) => void;
  dragging?: boolean;
}

const priorityDot: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-400",
  normal: "bg-blue-400",
  low: "bg-gray-300",
};

export function TaskCard({ task, onClick, dragging }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status.type !== "done";

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        "group cursor-pointer rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm transition-all hover:shadow-md hover:border-violet-200 dark:hover:border-violet-700",
        dragging && "rotate-1 scale-105 shadow-lg opacity-90"
      )}
    >
      <div className="mb-2 flex items-start gap-2">
        <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", priorityDot[task.priority])} />
        <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">{task.title}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-xs", isOverdue ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400")}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <MessageSquare className="h-3 w-3" />
              {task._count!.comments}
            </span>
          )}
        </div>
        {task.assignee && <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size="sm" />}
      </div>
    </div>
  );
}
