"use client";

import { useState, useMemo } from "react";
import { Kanban, List, Plus, Search, Menu } from "lucide-react";
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
import { useShell } from "@/app/app/[workspaceId]/workspace-shell";
import type { SpaceWithData, TaskData, UserSummary } from "@/types";

interface Props {
  space: SpaceWithData;
  workspaceSlug: string;
  currentUser: UserSummary;
  members: UserSummary[];
}

const METHODOLOGY_LABELS: Record<string, string> = {
  kanban: "Kanban", scrum: "Scrum", okr: "OKR", canvas: "Business Canvas", retro: "Retrospectiva",
};
const METHODOLOGY_EMOJIS: Record<string, string> = {
  kanban: "🗂️", scrum: "🏃", okr: "🎯", canvas: "🧩", retro: "🔄",
};

export function SpaceClient({ space: initialSpace, workspaceSlug, currentUser, members }: Props) {
  const [space, setSpace] = useState(initialSpace);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const { openSidebar } = useShell();

  const methodology = space.methodologyType || "kanban";
  const isKanban = methodology === "kanban";

  const allTasks = useMemo(() => space.lists.flatMap((l) => l.tasks), [space.lists]);
  const filteredTasks = useMemo(
    () => search ? allTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())) : allTasks,
    [search, allTasks]
  );

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

  const header = (
    <header className="flex items-center gap-2 sm:gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 sm:px-6 py-3">
      {/* Mobile hamburger */}
      <button
        onClick={openSidebar}
        className="md:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl">{space.icon}</span>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{space.name}</h1>
        {methodology !== "kanban" && (
          <span className="hidden sm:inline rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
            {METHODOLOGY_EMOJIS[methodology]} {METHODOLOGY_LABELS[methodology]}
          </span>
        )}
      </div>

      {isKanban && (
        <>
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
            <button
              onClick={() => setView("kanban")}
              aria-label="Visualização Kanban"
              className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors", view === "kanban" ? "bg-violet-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")}
            >
              <Kanban className="h-4 w-4" /> Kanban
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="Visualização Lista"
              className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors", view === "list" ? "bg-violet-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")}
            >
              <List className="h-4 w-4" /> Lista
            </button>
          </div>

          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefas..."
              aria-label="Buscar tarefas"
              className="h-8 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Mobile view toggle */}
          <div className="sm:hidden flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
            <button onClick={() => setView("kanban")} className={cn("rounded-md p-1.5", view === "kanban" ? "bg-violet-600 text-white" : "text-gray-500")}>
              <Kanban className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setView("list")} className={cn("rounded-md p-1.5", view === "list" ? "bg-violet-600 text-white" : "text-gray-500")}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      <Button size="sm" onClick={() => setCreateOpen(true)} className="ml-auto shrink-0 gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Nova tarefa</span>
      </Button>
    </header>
  );

  if (methodology === "okr") return <div className="flex h-full flex-col overflow-hidden">{header}<OkrView space={space} members={members} currentUser={currentUser} /></div>;
  if (methodology === "scrum") return <div className="flex h-full flex-col overflow-hidden">{header}<ScrumView space={space} members={members} currentUser={currentUser} onSpaceUpdate={setSpace} /></div>;
  if (methodology === "canvas") return <div className="flex h-full flex-col overflow-hidden">{header}<CanvasView space={space} /></div>;
  if (methodology === "retro") return <div className="flex h-full flex-col overflow-hidden">{header}<RetroView space={space} currentUser={currentUser} /></div>;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {header}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
        {view === "kanban" ? (
          <KanbanBoard space={space} tasks={filteredTasks} onTaskClick={setSelectedTask} onTaskUpdate={updateTask} />
        ) : (
          <ListView space={space} tasks={filteredTasks} onTaskClick={setSelectedTask} onTaskUpdate={updateTask} />
        )}
      </div>

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} space={space} currentUser={currentUser} members={members} onCreated={addTask} />

      {selectedTask && (
        <TaskDetailModal task={selectedTask} space={space} members={members} currentUser={currentUser} onClose={() => setSelectedTask(null)} onUpdate={updateTask} onDelete={removeTask} />
      )}
    </div>
  );
}
