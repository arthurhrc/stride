"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, placeholder, children, className }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
          className
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-lg"
        >
          <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <RadixSelect.Item
      value={value}
      className="relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none hover:bg-gray-50 dark:hover:bg-gray-700 data-[highlighted]:bg-gray-50 dark:data-[highlighted]:bg-gray-700"
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute right-2">
        <Check className="h-3.5 w-3.5 text-violet-600" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}
