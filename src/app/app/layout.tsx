import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const firstMembership = session.user.workspaces[0];
  if (!firstMembership) redirect("/register");

  return <>{children}</>;
}
