import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
  dueDate: z.string().optional().nullable(),
  listId: z.string(),
  statusId: z.string(),
  assigneeId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { title, description, priority = "normal", dueDate, listId, statusId, assigneeId } = parsed.data;

  const list = await prisma.taskList.findUnique({
    where: { id: listId },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!list || !list.space.workspace.members.length) {
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });
  }

  const status = await prisma.taskStatus.findFirst({
    where: { id: statusId, spaceId: list.spaceId },
  });
  if (!status) return NextResponse.json({ error: "Status inválido" }, { status: 400 });

  const count = await prisma.task.count({ where: { listId } });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      listId,
      statusId,
      assigneeId: assigneeId || null,
      creatorId: session.user.id,
      order: count,
    },
    include: {
      status: true,
      assignee: { select: { id: true, name: true, avatarColor: true } },
      creator: { select: { id: true, name: true, avatarColor: true } },
      list: true,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
