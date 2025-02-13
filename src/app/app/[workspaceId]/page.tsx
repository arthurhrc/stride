import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LayoutGrid } from "lucide-react";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceHomePage({ params }: Props) {
  const { workspaceId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceId },
    include: {
      spaces: {
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { lists: true } } },
      },
      members: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
    },
  });
  if (!workspace) notFound();

  const totalSpaces = workspace.spaces.length;
  const totalMembers = workspace.members.length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-lg font-bold"
            style={{ backgroundColor: workspace.color }}>
            {workspace.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
            <p className="text-sm text-gray-500">{totalMembers} membro{totalMembers !== 1 ? "s" : ""} · {totalSpaces} espaço{totalSpaces !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspace.spaces.map((space) => (
          <a key={space.id} href={`/app/${workspaceId}/${space.id}`}
            className="group block rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{space.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{space.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <LayoutGrid className="h-3.5 w-3.5" />
              {space._count.lists} lista{space._count.lists !== 1 ? "s" : ""}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
