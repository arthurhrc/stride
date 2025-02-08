import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("stride_session")?.value;
  if (token) await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  const res = NextResponse.json({ ok: true });
  res.cookies.set("stride_session", "", { maxAge: 0, path: "/" });
  return res;
}
