import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-violet-600 text-white hover:bg-violet-700",
        secondary: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
        ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";
