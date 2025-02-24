"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import type { SpaceWithData, TaskData, UserSummary } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  space: SpaceWithData;
  currentUser: UserSummary;
  members: UserSummary[];
  onCreated: (task: TaskData) => void;
}

const PRIORITIES = [
  { value: "urgent", label: "🔴 Urgente" },
  { value: "high", label: "🟠 Alta" },
  { value: "normal", label: "🔵 Normal" },
  { value: "low", label: "⚪ Baixa" },
];

export function CreateTaskDialog({ open, onOpenChange, space, currentUser, members, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [listId, setListId] = useState(space.lists[0]?.id ?? "");
  const [statusId, setStatusId] = useState(space.statuses[0]?.id ?? "");
  const [priority, setPriority] = useState("normal");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), listId, statusId, priority, assigneeId: assigneeId || null, dueDate: dueDate || null }),
    });
    setLoading(false);
    if (res.ok) {
      const task = await res.json();
      onCreated(task);
      setTitle("");
      setAssigneeId("");
      setDueDate("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Nova tarefa">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Título *</label>
            <Input placeholder="O que precisa ser feito?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Lista</label>
              <Select value={listId} onValueChange={setListId}>
                {space.lists.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={statusId} onValueChange={setStatusId}>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Prioridade</label>
              <Select value={priority} onValueChange={setPriority}>
                {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Responsável</label>
              <Select value={assigneeId} onValueChange={setAssigneeId} placeholder="Ninguém">
                {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Prazo</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose>
              <Button type="button" variant="secondary" size="sm">Cancelar</Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={loading || !title.trim()}>
              {loading ? "Criando..." : "Criar tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
