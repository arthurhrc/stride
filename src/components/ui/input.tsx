import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
