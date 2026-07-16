import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[rgba(79,124,255,0.1)] text-[#4F7CFF] border border-[rgba(79,124,255,0.2)]",
        success: "bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.2)]",
        warning: "bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]",
        danger: "bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]",
        purple: "bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] border border-[rgba(139,92,246,0.2)]",
        muted: "bg-[rgba(255,255,255,0.04)] text-[#A7A7B2] border border-[rgba(255,255,255,0.06)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
