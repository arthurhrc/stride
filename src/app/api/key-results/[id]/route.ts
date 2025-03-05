import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const kr = await prisma.keyResult.findUnique({
    where: { id },
    include: { objective: { include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } } } },
  });
  if (!kr || !kr.objective.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.keyResult.update({
    where: { id },
    data: {
      title: body.title ?? kr.title,
      current: body.current !== undefined ? body.current : kr.current,
      target: body.target ?? kr.target,
      unit: body.unit ?? kr.unit,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const kr = await prisma.keyResult.findUnique({
    where: { id },
    include: { objective: { include: { space: { include: { workspace: { include: { members: { where: { userId: session.user.id } } } } } } } } },
  });
  if (!kr || !kr.objective.space.workspace.members.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.keyResult.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
