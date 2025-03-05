"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Target, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ObjectiveData, KeyResultData, SpaceWithData, UserSummary } from "@/types";

interface Props {
  space: SpaceWithData;
  members: UserSummary[];
  currentUser: UserSummary;
}

const STATUS_CONFIG = {
  on_track: { label: "No prazo", color: "bg-emerald-100 text-emerald-700" },
  at_risk: { label: "Em risco", color: "bg-amber-100 text-amber-700" },
  off_track: { label: "Atrasado", color: "bg-red-100 text-red-700" },
  done: { label: "Concluído", color: "bg-violet-100 text-violet-700" },
};

function calcProgress(keyResults: KeyResultData[]): number {
  if (!keyResults.length) return 0;
  const total = keyResults.reduce((sum, kr) => sum + Math.min((kr.current / kr.target) * 100, 100), 0);
  return Math.round(total / keyResults.length);
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${value}%`, backgroundColor: color || "#6366f1" }}
      />
    </div>
  );
}

function KeyResultRow({
  kr,
  onUpdate,
  onDelete,
}: {
  kr: KeyResultData;
  onUpdate: (updated: KeyResultData) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(String(kr.current));
  const progress = Math.min(Math.round((kr.current / kr.target) * 100), 100);

  async function saveCurrent() {
    const val = parseFloat(current);
    if (isNaN(val)) { setEditing(false); return; }
    const res = await fetch(`/api/key-results/${kr.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: val }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
    }
    setEditing(false);
  }

  async function deleteKr() {
    await fetch(`/api/key-results/${kr.id}`, { method: "DELETE" });
    onDelete(kr.id);
  }

  return (
    <div className="group flex items-center gap-3 py-2 pl-8 pr-3 rounded-lg hover:bg-gray-50">
      <div className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{kr.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <ProgressBar value={progress} color={progress >= 80 ? "#22c55e" : progress >= 50 ? "#f59e0b" : "#ef4444"} />
          <span className="text-xs text-gray-500 shrink-0 w-16 text-right">
            {editing ? (
              <input
                className="w-14 rounded border border-gray-300 px-1 py-0.5 text-xs text-right"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={saveCurrent}
                onKeyDown={(e) => e.key === "Enter" && saveCurrent()}
                autoFocus
              />
            ) : (
              <button onClick={() => setEditing(true)} className="hover:text-violet-600">
                {kr.current}/{kr.target}{kr.unit}
              </button>
            )}
          </span>
        </div>
      </div>
      <button onClick={deleteKr} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ObjectiveCard({
  objective,
  members,
  onUpdate,
  onDelete,
}: {
  objective: ObjectiveData;
  members: UserSummary[];
  onUpdate: (obj: ObjectiveData) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [addingKr, setAddingKr] = useState(false);
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState("100");
  const [krUnit, setKrUnit] = useState("%");
  const progress = calcProgress(objective.keyResults);
  const statusCfg = STATUS_CONFIG[objective.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.on_track;

  async function addKeyResult() {
    if (!krTitle.trim()) return;
    const res = await fetch("/api/key-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectiveId: objective.id, title: krTitle, target: parseFloat(krTarget) || 100, unit: krUnit }),
    });
    if (res.ok) {
      const newKr = await res.json();
      onUpdate({ ...objective, keyResults: [...objective.keyResults, newKr] });
      setKrTitle("");
      setKrTarget("100");
      setKrUnit("%");
      setAddingKr(false);
    }
  }

  function updateKr(updated: KeyResultData) {
    onUpdate({ ...objective, keyResults: objective.keyResults.map((k) => (k.id === updated.id ? updated : k)) });
  }

  function deleteKr(id: string) {
    onUpdate({ ...objective, keyResults: objective.keyResults.filter((k) => k.id !== id) });
  }

  async function cycleStatus() {
    const statuses = ["on_track", "at_risk", "off_track", "done"];
    const next = statuses[(statuses.indexOf(objective.status) + 1) % statuses.length];
    const res = await fetch(`/api/objectives/${objective.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) onUpdate({ ...objective, status: next });
  }

  async function deleteObjective() {
    await fetch(`/api/objectives/${objective.id}`, { method: "DELETE" });
    onDelete(objective.id);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setExpanded((e) => !e)} className="text-gray-400 hover:text-gray-600 shrink-0">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <Target className="h-4 w-4 text-violet-500 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{objective.title}</h3>
            <button
              onClick={cycleStatus}
              className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer", statusCfg.color)}
            >
              {statusCfg.label}
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar value={progress} />
            <span className="text-xs font-medium text-gray-500 shrink-0">{progress}%</span>
          </div>
        </div>

        {objective.owner && (
          <Avatar name={objective.owner.name} color={objective.owner.avatarColor} size="sm" />
        )}

        <button onClick={deleteObjective} className="text-gray-200 hover:text-red-400 transition-colors ml-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 pb-2">
          {objective.keyResults.map((kr) => (
            <KeyResultRow key={kr.id} kr={kr} onUpdate={updateKr} onDelete={deleteKr} />
          ))}

          {addingKr ? (
            <div className="flex items-center gap-2 pl-8 pr-3 py-2">
              <input
                value={krTitle}
                onChange={(e) => setKrTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyResult()}
                placeholder="Resultado-chave..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                autoFocus
              />
              <input
                value={krTarget}
                onChange={(e) => setKrTarget(e.target.value)}
                placeholder="Meta"
                className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-right outline-none focus:border-violet-500"
              />
              <input
                value={krUnit}
                onChange={(e) => setKrUnit(e.target.value)}
                placeholder="%"
                className="w-12 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500"
              />
              <Button size="sm" onClick={addKeyResult}>Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingKr(false)}>Cancelar</Button>
            </div>
          ) : (
            <button
              onClick={() => setAddingKr(true)}
              className="flex items-center gap-2 pl-10 pr-3 py-1.5 text-sm text-gray-400 hover:text-violet-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar resultado-chave
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OkrView({ space, members, currentUser }: Props) {
  const [objectives, setObjectives] = useState<ObjectiveData[]>(space.objectives || []);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState(currentUser.id);

  async function createObjective() {
    if (!title.trim()) return;
    const res = await fetch("/api/objectives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId: space.id, title, ownerId }),
    });
    if (res.ok) {
      const obj = await res.json();
      setObjectives((prev) => [...prev, obj]);
      setTitle("");
      setAdding(false);
    }
  }

  function updateObjective(obj: ObjectiveData) {
    setObjectives((prev) => prev.map((o) => (o.id === obj.id ? obj : o)));
  }

  function deleteObjective(id: string) {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">
            {objectives.length} objetivo{objectives.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Novo objetivo
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {adding && (
          <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-4 flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createObjective()}
              placeholder="Título do objetivo..."
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 shrink-0">Responsável:</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-violet-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <Button size="sm" onClick={createObjective}>Criar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {objectives.length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Target className="h-12 w-12 text-gray-200 mb-3" />
            <h3 className="text-lg font-semibold text-gray-400">Nenhum objetivo criado</h3>
            <p className="text-sm text-gray-400 mt-1">Comece criando um objetivo e adicione resultados-chave para medir o progresso.</p>
            <Button className="mt-4" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4 mr-1" /> Criar primeiro objetivo
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {objectives.map((obj) => (
            <ObjectiveCard key={obj.id} objective={obj} members={members} onUpdate={updateObjective} onDelete={deleteObjective} />
          ))}
        </div>
      </div>
    </div>
  );
}
