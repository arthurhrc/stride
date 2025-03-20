"use client";

import { useState } from "react";
import { Plus, X, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasCardData, SpaceWithData } from "@/types";

interface Props {
  space: SpaceWithData;
}

const CARD_COLORS = [
  "#fef9c3", "#fce7f3", "#dbeafe", "#dcfce7", "#fef3c7",
  "#ede9fe", "#fee2e2", "#ccfbf1", "#f0fdf4", "#fff7ed",
];

const BLOCKS = [
  { key: "key_partners", label: "Parceiros-Chave", emoji: "🤝", col: "1", row: "1/3" },
  { key: "key_activities", label: "Atividades-Chave", emoji: "⚙️", col: "2", row: "1" },
  { key: "key_resources", label: "Recursos-Chave", emoji: "🏗️", col: "2", row: "2" },
  { key: "value_prop", label: "Proposta de Valor", emoji: "💎", col: "3", row: "1/3" },
  { key: "customer_relations", label: "Relacionamento com Clientes", emoji: "💬", col: "4", row: "1" },
  { key: "channels", label: "Canais", emoji: "📣", col: "4", row: "2" },
  { key: "customer_segments", label: "Segmentos de Clientes", emoji: "👥", col: "5", row: "1/3" },
  { key: "cost_structure", label: "Estrutura de Custos", emoji: "💸", col: "1/4", row: "3" },
  { key: "revenue", label: "Fontes de Receita", emoji: "💰", col: "4/6", row: "3" },
];

interface StickyNoteProps {
  card: CanvasCardData;
  onUpdate: (updated: CanvasCardData) => void;
  onDelete: (id: string) => void;
}

function StickyNote({ card, onUpdate, onDelete }: StickyNoteProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(card.content);

  async function save() {
    if (!content.trim()) return;
    const res = await fetch(`/api/canvas-cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
    }
    setEditing(false);
  }

  async function deleteCard() {
    await fetch(`/api/canvas-cards/${card.id}`, { method: "DELETE" });
    onDelete(card.id);
  }

  return (
    <div
      className="group relative rounded-lg p-2 text-xs shadow-sm min-h-[52px] flex flex-col"
      style={{ backgroundColor: card.color }}
    >
      {editing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), save())}
            className="flex-1 resize-none bg-transparent outline-none text-gray-800 text-xs leading-relaxed"
            autoFocus
            rows={3}
          />
          <button onClick={save} className="absolute bottom-1 right-1 text-gray-500 hover:text-emerald-600">
            <Check className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words flex-1">{card.content}</p>
          <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
            <button onClick={() => setEditing(true)} className="rounded p-0.5 hover:bg-black/10">
              <Pencil className="h-2.5 w-2.5 text-gray-500" />
            </button>
            <button onClick={deleteCard} className="rounded p-0.5 hover:bg-black/10">
              <X className="h-2.5 w-2.5 text-gray-500" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface CanvasBlockProps {
  block: typeof BLOCKS[number];
  cards: CanvasCardData[];
  spaceId: string;
  onAdd: (card: CanvasCardData) => void;
  onUpdate: (card: CanvasCardData) => void;
  onDelete: (id: string) => void;
}

function CanvasBlock({ block, cards, spaceId, onAdd, onUpdate, onDelete }: CanvasBlockProps) {
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  async function addCard() {
    if (!content.trim()) return;
    const res = await fetch("/api/canvas-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId, content, block: block.key, color: CARD_COLORS[colorIdx] }),
    });
    if (res.ok) {
      const card = await res.json();
      onAdd(card);
      setContent("");
      setColorIdx((colorIdx + 1) % CARD_COLORS.length);
      setAdding(false);
    }
  }

  return (
    <div
      className="flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
      style={{
        gridColumn: block.col,
        gridRow: block.row,
      }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <span>{block.emoji}</span> {block.label}
        </span>
        <button
          onClick={() => setAdding((a) => !a)}
          className="text-gray-300 hover:text-violet-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {cards.map((card) => (
          <StickyNote key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
        ))}

        {adding && (
          <div className="rounded-lg p-2" style={{ backgroundColor: CARD_COLORS[colorIdx] }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), addCard())}
              placeholder="Escreva aqui... (Enter para salvar)"
              className="w-full resize-none bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
              rows={3}
              autoFocus
              onBlur={() => { if (!content.trim()) setAdding(false); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function CanvasView({ space }: Props) {
  const [cards, setCards] = useState<CanvasCardData[]>(space.canvasCards || []);

  function addCard(card: CanvasCardData) {
    setCards((prev) => [...prev, card]);
  }

  function updateCard(updated: CanvasCardData) {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 px-6 py-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">Business Model Canvas — clique em</span>
        <Plus className="h-3 w-3 text-gray-400 dark:text-gray-500" />
        <span className="text-xs text-gray-400 dark:text-gray-500">em qualquer bloco para adicionar um cartão</span>
      </div>

      <div
        className="flex-1 overflow-hidden p-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "1fr 1fr 0.8fr",
          gap: "4px",
        }}
      >
        {BLOCKS.map((block) => (
          <CanvasBlock
            key={block.key}
            block={block}
            cards={cards.filter((c) => c.block === block.key)}
            spaceId={space.id}
            onAdd={addCard}
            onUpdate={updateCard}
            onDelete={deleteCard}
          />
        ))}
      </div>
    </div>
  );
}
