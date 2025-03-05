import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const spaceId = req.nextUrl.searchParams.get("spaceId");
  if (!spaceId) return NextResponse.json({ error: "spaceId obrigatório" }, { status: 400 });

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { workspace: { include: { members: { where: { userId: session.user.id } } } } },
  });
  if (!space || !space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const objectives = await prisma.objective.findMany({
    where: { spaceId },
    orderBy: { order: "asc" },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      keyResults: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(objectives);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { spaceId, title, description, ownerId, dueDate } = body;
  if (!spaceId || !title) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { workspace: { include: { members: { where: { userId: session.user.id } } } } },
  });
  if (!space || !space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const count = await prisma.objective.count({ where: { spaceId } });

  const objective = await prisma.objective.create({
    data: {
      title,
      description: description || null,
      ownerId: ownerId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      order: count,
      spaceId,
    },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      keyResults: true,
    },
  });

  return NextResponse.json(objective, { status: 201 });
}
