import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const space = await prisma.space.findUnique({
    where: { id },
    include: {
      statuses: { orderBy: { order: "asc" } },
      lists: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              status: true,
              assignee: { select: { id: true, name: true, avatarColor: true } },
              creator: { select: { id: true, name: true, avatarColor: true } },
              list: true,
              _count: { select: { comments: true } },
            },
          },
        },
      },
      workspace: { include: { members: { where: { userId: session.user.id } } } },
    },
  });

  if (!space || !space.workspace.members.length) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const { workspace, ...rest } = space;
  return NextResponse.json(rest);
}
