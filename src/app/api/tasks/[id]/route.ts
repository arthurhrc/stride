import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
  dueDate: z.string().nullable().optional(),
  statusId: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  listId: z.string().optional(),
});

async function verifyAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      list: { include: { space: { include: { workspace: { include: { members: { where: { userId } } } } } } } },
    },
  });
  if (!task || !task.list.space.workspace.members.length) return null;
  return task;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const task = await verifyAccess(id, session.user.id);
  if (!task) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const full = await prisma.task.findUnique({
    where: { id },
    include: {
      status: true,
      assignee: { select: { id: true, name: true, avatarColor: true } },
      creator: { select: { id: true, name: true, avatarColor: true } },
      list: true,
      comments: {
        include: { user: { select: { id: true, name: true, avatarColor: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(full);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const task = await verifyAccess(id, session.user.id);
  if (!task) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { statusId, dueDate, ...rest } = parsed.data;

  if (statusId) {
    const status = await prisma.taskStatus.findFirst({
      where: { id: statusId, spaceId: task.list.spaceId },
    });
    if (!status) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      ...(statusId && { statusId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      status: true,
      assignee: { select: { id: true, name: true, avatarColor: true } },
      creator: { select: { id: true, name: true, avatarColor: true } },
      list: true,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const task = await verifyAccess(id, session.user.id);
  if (!task) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
