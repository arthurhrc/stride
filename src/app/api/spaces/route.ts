import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_STATUSES = [
  { name: "A fazer", color: "#94a3b8", order: 0, type: "not_started" },
  { name: "Em andamento", color: "#3b82f6", order: 1, type: "active" },
  { name: "Em revisão", color: "#f59e0b", order: 2, type: "active" },
  { name: "Concluído", color: "#22c55e", order: 3, type: "done" },
];

const schema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().optional(),
  color: z.string().optional(),
  workspaceId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { name, icon = "📁", color = "#6366f1", workspaceId } = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member) return NextResponse.json({ error: "Sem acesso" }, { status: 403 });

  const space = await prisma.$transaction(async (tx) => {
    const s = await tx.space.create({ data: { name, icon, color, workspaceId } });
    await Promise.all(DEFAULT_STATUSES.map((st) => tx.taskStatus.create({ data: { ...st, spaceId: s.id } })));
    await tx.taskList.create({ data: { name: "Backlog", order: 0, spaceId: s.id } });
    return s;
  });

  return NextResponse.json(space, { status: 201 });
}
