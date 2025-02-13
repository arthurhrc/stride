import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar/sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
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
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        user={user}
        workspaces={allWorkspaces}
        currentWorkspace={workspace}
        spaces={workspace.spaces}
      />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
