import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { workspaces: { include: { workspace: { include: { spaces: true } } } } },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

  const firstWorkspace = user.workspaces[0]?.workspace;
  const firstSpace = firstWorkspace?.spaces[0];

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    workspaceSlug: firstWorkspace?.slug,
    spaceId: firstSpace?.id,
  });
  res.cookies.set("stride_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
