"use client";

import { useState } from "react";
import { Kanban, List, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/board/list-view";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskDetailModal } from "@/components/task/task-detail-modal";
import { OkrView } from "@/components/methodology/okr-view";
import { ScrumView } from "@/components/methodology/scrum-view";
import { CanvasView } from "@/components/methodology/canvas-view";
import { RetroView } from "@/components/methodology/retro-view";
import type { SpaceWithData, TaskData, UserSummary } from "@/types";

interface Props {
  space: SpaceWithData;
  workspaceSlug: string;
  currentUser: UserSummary;
  members: UserSummary[];
}

const METHODOLOGY_LABELS: Record<string, string> = {
  kanban: "Kanban",
  scrum: "Scrum",
  okr: "OKR",
  canvas: "Business Canvas",
  retro: "Retrospectiva",
};

const METHODOLOGY_EMOJIS: Record<string, string> = {
  kanban: "🗂️",
  scrum: "🏃",
  okr: "🎯",
  canvas: "🧩",
  retro: "🔄",
};

export function SpaceClient({ space: initialSpace, workspaceSlug, currentUser, members }: Props) {
  const [space, setSpace] = useState(initialSpace);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  const methodology = space.methodologyType || "kanban";
  const isKanban = methodology === "kanban";

  const allTasks = space.lists.flatMap((l) => l.tasks);
  const filteredTasks = search
    ? allTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : allTasks;

  function updateTask(updated: TaskData) {
    setSpace((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        tasks: list.tasks.map((t) => (t.id === updated.id ? updated : t)),
      })),
    }));
    if (selectedTask?.id === updated.id) setSelectedTask(updated);
  }

  function addTask(task: TaskData) {
    setSpace((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === task.listId ? { ...list, tasks: [...list.tasks, task] } : list
      ),
    }));
  }

  function removeTask(taskId: string) {
    setSpace((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        tasks: list.tasks.filter((t) => t.id !== taskId),
      })),
    }));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  }

  // Header shared by all views
  const header = (
    <header className="flex items-center gap-4 border-b border-gray-100 px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{space.icon}</span>
        <h1 className="text-lg font-semibold text-gray-900">{space.name}</h1>
        {methodology !== "kanban" && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
            {METHODOLOGY_EMOJIS[methodology]} {METHODOLOGY_LABELS[methodology]}
          </span>
        )}
      </div>

      {isKanban && (
        <>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors", view === "kanban" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700")}
            >
              <Kanban className="h-4 w-4" /> Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors", view === "list" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700")}
            >
              <List className="h-4 w-4" /> Lista
            </button>
          </div>

          <div className="relative ml-2 flex-1 max-w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefas..."
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-gray-400"
            />
          </div>

          <Button size="sm" onClick={() => setCreateOpen(true)} className="ml-auto gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Nova tarefa
          </Button>
        </>
      )}
    </header>
  );

  // Non-kanban methodologies render their own full content
  if (methodology === "okr") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {header}
        <OkrView space={space} members={members} currentUser={currentUser} />
      </div>
    );
  }

  if (methodology === "scrum") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {header}
        <ScrumView space={space} members={members} currentUser={currentUser} onSpaceUpdate={setSpace} />
      </div>
    );
  }

  if (methodology === "canvas") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {header}
        <CanvasView space={space} />
      </div>
    );
  }

  if (methodology === "retro") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {header}
        <RetroView space={space} currentUser={currentUser} />
      </div>
    );
  }

  // Default: kanban
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {header}

      <div className="flex-1 overflow-hidden">
        {view === "kanban" ? (
          <KanbanBoard
            space={space}
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
            onTaskUpdate={updateTask}
          />
        ) : (
          <ListView
            space={space}
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
            onTaskUpdate={updateTask}
          />
        )}
      </div>

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        space={space}
        currentUser={currentUser}
        members={members}
        onCreated={addTask}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          space={space}
          members={members}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={removeTask}
        />
      )}
    </div>
  );
}
