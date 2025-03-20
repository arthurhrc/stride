import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceShell } from "./workspace-shell";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string; spaceId?: string }>;
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceId },
    include: { spaces: { orderBy: { createdAt: "asc" } } },
  });
  if (!workspace) notFound();

  const isMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } },
  });
  if (!isMember) notFound();

  const allWorkspaces = session.user.workspaces.map((m) => m.workspace);
  const user = { id: session.user.id, name: session.user.name, email: session.user.email, avatarColor: session.user.avatarColor };

  return (
    <WorkspaceShell
      user={user}
      workspaces={allWorkspaces}
      currentWorkspace={workspace}
      spaces={workspace.spaces}
    >
      {children}
    </WorkspaceShell>
  );
}
