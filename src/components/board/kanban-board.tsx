"use client";

import { useState, useCallback } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import type { SpaceWithData, TaskData, TaskStatusData } from "@/types";

interface KanbanBoardProps {
  space: SpaceWithData;
  tasks: TaskData[];
  onTaskClick: (task: TaskData) => void;
  onTaskUpdate: (task: TaskData) => void;
}

function SortableTaskCard({ task, onTaskClick }: { task: TaskData; onTaskClick: (t: TaskData) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onTaskClick} dragging={isDragging} />
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: TaskStatusData;
  tasks: TaskData[];
  onTaskClick: (t: TaskData) => void;
}) {
  return (
    <div className="flex w-64 shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{status.name}</span>
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-16">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>

      <button className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Plus className="h-3.5 w-3.5" /> Adicionar tarefa
      </button>
    </div>
  );
}

export function KanbanBoard({ space, tasks, onTaskClick, onTaskUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = space.statuses.reduce<Record<string, TaskData[]>>((acc, s) => {
    acc[s.id] = tasks.filter((t) => t.statusId === s.id).sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const overTask = tasks.find((t) => t.id === over.id);
    const targetStatusId = overTask ? overTask.statusId : (over.id as string);
    if (targetStatusId === task.statusId) return;

    const updated = { ...task, statusId: targetStatusId, status: space.statuses.find((s) => s.id === targetStatusId)! };
    onTaskUpdate(updated);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: targetStatusId }),
      });
      if (!res.ok) onTaskUpdate(task);
    } catch {
      onTaskUpdate(task);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-5 overflow-x-auto p-4 sm:p-6">
        {space.statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={tasksByStatus[status.id] ?? []}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onClick={() => {}} dragging />}
      </DragOverlay>
    </DndContext>
  );
}
