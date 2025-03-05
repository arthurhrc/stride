import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!sprint || !sprint.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // When activating a sprint, deactivate others in the same space
  if (body.status === "active") {
    await prisma.sprint.updateMany({
      where: { spaceId: sprint.spaceId, status: "active" },
      data: { status: "planning" },
    });
  }

  const updated = await prisma.sprint.update({
    where: { id },
    data: {
      name: body.name ?? sprint.name,
      goal: body.goal !== undefined ? body.goal : sprint.goal,
      startDate: body.startDate !== undefined ? (body.startDate ? new Date(body.startDate) : null) : sprint.startDate,
      endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : sprint.endDate,
      status: body.status ?? sprint.status,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!sprint || !sprint.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Unlink tasks from this sprint before deleting
  await prisma.task.updateMany({ where: { sprintId: id }, data: { sprintId: null } });
  await prisma.sprint.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
