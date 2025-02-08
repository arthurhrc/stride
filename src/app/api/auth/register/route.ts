import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  workspaceName: z.string().min(2).max(80),
});

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { name, email, password, workspaceName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  const baseSlug = slugify(workspaceName);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const DEFAULT_STATUSES = [
    { name: "A fazer", color: "#94a3b8", order: 0, type: "not_started" },
    { name: "Em andamento", color: "#3b82f6", order: 1, type: "active" },
    { name: "Em revisão", color: "#f59e0b", order: 2, type: "active" },
    { name: "Concluído", color: "#22c55e", order: 3, type: "done" },
  ];

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, password: hashed, avatarColor: randomColor() },
    });
    const workspace = await tx.workspace.create({
      data: { name: workspaceName, slug, color: randomColor() },
    });
    await tx.workspaceMember.create({
      data: { userId: newUser.id, workspaceId: workspace.id, role: "owner" },
    });
    const space = await tx.space.create({
      data: { name: "Geral", icon: "🚀", color: "#6366f1", workspaceId: workspace.id },
    });
    const statuses = await Promise.all(
      DEFAULT_STATUSES.map((s) => tx.taskStatus.create({ data: { ...s, spaceId: space.id } }))
    );
    await tx.taskList.create({ data: { name: "Backlog", order: 0, spaceId: space.id } });
    return { newUser, workspace, space, statuses };
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: user.newUser.id, token, expiresAt } });

  const res = NextResponse.json({
    user: { id: user.newUser.id, name: user.newUser.name, email: user.newUser.email },
    workspaceSlug: slug,
    spaceId: user.space.id,
  });
  res.cookies.set("stride_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
