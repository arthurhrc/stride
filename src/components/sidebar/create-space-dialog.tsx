"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MethodologyType } from "@/types";

interface Props {
  workspaceSlug: string;
  onClose: () => void;
  initialMethodology?: MethodologyType;
}

const METHODOLOGIES: { type: MethodologyType; emoji: string; label: string; desc: string }[] = [
  { type: "kanban", emoji: "🗂️", label: "Kanban", desc: "Quadro visual de tarefas por status" },
  { type: "scrum", emoji: "🏃", label: "Scrum", desc: "Sprints, backlog e board ágil" },
  { type: "okr", emoji: "🎯", label: "OKR", desc: "Objetivos e resultados-chave" },
  { type: "canvas", emoji: "🧩", label: "Business Canvas", desc: "Modelo de negócio em 9 blocos" },
  { type: "retro", emoji: "🔄", label: "Retrospectiva", desc: "Start, Stop e Continue com votação" },
];

const ICONS = ["📁", "🚀", "💡", "🛠️", "📊", "🎨", "⚙️", "📢", "🧪", "🏆", "🔥", "💎"];
const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

export function CreateSpaceDialog({ workspaceSlug, onClose, initialMethodology }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("#6366f1");
  const [methodology, setMethodology] = useState<MethodologyType>(initialMethodology ?? "kanban");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim()) { setError("Nome obrigatório"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, color, methodologyType: methodology, workspaceSlug }),
    });

    if (res.ok) {
      const space = await res.json();
      router.push(`/app/${workspaceSlug}/${space.id}`);
      router.refresh();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao criar espaço");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Novo espaço</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nome do espaço..."
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-gray-400"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Ícone</label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn("h-8 w-8 rounded-lg text-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800", icon === i && "ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/30")}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Cor</label>
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn("h-6 w-6 rounded-full transition-all", color === c && "ring-2 ring-offset-1 ring-gray-400")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Metodologia</label>
          <div className="flex flex-col gap-1.5">
            {METHODOLOGIES.map((m) => (
              <button
                key={m.type}
                onClick={() => setMethodology(m.type)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all",
                  methodology === m.type
                    ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <span className="text-lg">{m.emoji}</span>
                <div>
                  <p className={cn("text-sm font-medium", methodology === m.type ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-200")}>{m.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button onClick={submit} disabled={loading} className="flex-1">
            {loading ? "Criando..." : "Criar espaço"}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
