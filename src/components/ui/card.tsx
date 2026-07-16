"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";

type CardProps = HTMLMotionProps<"div"> & {
  hover?: boolean;
  glow?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl p-6",
          glow && "shadow-[0_0_40px_rgba(79,124,255,0.06)]",
          className
        )}
        whileHover={hover ? { y: -4, boxShadow: "0 20px 60px rgba(79,124,255,0.08)" } : undefined}
        transition={SPRING.medium}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold text-white font-[family-name:var(--font-space-grotesk)]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-[#A7A7B2]", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";
