"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/sidebar";
import type { WorkspaceSummary, SpaceSummary } from "@/types";

interface ShellContextValue {
  openSidebar: () => void;
}
export const ShellContext = createContext<ShellContextValue>({ openSidebar: () => {} });
export function useShell() { return useContext(ShellContext); }

interface Props {
  user: { id: string; name: string; email: string; avatarColor: string };
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary;
  spaces: SpaceSummary[];
  currentSpaceId?: string;
  children: React.ReactNode;
}

export function WorkspaceShell({ user, workspaces, currentWorkspace, spaces, currentSpaceId, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ShellContext.Provider value={{ openSidebar: () => setMobileOpen(true) }}>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, fixed on desktop */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:translate-x-0 md:z-auto",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar
            user={user}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            spaces={spaces}
            currentSpaceId={currentSpaceId}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>

        <main className="flex flex-1 flex-col overflow-hidden min-w-0">{children}</main>
      </div>
    </ShellContext.Provider>
  );
}
