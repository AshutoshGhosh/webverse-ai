"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Network,
  Activity,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, path: "" },
  { label: "Chat", icon: MessageSquare, path: "/chat" },
  { label: "Architecture", icon: Network, path: "/architecture" },
  { label: "Health", icon: Activity, path: "/health" },
];

export default function BrainLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ owner: string; repo: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const basePath = `/brain/${params.owner}/${params.repo}`;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <GlassPanel
        intensity="subtle"
        className={cn(
          "fixed top-0 left-0 h-screen border-r border-[rgba(255,255,255,0.06)] z-40 transition-all duration-300 rounded-none",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        <div className="flex flex-col h-full p-3">
          {/* Logo (jumps back to landing) */}
          <div className="px-2 py-4 mb-1">
            <Logo compact={collapsed} />
          </div>
          {!collapsed && (
            <p className="px-3 mb-3 text-xs text-[#6B6B76] truncate">
              {params.owner}/{params.repo}
            </p>
          )}

          {/* Nav Items */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const fullPath = basePath + item.path;
              const isActive = pathname === fullPath;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => router.push(fullPath)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-colors relative",
                    isActive
                      ? "text-white bg-[rgba(79,124,255,0.1)]"
                      : "text-[#A7A7B2] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[#4F7CFF]"
                    />
                  )}
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </motion.button>
              );
            })}
          </nav>

          {/* User block */}
          <div className="mt-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            {collapsed ? (
              <div className="flex justify-center">
                <UserMenu compact />
              </div>
            ) : (
              <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-2.5">
                <UserMenu stacked />
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 flex items-center justify-center w-8 h-8 rounded-[10px] text-[#6B6B76] hover:text-white hover:bg-[rgba(255,255,255,0.04)] mx-auto"
          >
            <ChevronLeft size={16} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
      </GlassPanel>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300", collapsed ? "ml-[68px]" : "ml-[240px]")}>
        {children}
      </main>
    </div>
  );
}
