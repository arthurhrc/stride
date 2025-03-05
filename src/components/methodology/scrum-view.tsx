"use client";

import { useState } from "react";
import { Plus, Play, CheckCircle2, LayoutGrid, List, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { SpaceWithData, TaskData, SprintData, UserSummary } from "@/types";
import { KanbanBoard } from "@/components/board/kanban-board";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskDetailModal } from "@/components/task/task-detail-modal";

interface Props {
  space: SpaceWithData;
  members: UserSummary[];
  currentUser: UserSummary;
  onSpaceUpdate: (space: SpaceWithData) => void;
}

const PRIORITY_POINTS: Record<string, number> = { urgent: 13, high: 8, normal: 5, low: 2 };

function SprintBadge({ status }: { status: string }) {
  if (status === "active") return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Ativo</span>;
  if (status === "completed") return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Concluído</span>;
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Planejamento</span>;
}

function BacklogRow({
  task,
  sprints,
  onAssign,
  onClick,
}: {
  task: TaskData;
  sprints: SprintData[];
  onAssign: (taskId: string, sprintId: string | null) => void;
  onClick: (task: TaskData) => void;
}) {
  const points = task.storyPoints ?? PRIORITY_POINTS[task.priority] ?? 5;

  return (
    <div
      onClick={() => onClick(task)}
      className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-2.5 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer"
    >
      <span
        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
        style={{ backgroundColor: task.status.color }}
        title={task.status.name}
      >
        {points}
      </span>

      <span className="flex-1 text-sm text-gray-800 truncate">{task.title}</span>

      {task.assignee && (
        <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size="sm" />
      )}

      <select
        value={task.sprintId || ""}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onAssign(task.id, e.target.value || null)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-violet-500 transition-colors"
      >
        <option value="">Backlog</option>
        {sprints.filter((s) => s.status !== "completed").map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}

export function ScrumView({ space, members, currentUser, onSpaceUpdate }: Props) {
  const [sprints, setSprints] = useState<SprintData[]>(space.sprints || []);
  const [activeSprint, setActiveSprint] = useState<SprintData | null>(sprints.find((s) => s.status === "active") || null);
  const [boardView, setBoardView] = useState<"board" | "backlog">("board");
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  const allTasks = space.lists.flatMap((l) => l.tasks);
  const backlogTasks = allTasks.filter((t) => !t.sprintId);
  const sprintTasks = activeSprint ? allTasks.filter((t) => t.sprintId === activeSprint.id) : [];

  const doneCount = sprintTasks.filter((t) => t.status.type === "done").length;
  const totalPoints = sprintTasks.reduce((s, t) => s + (t.storyPoints ?? PRIORITY_POINTS[t.priority] ?? 5), 0);
  const donePoints = sprintTasks.filter((t) => t.status.type === "done").reduce((s, t) => s + (t.storyPoints ?? PRIORITY_POINTS[t.priority] ?? 5), 0);

  async function createSprint() {
    if (!sprintName.trim()) return;
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId: space.id, name: sprintName, goal: sprintGoal }),
    });
    if (res.ok) {
      const sprint = await res.json();
      setSprints((prev) => [...prev, sprint]);
      setSprintName("");
      setSprintGoal("");
      setCreateSprintOpen(false);
    }
  }

  async function activateSprint(sprint: SprintData) {
    const res = await fetch(`/api/sprints/${sprint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active", startDate: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSprints((prev) => prev.map((s) => s.id === updated.id ? updated : s.status === "active" ? { ...s, status: "planning" } : s));
      setActiveSprint(updated);
    }
  }

  async function completeSprint() {
    if (!activeSprint) return;
    const res = await fetch(`/api/sprints/${activeSprint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", endDate: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSprints((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      setActiveSprint(null);
    }
  }

  async function assignToSprint(taskId: string, sprintId: string | null) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintId }),
    });
    if (res.ok) {
      const updated = await res.json();
      onSpaceUpdate({
        ...space,
        lists: space.lists.map((l) => ({ ...l, tasks: l.tasks.map((t) => t.id === taskId ? { ...t, sprintId: updated.sprintId } : t) })),
      });
    }
  }

  function updateTask(updated: TaskData) {
    onSpaceUpdate({
      ...space,
      lists: space.lists.map((l) => ({ ...l, tasks: l.tasks.map((t) => t.id === updated.id ? updated : t) })),
    });
    if (selectedTask?.id === updated.id) setSelectedTask(updated);
  }

  function addTask(task: TaskData) {
    onSpaceUpdate({
      ...space,
      lists: space.lists.map((l) => l.id === task.listId ? { ...l, tasks: [...l.tasks, task] } : l),
    });
  }

  function removeTask(taskId: string) {
    onSpaceUpdate({
      ...space,
      lists: space.lists.map((l) => ({ ...l, tasks: l.tasks.filter((t) => t.id !== taskId) })),
    });
    if (selectedTask?.id === taskId) setSelectedTask(null);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-3">
        {activeSprint ? (
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-gray-900">{activeSprint.name}</span>
            <SprintBadge status={activeSprint.status} />
            {activeSprint.goal && <span className="text-sm text-gray-500">— {activeSprint.goal}</span>}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Nenhum sprint ativo</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {activeSprint && totalPoints > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round((donePoints / totalPoints) * 100)}%` }} />
              </div>
              <span className="text-xs">{donePoints}/{totalPoints} pts</span>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setBoardView("board")}
              className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors", boardView === "board" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700")}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setBoardView("backlog")}
              className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors", boardView === "backlog" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700")}
            >
              <List className="h-3.5 w-3.5" /> Backlog
            </button>
          </div>

          {activeSprint && (
            <Button size="sm" variant="secondary" onClick={completeSprint} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Encerrar sprint
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateTaskOpen(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Nova tarefa
          </Button>
        </div>
      </div>

      {boardView === "board" ? (
        <div className="flex-1 overflow-hidden">
          {activeSprint ? (
            <KanbanBoard
              space={{ ...space, lists: space.lists.map((l) => ({ ...l, tasks: l.tasks.filter((t) => t.sprintId === activeSprint.id) })) }}
              tasks={sprintTasks}
              onTaskClick={setSelectedTask}
              onTaskUpdate={updateTask}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Zap className="h-12 w-12 text-gray-200" />
              <h3 className="text-lg font-semibold text-gray-400">Nenhum sprint ativo</h3>
              <p className="text-sm text-gray-400">Crie e inicie um sprint para começar a trabalhar.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 flex gap-6">
          {/* Backlog */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">Backlog <span className="text-gray-400 font-normal text-sm">({backlogTasks.length})</span></h2>
              <Button size="sm" variant="ghost" onClick={() => setCreateTaskOpen(true)} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {backlogTasks.map((task) => (
                <BacklogRow key={task.id} task={task} sprints={sprints} onAssign={assignToSprint} onClick={setSelectedTask} />
              ))}
              {backlogTasks.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">Backlog vazio 🎉</p>
              )}
            </div>
          </div>

          {/* Sprints */}
          <div className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">Sprints</h2>
              <button onClick={() => setCreateSprintOpen(true)} className="text-gray-400 hover:text-violet-600 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {createSprintOpen && (
              <div className="mb-3 rounded-xl border border-violet-200 bg-violet-50 p-3 flex flex-col gap-2">
                <input
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createSprint()}
                  placeholder="Nome do sprint..."
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                  autoFocus
                />
                <input
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  placeholder="Meta (opcional)..."
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={createSprint}>Criar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCreateSprintOpen(false)}>Cancelar</Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {sprints.map((sprint) => {
                const tasks = allTasks.filter((t) => t.sprintId === sprint.id);
                const done = tasks.filter((t) => t.status.type === "done").length;
                return (
                  <div key={sprint.id} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{sprint.name}</span>
                      <SprintBadge status={sprint.status} />
                    </div>
                    {sprint.goal && <p className="text-xs text-gray-500 mb-2 truncate">{sprint.goal}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>{tasks.length} tarefa{tasks.length !== 1 ? "s" : ""}</span>
                      <span>{done}/{tasks.length} concluídas</span>
                    </div>
                    {tasks.length > 0 && (
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((done / tasks.length) * 100)}%` }} />
                      </div>
                    )}
                    {sprint.status === "planning" && (
                      <Button size="sm" className="w-full gap-1.5 mt-1" onClick={() => activateSprint(sprint)}>
                        <Play className="h-3 w-3" /> Iniciar sprint
                      </Button>
                    )}
                  </div>
                );
              })}
              {sprints.length === 0 && !createSprintOpen && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum sprint criado</p>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
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
