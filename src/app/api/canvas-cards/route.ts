import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { spaceId, content, block, color } = body;
  if (!spaceId || !content || !block) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { workspace: { include: { members: { where: { userId: session.user.id } } } } },
  });
  if (!space || !space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const count = await prisma.canvasCard.count({ where: { spaceId, block } });

  const card = await prisma.canvasCard.create({
    data: {
      content,
      block,
      color: color || "#fef9c3",
      order: count,
      spaceId,
    },
  });

  return NextResponse.json(card, { status: 201 });
}
