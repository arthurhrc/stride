import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(80),
  spaceId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { name, spaceId } = parsed.data;

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { workspace: { include: { members: { where: { userId: session.user.id } } } } },
  });
  if (!space || !space.workspace.members.length) {
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });
  }

  const count = await prisma.taskList.count({ where: { spaceId } });
  const list = await prisma.taskList.create({ data: { name, spaceId, order: count } });
  return NextResponse.json(list, { status: 201 });
}
