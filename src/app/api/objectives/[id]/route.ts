import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const objective = await prisma.objective.findUnique({
    where: { id },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!objective || !objective.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.objective.update({
    where: { id },
    data: {
      title: body.title ?? objective.title,
      description: body.description !== undefined ? body.description : objective.description,
      status: body.status ?? objective.status,
      ownerId: body.ownerId !== undefined ? body.ownerId : objective.ownerId,
      dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : objective.dueDate,
    },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      keyResults: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const objective = await prisma.objective.findUnique({
    where: { id },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!objective || !objective.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.objective.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
