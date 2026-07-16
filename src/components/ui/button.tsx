"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#4F7CFF] to-[#8B5CF6] text-white shadow-lg shadow-[#4F7CFF]/20 hover:shadow-[#4F7CFF]/40",
        secondary:
          "bg-[rgba(255,255,255,0.04)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)]",
        ghost:
          "text-[#A7A7B2] hover:text-white hover:bg-[rgba(255,255,255,0.04)]",
        outline:
          "border border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.04)]",
        danger:
          "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/20",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-[10px]",
        md: "h-10 px-5 text-sm rounded-[14px]",
        lg: "h-12 px-8 text-base rounded-[14px]",
        xl: "h-14 px-10 text-lg rounded-[14px]",
        icon: "h-10 w-10 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = HTMLMotionProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={SPRING.fast}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-pulse rounded-full bg-current opacity-50" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { buttonVariants };
