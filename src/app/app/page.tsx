import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");

  const membership = session.user.workspaces[0];
  if (!membership) redirect("/register");

  const workspace = await prisma.workspace.findUnique({
    where: { id: membership.workspaceId },
    include: { spaces: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  if (!workspace) redirect("/register");
  const firstSpace = workspace.spaces[0];
  if (firstSpace) redirect(`/app/${workspace.slug}/${firstSpace.id}`);
  redirect(`/app/${workspace.slug}`);
}
