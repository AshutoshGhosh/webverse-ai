"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B76]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-12 rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-white placeholder:text-[#6B6B76] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/30 focus:border-[#4F7CFF]/50 transition-all",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
