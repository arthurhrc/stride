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

  const sprints = await prisma.sprint.findMany({
    where: { spaceId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sprints);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { spaceId, name, goal, startDate, endDate } = body;
  if (!spaceId || !name) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { workspace: { include: { members: { where: { userId: session.user.id } } } } },
  });
  if (!space || !space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const count = await prisma.sprint.count({ where: { spaceId } });

  const sprint = await prisma.sprint.create({
    data: {
      name,
      goal: goal || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      order: count,
      spaceId,
    },
  });

  return NextResponse.json(sprint, { status: 201 });
}
