import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[rgba(148,163,184,0.15)] text-[#94a3b8]",
        success: "bg-[rgba(34,197,94,0.15)] text-[#22c55e]",
        warning: "bg-[rgba(234,179,8,0.15)] text-[#eab308]",
        danger: "bg-[rgba(239,68,68,0.15)] text-[#ef4444]",
        info: "bg-[rgba(59,130,246,0.15)] text-[#3b82f6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
