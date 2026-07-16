import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-gradient-to-r from-[rgba(255,255,255,0.03)] via-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.03)] bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}
