"use client";

import { Calendar, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/ui/badge";
import type { SpaceWithData, TaskData } from "@/types";

interface ListViewProps {
  space: SpaceWithData;
  tasks: TaskData[];
  onTaskClick: (task: TaskData) => void;
  onTaskUpdate: (task: TaskData) => void;
}

function TaskRow({ task, onTaskClick, statuses }: { task: TaskData; onTaskClick: (t: TaskData) => void; statuses: SpaceWithData["statuses"] }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status.type !== "done";

  return (
    <div
      onClick={() => onTaskClick(task)}
      className="group flex cursor-pointer items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div
        className="h-3 w-3 shrink-0 rounded-full border-2"
        style={{ borderColor: task.status.color, backgroundColor: task.status.type === "done" ? task.status.color : "transparent" }}
        title={task.status.name}
      />
      <span className={cn("flex-1 text-sm text-gray-800 dark:text-gray-100 truncate", task.status.type === "done" && "line-through text-gray-400 dark:text-gray-500")}>
        {task.title}
      </span>
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500")}>
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
        {task.assignee ? (
          <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size="sm" />
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-600" />
        )}
      </div>
    </div>
  );
}

export function ListView({ space, tasks, onTaskClick, onTaskUpdate }: ListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const tasksByList = space.lists.reduce<Record<string, TaskData[]>>((acc, list) => {
    acc[list.id] = tasks.filter((t) => t.listId === list.id);
    return acc;
  }, {});

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2">
        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 dark:text-gray-500">
          <span className="flex-1">Tarefa</span>
          <span className="w-16">Prioridade</span>
          <span className="w-20">Prazo</span>
          <span className="w-16">Comentários</span>
          <span className="w-8">Resp.</span>
        </div>
      </div>

      {space.lists.map((list) => {
        const listTasks = tasksByList[list.id] ?? [];
        const isCollapsed = collapsed[list.id];
        return (
          <div key={list.id}>
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [list.id]: !c[list.id] }))}
              className="flex w-full items-center gap-2 bg-gray-50 dark:bg-gray-800/60 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              {list.name}
              <span className="ml-1 text-xs font-normal text-gray-400">({listTasks.length})</span>
            </button>
            {!isCollapsed && (
              <>
                {listTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onTaskClick={onTaskClick} statuses={space.statuses} />
                ))}
                {listTasks.length === 0 && (
                  <div className="px-4 py-4 text-sm text-gray-400 dark:text-gray-500">Nenhuma tarefa</div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
