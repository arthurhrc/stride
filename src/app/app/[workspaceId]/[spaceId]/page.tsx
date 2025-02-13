import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SpaceClient } from "./space-client";

interface Props {
  params: Promise<{ workspaceId: string; spaceId: string }>;
}

export default async function SpacePage({ params }: Props) {
  const { workspaceId, spaceId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
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
      workspace: {
        include: {
          members: {
            where: { userId: session.user.id },
          },
        },
      },
    },
  });

  if (!space || !space.workspace.members.length) notFound();

  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId: space.workspaceId },
    include: { user: { select: { id: true, name: true, avatarColor: true } } },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { workspace: _ws, ...spaceData } = space;
  const currentUser = { id: session.user.id, name: session.user.name, avatarColor: session.user.avatarColor };
  const members = workspaceMembers.map((m) => m.user);

  return (
    <SpaceClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      space={spaceData as any}
      workspaceSlug={workspaceId}
      currentUser={currentUser}
      members={members}
    />
  );
}
