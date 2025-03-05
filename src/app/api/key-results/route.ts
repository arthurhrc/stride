import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { objectiveId, title, target, unit } = body;
  if (!objectiveId || !title) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!objective || !objective.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const count = await prisma.keyResult.count({ where: { objectiveId } });

  const kr = await prisma.keyResult.create({
    data: {
      title,
      target: target ?? 100,
      unit: unit ?? "%",
      order: count,
      objectiveId,
    },
  });

  return NextResponse.json(kr, { status: 201 });
}
