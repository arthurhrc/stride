import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const card = await prisma.retroCard.findUnique({
    where: { id },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!card || !card.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.retroCard.update({
    where: { id },
    data: {
      content: body.content ?? card.content,
      votes: body.vote ? card.votes + 1 : card.votes,
    },
    include: { author: { select: { id: true, name: true, avatarColor: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const card = await prisma.retroCard.findUnique({
    where: { id },
    include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } },
  });
  if (!card || !card.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.retroCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
