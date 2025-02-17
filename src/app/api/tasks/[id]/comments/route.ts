import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      list: { include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } } },
    },
  });
  if (!task || !task.list.space.workspace.members.length) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const comment = await prisma.taskComment.create({
    data: { content: parsed.data.content, taskId: id, userId: session.user.id },
    include: { user: { select: { id: true, name: true, avatarColor: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
