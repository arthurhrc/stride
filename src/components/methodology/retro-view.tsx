"use client";

import { useState } from "react";
import { Plus, ThumbsUp, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { RetroCardData, SpaceWithData, UserSummary } from "@/types";

interface Props {
  space: SpaceWithData;
  currentUser: UserSummary;
}

const COLUMNS = [
  { key: "start", label: "Começar", emoji: "🚀", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800", headerColor: "bg-emerald-500", addColor: "hover:text-emerald-600" },
  { key: "stop", label: "Parar", emoji: "🛑", color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", headerColor: "bg-red-500", addColor: "hover:text-red-600" },
  { key: "continue", label: "Continuar", emoji: "✅", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", headerColor: "bg-blue-500", addColor: "hover:text-blue-600" },
];

interface RetroCardProps {
  card: RetroCardData;
  currentUserId: string;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (card: RetroCardData) => void;
}

function RetroCardItem({ card, currentUserId, onVote, onDelete, onExport }: RetroCardProps) {
  return (
    <div className="group relative rounded-xl border border-white/80 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed pr-4 whitespace-pre-wrap">{card.content}</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar name={card.author.name} color={card.author.avatarColor} size="sm" />
          <span className="text-xs text-gray-400 dark:text-gray-500">{card.author.name.split(" ")[0]}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onVote(card.id)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
              card.votes > 0 ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300" : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <ThumbsUp className="h-3 w-3" />
            {card.votes > 0 && <span>{card.votes}</span>}
          </button>

          <button
            onClick={() => onExport(card)}
            title="Exportar como tarefa"
            className="opacity-0 group-hover:opacity-100 rounded-full p-0.5 text-gray-300 hover:text-violet-500 transition-all"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {card.authorId === currentUserId && (
            <button
              onClick={() => onDelete(card.id)}
              className="opacity-0 group-hover:opacity-100 rounded-full p-0.5 text-gray-300 hover:text-red-400 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  col: typeof COLUMNS[number];
  cards: RetroCardData[];
  currentUserId: string;
  spaceId: string;
  onAdd: (card: RetroCardData) => void;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (card: RetroCardData) => void;
}

function RetroColumn({ col, cards, currentUserId, spaceId, onAdd, onVote, onDelete, onExport }: ColumnProps) {
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState("");

  async function addCard() {
    if (!content.trim()) return;
    const res = await fetch("/api/retro-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId, content, column: col.key }),
    });
    if (res.ok) {
      const card = await res.json();
      onAdd(card);
      setContent("");
      setAdding(false);
    }
  }

  const sorted = [...cards].sort((a, b) => b.votes - a.votes);

  return (
    <div className={cn("flex flex-col rounded-2xl border p-3 gap-3 flex-1", col.color)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", col.headerColor)} />
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
            {col.emoji} {col.label}
          </h3>
          <span className="rounded-full bg-white/70 dark:bg-gray-700/70 px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400">{cards.length}</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className={cn("text-gray-400 transition-colors", col.addColor)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {sorted.map((card) => (
          <RetroCardItem
            key={card.id}
            card={card}
            currentUserId={currentUserId}
            onVote={onVote}
            onDelete={onDelete}
            onExport={onExport}
          />
        ))}

        {adding && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), addCard())}
              placeholder="Descreva sua observação... (Enter para salvar)"
              className="w-full resize-none text-sm text-gray-800 dark:text-gray-100 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              rows={3}
              autoFocus
              onBlur={() => { if (!content.trim()) setAdding(false); }}
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={addCard}>Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RetroView({ space, currentUser }: Props) {
  const [cards, setCards] = useState<RetroCardData[]>(space.retroCards || []);
  const [exportedCount, setExportedCount] = useState(0);

  function addCard(card: RetroCardData) {
    setCards((prev) => [...prev, card]);
  }

  async function vote(id: string) {
    const res = await fetch(`/api/retro-cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: true }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }

  async function deleteCard(id: string) {
    await fetch(`/api/retro-cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function exportAsTask(card: RetroCardData) {
    if (!space.lists.length) return;
    const defaultList = space.lists[0];
    const defaultStatus = space.statuses[0];
    if (!defaultStatus) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `[Retro] ${card.content.slice(0, 80)}`,
        listId: defaultList.id,
        statusId: defaultStatus.id,
        priority: "normal",
      }),
    });

    if (res.ok) {
      setExportedCount((n) => n + 1);
    }
  }

  const totalVotes = cards.reduce((s, c) => s + c.votes, 0);
  const topCard = cards.length ? [...cards].sort((a, b) => b.votes - a.votes)[0] : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-2.5">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{cards.length} card{cards.length !== 1 ? "s" : ""}</span>
          <span>{totalVotes} voto{totalVotes !== 1 ? "s" : ""}</span>
          {topCard && topCard.votes > 0 && (
            <span className="text-violet-600 font-medium">
              🏆 Mais votado: "{topCard.content.slice(0, 40)}{topCard.content.length > 40 ? "…" : ""}"
            </span>
          )}
        </div>
        {exportedCount > 0 && (
          <span className="ml-auto text-xs text-emerald-600 font-medium">
            ✓ {exportedCount} tarefa{exportedCount !== 1 ? "s" : ""} exportada{exportedCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden p-4 flex gap-4">
        {COLUMNS.map((col) => (
          <RetroColumn
            key={col.key}
            col={col}
            cards={cards.filter((c) => c.column === col.key)}
            currentUserId={currentUser.id}
            spaceId={space.id}
            onAdd={addCard}
            onVote={vote}
            onDelete={deleteCard}
            onExport={exportAsTask}
          />
        ))}
      </div>
    </div>
  );
}
