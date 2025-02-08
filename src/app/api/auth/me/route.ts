import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id, name, email, avatarColor } = session.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspaces = session.user.workspaces.map((m: any) => ({
    ...m.workspace,
    role: m.role,
  }));
  return NextResponse.json({ id, name, email, avatarColor, workspaces });
}
