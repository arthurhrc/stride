"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Plus, LogOut, LayoutGrid, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CreateSpaceDialog } from "@/components/sidebar/create-space-dialog";
import { useTheme } from "@/components/theme/theme-provider";
import type { WorkspaceSummary, SpaceSummary } from "@/types";

interface SidebarProps {
  user: { id: string; name: string; email: string; avatarColor: string };
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary;
  spaces: SpaceSummary[];
  currentSpaceId?: string;
  onMobileClose?: () => void;
}

export function Sidebar({ user, workspaces, currentWorkspace, spaces, currentSpaceId, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const { theme, toggle } = useTheme();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-100 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      {/* Mobile close button */}
      {onMobileClose && (
        <button
          onClick={onMobileClose}
          className="absolute top-3 right-3 md:hidden rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Workspace switcher */}
      <div className="relative border-b border-gray-100 dark:border-gray-800 p-3">
        <button
          onClick={() => setWorkspaceOpen((o) => !o)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Trocar workspace"
          aria-expanded={workspaceOpen}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
            style={{ backgroundColor: currentWorkspace.color }}
          >
            {currentWorkspace.name[0].toUpperCase()}
          </div>
          <span className="flex-1 truncate text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
            {currentWorkspace.name}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", workspaceOpen && "rotate-180")} />
        </button>

        {workspaceOpen && (
          <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/app/${ws.slug}`}
                onClick={() => setWorkspaceOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl"
              >
                <div
                  className="h-5 w-5 rounded-md text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: ws.color }}
                >
                  {ws.name[0]}
                </div>
                {ws.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700">
              <button className="flex w-full items-center gap-2 rounded-b-xl px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Plus className="h-3.5 w-3.5" /> Novo workspace
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <Link
            href={`/app/${currentWorkspace.slug}`}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
              pathname === `/app/${currentWorkspace.slug}`
                ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Início
          </Link>
        </div>

        <div>
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Espaços</p>
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/app/${currentWorkspace.slug}/${space.id}`}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                currentSpaceId === space.id
                  ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <span className="text-base">{space.icon}</span>
              <span className="truncate">{space.name}</span>
            </Link>
          ))}
          <button
            onClick={() => setCreateSpaceOpen(true)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo espaço
          </button>
        </div>
      </nav>

      {createSpaceOpen && (
        <CreateSpaceDialog workspaceSlug={currentWorkspace.slug} onClose={() => setCreateSpaceOpen(false)} />
      )}

      <div className="border-t border-gray-100 dark:border-gray-800 p-2">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <Avatar name={user.name} color={user.avatarColor} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
            <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={toggle}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={logout}
            title="Sair"
            aria-label="Fazer logout"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
