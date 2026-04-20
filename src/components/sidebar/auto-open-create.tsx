"use client";

import { CreateSpaceDialog } from "@/components/sidebar/create-space-dialog";
import type { MethodologyType } from "@/types";

interface Props {
  workspaceSlug: string;
  methodology: MethodologyType;
}

export function AutoOpenCreate({ workspaceSlug, methodology }: Props) {
  return (
    <CreateSpaceDialog
      workspaceSlug={workspaceSlug}
      initialMethodology={methodology}
      onClose={() => {
        window.history.replaceState({}, "", window.location.pathname);
      }}
    />
  );
}
