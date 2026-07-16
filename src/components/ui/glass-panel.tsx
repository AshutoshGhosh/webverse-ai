"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type GlassPanelProps = HTMLMotionProps<"div"> & {
  intensity?: "subtle" | "medium" | "strong";
};

const intensityMap = {
  subtle: "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.04)] backdrop-blur-md",
  medium: "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-xl",
  strong: "bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.12)] backdrop-blur-2xl",
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = "medium", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-[24px] border",
          intensityMap[intensity],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";
