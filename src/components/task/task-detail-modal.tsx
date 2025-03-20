"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Calendar, Send, Flag, User } from "lucide-react";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import type { SpaceWithData, TaskData, CommentData, UserSummary } from "@/types";

interface Props {
  task: TaskData;
  space: SpaceWithData;
  members: UserSummary[];
  currentUser: UserSummary;
  onClose: () => void;
  onUpdate: (task: TaskData) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITIES = [
  { value: "urgent", label: "Urgente", color: "text-red-600" },
  { value: "high", label: "Alta", color: "text-orange-500" },
  { value: "normal", label: "Normal", color: "text-blue-500" },
  { value: "low", label: "Baixa", color: "text-gray-400" },
];

export function TaskDetailModal({ task, space, members, currentUser, onClose, onUpdate, onDelete }: Props) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${task.id}`)
      .then((r) => r.json())
      .then((data) => { if (data.comments) setComments(data.comments); });
  }, [task.id]);

  async function updateField(data: Partial<TaskData>) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete(task.id);
    onClose();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment.trim() }),
    });
    setSubmitting(false);
    if (res.ok) {
      const c = await res.json();
      setComments((prev) => [...prev, c]);
      setComment("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.status.color }} />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{task.status.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting} className="text-red-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-5">
            {editingTitle ? (
              <input
                autoFocus
                className="w-full rounded-lg border border-violet-300 dark:border-violet-700 px-2 py-1 text-xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-violet-500/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { setEditingTitle(false); if (title.trim() !== task.title) updateField({ title }); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setEditingTitle(false); updateField({ title }); } if (e.key === "Escape") { setTitle(task.title); setEditingTitle(false); } }}
              />
            ) : (
              <h2 onClick={() => setEditingTitle(true)} className="cursor-text rounded text-xl font-bold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 -mx-2">{title}</h2>
            )}
            <textarea
              className="mt-3 w-full resize-none rounded-lg border-0 bg-transparent px-2 text-sm text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
              rows={3}
              placeholder="Adicionar descrição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => { if (description !== (task.description ?? "")) updateField({ description }); }}
            />
          </div>

          <div className="grid grid-cols-2 gap-0 border-b border-gray-100 dark:border-gray-800">
            <div className="border-r border-gray-100 dark:border-gray-800 px-6 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</p>
              <Select value={task.statusId} onValueChange={(v) => updateField({ statusId: v } as Partial<TaskData>)}>
                {space.statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="px-6 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Prioridade</p>
              <Select value={task.priority} onValueChange={(v) => updateField({ priority: v } as Partial<TaskData>)}>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className={cn("font-medium", p.color)}>{p.label}</span>
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="border-r border-t border-gray-100 dark:border-gray-800 px-6 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Responsável</p>
              <Select value={task.assigneeId ?? ""} onValueChange={(v) => updateField({ assigneeId: v || null } as Partial<TaskData>)} placeholder="Ninguém">
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: m.avatarColor }}>
                        {m.name[0]}
                      </span>
                      {m.name}
                    </span>
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Prazo</p>
              <input
                type="date"
                className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => updateField({ dueDate: e.target.value || null } as Partial<TaskData>)}
              />
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Comentários ({comments.length})</p>
            {comments.length === 0 && (
              <p className="mb-4 text-sm text-gray-400 dark:text-gray-500">Nenhum comentário ainda.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="mb-4 flex gap-3">
                <Avatar name={c.user.name} color={c.user.avatarColor} size="sm" className="shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.user.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                </div>
              </div>
            ))}

            <form onSubmit={submitComment} className="flex gap-2 pt-2">
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" className="shrink-0 mt-1" />
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
                <input
                  className="flex-1 py-2 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 bg-transparent text-gray-900 dark:text-gray-100"
                  placeholder="Escreva um comentário..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" disabled={submitting || !comment.trim()} className="text-violet-600 hover:text-violet-700 disabled:opacity-30">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
