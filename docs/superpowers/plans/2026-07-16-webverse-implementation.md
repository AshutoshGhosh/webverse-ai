# WebVerse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build WebVerse — an AI Engineering Brain that transforms GitHub repos into interactive knowledge bases.

**Architecture:** Monolithic Next.js 15 App Router application with Supabase (auth + DB), OpenAI Responses API (streaming analysis), React Flow (architecture graph), and a premium dark glassmorphism UI with Framer Motion + GSAP.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, GSAP, Three.js (R3F), React Flow, Supabase, OpenAI, Zustand, TanStack Query, Shiki, Lucide Icons

## Global Constraints

- Dark mode only (bg: #050505)
- 8px spacing system, generous whitespace
- Fonts: Inter (body), Space Grotesk (headings), JetBrains Mono (code)
- Radii: buttons 14px, inputs 16px, cards 24px, dialogs 28px
- Motion: Framer Motion springs (stiffness 260, damping 28, mass 0.8 default). NO rotation, bounce, linear easing.
- Respect `prefers-reduced-motion` — opacity-only fallback
- 60 FPS mandatory. Lazy load Three.js, React Flow, Shiki.
- No spinning loaders ever. Use skeletons, streaming, progressive reveal.
- Every component: hover, focus, pressed, disabled, loading, success, error states
- Strict TypeScript. No `any`.
- Feature-based folder structure under `src/features/`
- All design values from tokens — zero hardcoded colors/spacing

---

### Task 1: Project Scaffold & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/constants.ts`
- Create: `.env.local.example`
- Create: `.gitignore`

**Interfaces:**
- Produces: Working Next.js 15 app with Tailwind, dark theme, fonts loaded, all dependencies installed

- [ ] **Step 1: Initialize Next.js 15 project**

```bash
cd "/c/Client Source/WebVerse"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --turbopack
```

Select defaults. This creates the base scaffold.

- [ ] **Step 2: Install all dependencies**

```bash
npm install framer-motion gsap @gsap/react @react-three/fiber @react-three/drei @react-three/postprocessing three @reactflow/core @reactflow/background @reactflow/controls @reactflow/minimap @supabase/supabase-js @supabase/ssr openai zustand @tanstack/react-query shiki react-markdown lucide-react clsx tailwind-merge class-variance-authority
npm install -D @types/three
```

- [ ] **Step 3: Install and initialize shadcn/ui**

```bash
npx shadcn@latest init --defaults --force
```

- [ ] **Step 4: Configure tailwind.config.ts with design tokens**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0B0B0D",
        glass: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A7A7B2",
        "text-muted": "#6F7282",
        accent: {
          blue: "#4F7CFF",
          purple: "#8B5CF6",
          cyan: "#22D3EE",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        button: "14px",
        input: "16px",
        card: "24px",
        dialog: "28px",
      },
      maxWidth: {
        page: "1440px",
        dashboard: "1280px",
        hero: "1200px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

- [ ] **Step 5: Configure globals.css with font imports and base styles**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 2%;
    --foreground: 0 0% 98%;
    --card: 240 5% 4.5%;
    --card-foreground: 0 0% 98%;
    --popover: 240 5% 4.5%;
    --popover-foreground: 0 0% 98%;
    --primary: 227 100% 65%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 3% 12%;
    --secondary-foreground: 0 0% 98%;
    --muted: 233 10% 14%;
    --muted-foreground: 234 5% 47%;
    --accent: 227 100% 65%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 100% / 0.08;
    --input: 0 0% 100% / 0.08;
    --ring: 227 100% 65%;
    --radius: 24px;
  }

  * {
    border-color: theme(colors.border);
  }

  body {
    background: #050505;
    color: #FFFFFF;
    font-family: "Inter", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background: rgba(79, 124, 255, 0.3);
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
```

- [ ] **Step 6: Create root layout with fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "WebVerse — The AI Engineering Brain",
  description:
    "Transform any GitHub repository into a living engineering knowledge base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create placeholder home page**

Replace `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-display text-5xl font-bold tracking-tight">
        WebVerse
      </h1>
    </main>
  );
}
```

- [ ] **Step 8: Create env example and constants**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Create `src/lib/constants.ts`:

```ts
export const SITE = {
  name: "WebVerse",
  tagline: "The AI Engineering Brain",
  description:
    "Transform any GitHub repository into a living engineering knowledge base.",
} as const;

export const ANALYSIS_PHASES = [
  { key: "read_repository", label: "Reading repository..." },
  { key: "detect_framework", label: "Detecting framework..." },
  { key: "find_architecture", label: "Understanding architecture..." },
  { key: "map_dependencies", label: "Mapping dependencies..." },
  { key: "analyze_health", label: "Analyzing code health..." },
  { key: "generate_brain", label: "Building Engineering Brain..." },
] as const;

export const SPRING = {
  fast: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.6 },
  medium: { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.8 },
  gentle: { type: "spring" as const, stiffness: 180, damping: 24, mass: 1.0 },
  elegant: { type: "spring" as const, stiffness: 120, damping: 20, mass: 1.2 },
} as const;
```

- [ ] **Step 9: Create .gitignore**

```
node_modules/
.next/
.env.local
.env*.local
out/
dist/
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 10: Verify build**

```bash
npm run build
```

Expected: Successful build with no errors.

- [ ] **Step 11: Initialize git and commit**

```bash
git init
git add -A
git commit -m "feat: initialize Next.js 15 project with design tokens and configuration"
```

---

### Task 2: Design System — Motion Presets & Utility Components

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/lib/cn.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/glass-panel.tsx`
- Create: `src/components/ui/skeleton.tsx`

**Interfaces:**
- Consumes: Design tokens from `tailwind.config.ts`, springs from `src/lib/constants.ts`
- Produces: `cn()` utility, motion presets (`variants` object), Button, Card, Input, GlassPanel, Skeleton components

- [ ] **Step 1: Create cn utility**

Create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create motion presets**

Create `src/lib/motion.ts`:

```ts
import { type Variants } from "framer-motion";
import { SPRING } from "./constants";

export const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(4px)" },
  },
  fadeDown: {
    initial: { opacity: 0, y: -20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 10, filter: "blur(4px)" },
  },
  fadeLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  cardReveal: {
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  pageTransition: {
    initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  },
  listStagger: {
    animate: { transition: { staggerChildren: 0.06 } },
  },
  hoverLift: {
    rest: { y: 0, boxShadow: "0 0 0 rgba(79,124,255,0)" },
    hover: { y: -4, boxShadow: "0 20px 60px rgba(79,124,255,0.1)" },
  },
  buttonPress: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.97 },
  },
} satisfies Record<string, Variants>;

export const transition = {
  fast: SPRING.fast,
  medium: SPRING.medium,
  gentle: SPRING.gentle,
  elegant: SPRING.elegant,
};
```

- [ ] **Step 3: Create Button component**

Create `src/components/ui/button.tsx`:

```tsx
"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/40",
        secondary:
          "bg-glass backdrop-blur-md border border-border text-text-primary hover:bg-white/[0.08]",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
        outline:
          "border border-border text-text-primary hover:bg-white/[0.04]",
        danger:
          "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-[10px]",
        md: "h-10 px-5 text-sm rounded-button",
        lg: "h-12 px-8 text-base rounded-button",
        xl: "h-14 px-10 text-lg rounded-button",
        icon: "h-10 w-10 rounded-button",
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
```

- [ ] **Step 4: Create Card component**

Create `src/components/ui/card.tsx`:

```tsx
"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";

type CardProps = HTMLMotionProps<"div"> & {
  hoverable?: boolean;
  glowing?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, glowing, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-card border border-border bg-surface/80 backdrop-blur-md p-6",
          glowing && "shadow-lg shadow-accent-blue/5",
          className
        )}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={SPRING.medium}
        whileHover={
          hoverable
            ? {
                y: -4,
                boxShadow: "0 20px 60px rgba(79,124,255,0.08)",
                borderColor: "rgba(255,255,255,0.12)",
              }
            : undefined
        }
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
```

- [ ] **Step 5: Create Input component**

Create `src/components/ui/input.tsx`:

```tsx
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-input border border-border bg-glass px-4 text-sm text-text-primary placeholder:text-text-muted",
            "backdrop-blur-md transition-all duration-200",
            "focus:border-accent-blue/50 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:shadow-[0_0_20px_rgba(79,124,255,0.1)]",
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
```

- [ ] **Step 6: Create GlassPanel component**

Create `src/components/ui/glass-panel.tsx`:

```tsx
"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const GlassPanel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-card border border-border bg-glass backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

GlassPanel.displayName = "GlassPanel";
```

- [ ] **Step 7: Create Skeleton component**

Create `src/components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-card bg-white/[0.04]",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```

Expected: Successful build, no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add design system foundation — motion presets, Button, Card, Input, GlassPanel, Skeleton"
```

---

### Task 3: Providers & Library Configuration

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/openai.ts`
- Create: `src/lib/github.ts`
- Create: `src/providers/query-provider.tsx`
- Create: `src/stores/ui-store.ts`
- Create: `src/types/index.ts`
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: Environment variables, Supabase/OpenAI/GitHub credentials
- Produces: `createClient()` (browser), `createServerClient()` (server), `openai` instance, `githubFetch()` helper, `QueryProvider`, `useUIStore()`, shared TypeScript types

- [ ] **Step 1: Create TypeScript types**

Create `src/types/index.ts`:

```ts
export type AnalysisStatus = "pending" | "running" | "completed" | "failed";
export type Confidence = "high" | "medium" | "low";
export type MessageRole = "user" | "assistant";

export interface Repository {
  id: string;
  user_id: string;
  github_id: number;
  full_name: string;
  default_branch: string;
  language: string | null;
  stars: number;
  description: string | null;
  last_analyzed_at: string | null;
  created_at: string;
}

export interface AnalysisPhase {
  key: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  result: unknown;
  started_at: string | null;
  completed_at: string | null;
}

export interface RepositoryAnalysis {
  id: string;
  repository_id: string;
  status: AnalysisStatus;
  phases: AnalysisPhase[];
  summary: string | null;
  tech_stack: TechStack | null;
  architecture_pattern: string | null;
  key_files: string[];
  knowledge_model: KnowledgeModel | null;
  created_at: string;
}

export interface TechStack {
  languages: string[];
  frameworks: string[];
  runtime: string | null;
  package_manager: string | null;
  styling: string | null;
  testing: string | null;
  deployment: string | null;
}

export interface ArchitectureLayer {
  name: string;
  path: string;
  responsibility: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "frontend" | "backend" | "api" | "database" | "service" | "external" | "utility";
  files: string[];
  description?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface HealthCategory {
  score: number;
  findings: HealthFinding[];
}

export interface HealthFinding {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  file: string | null;
  suggestion: string | null;
}

export interface HealthReport {
  score: number;
  maturity: "Excellent" | "Good" | "Fair" | "Needs Work";
  categories: {
    architecture: HealthCategory;
    maintainability: HealthCategory;
    security: HealthCategory;
    documentation: HealthCategory;
    performance: HealthCategory;
    testing: HealthCategory;
  };
  strengths: string[];
  risks: string[];
  quick_wins: string[];
  technical_debt: string[];
}

export interface KnowledgeModel {
  summary: string;
  tech_stack: TechStack;
  architecture: {
    pattern: string;
    layers: ArchitectureLayer[];
    entry_points: string[];
    key_patterns: string[];
  };
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  health: HealthReport;
  suggested_questions: string[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  context_files: string[] | null;
  confidence: Confidence | null;
  created_at: string;
}

export interface SSEEvent {
  event: "phase_start" | "phase_progress" | "phase_complete" | "analysis_complete" | "error";
  data: Record<string, unknown>;
}
```

- [ ] **Step 2: Create Supabase browser client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create Supabase server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create Supabase middleware helper**

Create `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}
```

- [ ] **Step 5: Create Next.js middleware**

Create `src/middleware.ts`:

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 6: Create OpenAI client**

Create `src/lib/openai.ts`:

```ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

- [ ] **Step 7: Create GitHub fetch helper**

Create `src/lib/github.ts`:

```ts
const GITHUB_API = "https://api.github.com";

export async function githubFetch<T>(
  path: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}
```

- [ ] **Step 8: Create TanStack Query provider**

Create `src/providers/query-provider.tsx`:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

- [ ] **Step 9: Create Zustand UI store**

Create `src/stores/ui-store.ts`:

```ts
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  currentRepoId: string | null;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCurrentRepoId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  currentRepoId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setCurrentRepoId: (id) => set({ currentRepoId: id }),
}));
```

- [ ] **Step 10: Wire providers into root layout**

Update `src/app/layout.tsx` — add QueryProvider wrapping children:

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "WebVerse — The AI Engineering Brain",
  description:
    "Transform any GitHub repository into a living engineering knowledge base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Verify build**

```bash
npm run build
```

Expected: Successful build.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add Supabase, OpenAI, GitHub libs, providers, stores, and TypeScript types"
```

---

### Task 4: GitHub Authentication

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/features/auth/login-card.tsx`
- Create: `src/hooks/use-user.ts`

**Interfaces:**
- Consumes: Supabase client from `src/lib/supabase/`, Button from `src/components/ui/button.tsx`
- Produces: `/login` page, OAuth callback handler, `useUser()` hook returning `{ user, loading, signIn, signOut }`

- [ ] **Step 1: Create OAuth callback route**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

- [ ] **Step 2: Create useUser hook**

Create `src/hooks/use-user.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
```

- [ ] **Step 3: Create login card component**

Create `src/features/auth/login-card.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useUser } from "@/hooks/use-user";
import { SPRING } from "@/lib/constants";

export function LoginCard() {
  const { signIn } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={SPRING.gentle}
    >
      <GlassPanel className="w-full max-w-sm p-8 text-center">
        <motion.div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04] border border-border"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Github className="h-8 w-8 text-text-primary" />
        </motion.div>

        <h1 className="font-display text-2xl font-bold tracking-tight mb-2">
          Welcome to WebVerse
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Connect your GitHub to begin understanding your repositories.
        </p>

        <Button onClick={signIn} size="lg" className="w-full">
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      </GlassPanel>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create login page**

Create `src/app/login/page.tsx`:

```tsx
import { LoginCard } from "@/features/auth/login-card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <LoginCard />
    </main>
  );
}
```

- [ ] **Step 5: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add GitHub OAuth authentication with Supabase"
```

---

### Task 5: Repository Selection Dashboard

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/features/dashboard/repo-list.tsx`
- Create: `src/features/dashboard/repo-card.tsx`
- Create: `src/services/github.service.ts`
- Create: `src/app/api/github/repositories/route.ts`

**Interfaces:**
- Consumes: `useUser()`, `githubFetch()`, Button, Card, Input, motion presets
- Produces: `/dashboard` page showing user's GitHub repos, `GET /api/github/repositories` endpoint

- [ ] **Step 1: Create GitHub service**

Create `src/services/github.service.ts`:

```ts
import { githubFetch } from "@/lib/github";

interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  default_branch: string;
  updated_at: string;
  private: boolean;
}

export async function getUserRepositories(accessToken: string): Promise<GitHubRepo[]> {
  const repos = await githubFetch<GitHubRepo[]>(
    "/user/repos?sort=updated&per_page=50&type=all",
    accessToken
  );
  return repos;
}

export async function getRepository(accessToken: string, fullName: string): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${fullName}`, accessToken);
}
```

- [ ] **Step 2: Create repositories API route**

Create `src/app/api/github/repositories/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRepositories } from "@/services/github.service";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerToken = (
    await supabase.auth.getSession()
  ).data.session?.provider_token;

  if (!providerToken) {
    return NextResponse.json(
      { error: "GitHub token not found. Please re-authenticate." },
      { status: 401 }
    );
  }

  try {
    const repos = await getUserRepositories(providerToken);
    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create RepoCard component**

Create `src/features/dashboard/repo-card.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Star, GitBranch } from "lucide-react";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";

interface RepoCardProps {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
  onClick: () => void;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#ED8B00",
  Ruby: "#CC342D",
  Swift: "#F05138",
  Kotlin: "#7F52FF",
  "C#": "#239120",
  Vue: "#4FC08D",
  PHP: "#777BB4",
};

export function RepoCard({
  name,
  fullName,
  description,
  language,
  stars,
  updatedAt,
  onClick,
}: RepoCardProps) {
  const langColor = language ? LANG_COLORS[language] ?? "#6F7282" : null;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-card border border-border bg-surface/80 backdrop-blur-md p-6",
        "transition-colors hover:border-white/[0.12]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50"
      )}
      whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(79,124,255,0.06)" }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING.medium}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary truncate">{name}</h3>
          <p className="mt-1 text-sm text-text-muted truncate">
            {fullName}
          </p>
        </div>
        {stars > 0 && (
          <span className="flex items-center gap-1 text-xs text-text-muted shrink-0">
            <Star className="h-3 w-3" />
            {stars.toLocaleString()}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm text-text-secondary line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
        {language && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: langColor ?? undefined }}
            />
            {language}
          </span>
        )}
        <span>
          Updated {new Date(updatedAt).toLocaleDateString()}
        </span>
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 4: Create RepoList component**

Create `src/features/dashboard/repo-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RepoCard } from "./repo-card";
import { variants } from "@/lib/motion";

export function RepoList() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const res = await fetch("/api/github/repositories");
      if (!res.ok) throw new Error("Failed to fetch repos");
      return res.json();
    },
  });

  const filtered = repos?.filter(
    (r: { full_name: string; description: string | null }) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (fullName: string, githubId: number) => {
    router.push(`/repo/${encodeURIComponent(fullName)}/analyze`);
  };

  return (
    <div className="w-full max-w-dashboard mx-auto px-6">
      <motion.div {...variants.fadeUp} className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
          Your Repositories
        </h1>
        <p className="text-text-secondary">
          Select a repository to build its Engineering Brain.
        </p>
      </motion.div>

      <motion.div {...variants.fadeUp} transition={{ delay: 0.1 }} className="mb-6">
        <Input
          placeholder="Search repositories..."
          icon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={variants.listStagger}
          initial="initial"
          animate="animate"
        >
          {filtered?.map(
            (repo: {
              id: number;
              name: string;
              full_name: string;
              description: string | null;
              language: string | null;
              stargazers_count: number;
              updated_at: string;
            }) => (
              <motion.div key={repo.id} variants={variants.cardReveal}>
                <RepoCard
                  name={repo.name}
                  fullName={repo.full_name}
                  description={repo.description}
                  language={repo.language}
                  stars={repo.stargazers_count}
                  updatedAt={repo.updated_at}
                  onClick={() => handleSelect(repo.full_name, repo.id)}
                />
              </motion.div>
            )
          )}
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create dashboard page**

Create `src/app/dashboard/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RepoList } from "@/features/dashboard/repo-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen py-16">
      <RepoList />
    </main>
  );
}
```

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add repository selection dashboard with search and animated cards"
```

---

### Task 6: Repository Intelligence Engine & Timeline

**Files:**
- Create: `src/services/analysis.service.ts`
- Create: `src/services/repository.service.ts`
- Create: `src/app/api/intelligence/analyze/route.ts`
- Create: `src/app/repo/[id]/analyze/page.tsx`
- Create: `src/features/timeline/intelligence-timeline.tsx`
- Create: `src/features/timeline/timeline-phase.tsx`
- Create: `src/hooks/use-analysis-stream.ts`

**Interfaces:**
- Consumes: `openai`, `githubFetch()`, Supabase client, types from `src/types/index.ts`
- Produces: `GET /api/intelligence/analyze?repo=owner/name` (SSE stream), repository loader, analysis pipeline, timeline UI with live phase animations

- [ ] **Step 1: Create repository loader service**

Create `src/services/repository.service.ts`:

```ts
import { githubFetch } from "@/lib/github";

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface RepoTree {
  tree: TreeItem[];
  truncated: boolean;
}

export async function loadRepositoryTree(
  accessToken: string,
  fullName: string,
  branch: string
): Promise<TreeItem[]> {
  const data = await githubFetch<RepoTree>(
    `/repos/${fullName}/git/trees/${branch}?recursive=1`,
    accessToken
  );
  return data.tree.filter((item) => item.type === "blob");
}

export async function loadFileContent(
  accessToken: string,
  fullName: string,
  path: string
): Promise<string> {
  const data = await githubFetch<{ content: string; encoding: string }>(
    `/repos/${fullName}/contents/${path}`,
    accessToken
  );
  if (data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return data.content;
}

const PRIORITY_FILES = [
  "README.md",
  "readme.md",
  "package.json",
  "Cargo.toml",
  "go.mod",
  "pyproject.toml",
  "requirements.txt",
  "tsconfig.json",
  "next.config.js",
  "next.config.ts",
  "next.config.mjs",
  "vite.config.ts",
  "vite.config.js",
  "angular.json",
  "nuxt.config.ts",
  "svelte.config.js",
  ".env.example",
  "docker-compose.yml",
  "Dockerfile",
];

const ENTRY_PATTERNS = [
  /^src\/(index|main|app)\.(ts|tsx|js|jsx)$/,
  /^src\/app\/(layout|page)\.(ts|tsx)$/,
  /^app\/(layout|page)\.(ts|tsx)$/,
  /^pages\/_app\.(ts|tsx|js|jsx)$/,
  /^src\/routes/,
  /^src\/pages/,
];

export function selectKeyFiles(tree: TreeItem[]): string[] {
  const selected: string[] = [];

  for (const pf of PRIORITY_FILES) {
    if (tree.some((t) => t.path === pf)) {
      selected.push(pf);
    }
  }

  for (const item of tree) {
    if (selected.length >= 20) break;
    if (ENTRY_PATTERNS.some((p) => p.test(item.path)) && !selected.includes(item.path)) {
      selected.push(item.path);
    }
  }

  const routeFiles = tree
    .filter(
      (t) =>
        (t.path.includes("/api/") || t.path.includes("/routes/")) &&
        !selected.includes(t.path) &&
        (t.size ?? 0) < 10000
    )
    .slice(0, 10);

  for (const rf of routeFiles) {
    if (selected.length >= 20) break;
    selected.push(rf.path);
  }

  return selected;
}
```

- [ ] **Step 2: Create analysis service**

Create `src/services/analysis.service.ts`:

```ts
import { openai } from "@/lib/openai";
import type { TechStack, GraphNode, GraphEdge, HealthReport } from "@/types";

export async function detectFramework(
  packageJson: string | null,
  configFiles: Record<string, string>,
  tree: string[]
): Promise<TechStack> {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content:
          "Analyze the repository files and detect the tech stack. Return a JSON object with: languages (string[]), frameworks (string[]), runtime (string|null), package_manager (string|null), styling (string|null), testing (string|null), deployment (string|null).",
      },
      {
        role: "user",
        content: `package.json:\n${packageJson ?? "not found"}\n\nConfig files:\n${JSON.stringify(configFiles, null, 2)}\n\nFile tree (first 100):\n${tree.slice(0, 100).join("\n")}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  return JSON.parse(response.output_text) as TechStack;
}

export async function findArchitecture(
  tree: string[],
  entryPoints: Record<string, string>,
  techStack: TechStack
): Promise<{
  pattern: string;
  layers: { name: string; path: string; responsibility: string }[];
  entry_points: string[];
  key_patterns: string[];
}> {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content:
          "Analyze the repository architecture. Return JSON with: pattern (string, e.g. 'Monorepo with App Router'), layers (array of {name, path, responsibility}), entry_points (string[]), key_patterns (string[]).",
      },
      {
        role: "user",
        content: `Tech stack: ${JSON.stringify(techStack)}\n\nFile tree:\n${tree.slice(0, 200).join("\n")}\n\nEntry point files:\n${JSON.stringify(entryPoints, null, 2)}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  return JSON.parse(response.output_text);
}

export async function mapDependencies(
  tree: string[],
  architecture: { pattern: string; layers: { name: string; path: string; responsibility: string }[] },
  keyFiles: Record<string, string>
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content:
          'Analyze the repository and generate a dependency graph. Return JSON with: nodes (array of {id, label, type, files, description}) where type is one of: frontend, backend, api, database, service, external, utility; and edges (array of {source, target, relationship}).',
      },
      {
        role: "user",
        content: `Architecture: ${JSON.stringify(architecture)}\n\nFile tree:\n${tree.slice(0, 150).join("\n")}\n\nKey files:\n${JSON.stringify(keyFiles, null, 2).slice(0, 30000)}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  return JSON.parse(response.output_text);
}

export async function analyzeHealth(
  tree: string[],
  keyFiles: Record<string, string>,
  techStack: TechStack
): Promise<HealthReport> {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: `Analyze engineering health. Return JSON: { score (0-100), maturity ("Excellent"|"Good"|"Fair"|"Needs Work"), categories: { architecture: {score, findings}, maintainability: {score, findings}, security: {score, findings}, documentation: {score, findings}, performance: {score, findings}, testing: {score, findings} }, strengths (string[]), risks (string[]), quick_wins (string[]), technical_debt (string[]) }. Each finding: { severity: "critical"|"warning"|"info", title, description, file (nullable), suggestion (nullable) }.`,
      },
      {
        role: "user",
        content: `Tech stack: ${JSON.stringify(techStack)}\n\nFile tree (${tree.length} files):\n${tree.slice(0, 150).join("\n")}\n\nKey files:\n${JSON.stringify(keyFiles, null, 2).slice(0, 30000)}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  return JSON.parse(response.output_text);
}

export async function generateBrain(
  techStack: TechStack,
  architecture: { pattern: string; layers: { name: string; path: string; responsibility: string }[]; key_patterns: string[] },
  health: HealthReport
): Promise<{ summary: string; key_insights: string[]; suggested_questions: string[] }> {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content:
          "Synthesize all analysis into a final Engineering Brain summary. Return JSON: { summary (one paragraph), key_insights (string[], 3-5 items), suggested_questions (string[], 5-8 questions a developer might ask) }.",
      },
      {
        role: "user",
        content: `Tech Stack: ${JSON.stringify(techStack)}\n\nArchitecture: ${JSON.stringify(architecture)}\n\nHealth Score: ${health.score}/100 (${health.maturity})\nStrengths: ${health.strengths.join(", ")}\nRisks: ${health.risks.join(", ")}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  return JSON.parse(response.output_text);
}
```

- [ ] **Step 3: Create SSE analysis API route**

Create `src/app/api/intelligence/analyze/route.ts`:

```ts
import { createClient } from "@/lib/supabase/server";
import { loadRepositoryTree, loadFileContent, selectKeyFiles } from "@/services/repository.service";
import { detectFramework, findArchitecture, mapDependencies, analyzeHealth, generateBrain } from "@/services/analysis.service";
import { getUserRepositories } from "@/services/github.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get("repo");

  if (!repoFullName) {
    return new Response("Missing repo parameter", { status: 400 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const accessToken = session.provider_token;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Phase 1: Read Repository
        send("phase_start", { phase: "read_repository", index: 0 });
        const repoMeta = await (async () => {
          const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
          });
          return res.json();
        })();
        const tree = await loadRepositoryTree(accessToken, repoFullName, repoMeta.default_branch);
        const treePaths = tree.map((t) => t.path);
        const keyFilePaths = selectKeyFiles(tree);

        send("phase_progress", { phase: "read_repository", message: `Found ${tree.length} files, selected ${keyFilePaths.length} key files` });

        const keyFiles: Record<string, string> = {};
        for (const path of keyFilePaths) {
          try {
            keyFiles[path] = await loadFileContent(accessToken, repoFullName, path);
          } catch {
            // skip unreadable files
          }
        }
        send("phase_complete", { phase: "read_repository", result: { fileCount: tree.length, keyFiles: keyFilePaths } });

        // Phase 2: Detect Framework
        send("phase_start", { phase: "detect_framework", index: 1 });
        const techStack = await detectFramework(
          keyFiles["package.json"] ?? null,
          Object.fromEntries(
            Object.entries(keyFiles).filter(([k]) => k.includes("config") || k.endsWith(".json"))
          ),
          treePaths
        );
        send("phase_complete", { phase: "detect_framework", result: techStack });

        // Phase 3: Find Architecture
        send("phase_start", { phase: "find_architecture", index: 2 });
        const entryPointFiles = Object.fromEntries(
          Object.entries(keyFiles).filter(([k]) =>
            k.includes("index") || k.includes("main") || k.includes("app") || k.includes("layout")
          )
        );
        const architecture = await findArchitecture(treePaths, entryPointFiles, techStack);
        send("phase_complete", { phase: "find_architecture", result: architecture });

        // Phase 4: Map Dependencies
        send("phase_start", { phase: "map_dependencies", index: 3 });
        const graph = await mapDependencies(treePaths, architecture, keyFiles);
        send("phase_complete", { phase: "map_dependencies", result: graph });

        // Phase 5: Analyze Health
        send("phase_start", { phase: "analyze_health", index: 4 });
        const health = await analyzeHealth(treePaths, keyFiles, techStack);
        send("phase_complete", { phase: "analyze_health", result: health });

        // Phase 6: Generate Brain
        send("phase_start", { phase: "generate_brain", index: 5 });
        const brain = await generateBrain(techStack, architecture, health);
        send("phase_complete", { phase: "generate_brain", result: brain });

        // Store analysis in Supabase
        const { data: analysis } = await supabase
          .from("repository_analysis")
          .insert({
            repository_id: repoFullName,
            status: "completed",
            summary: brain.summary,
            tech_stack: techStack,
            architecture_pattern: architecture.pattern,
            key_files: keyFilePaths,
            knowledge_model: { tech_stack: techStack, architecture, graph, health, ...brain },
          })
          .select()
          .single();

        send("analysis_complete", {
          analysis_id: analysis?.id ?? "temp",
          redirect: `/repo/${encodeURIComponent(repoFullName)}/brain`,
        });
      } catch (error) {
        send("error", { message: error instanceof Error ? error.message : "Analysis failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 4: Create useAnalysisStream hook**

Create `src/hooks/use-analysis-stream.ts`:

```ts
"use client";

import { useState, useCallback, useRef } from "react";
import type { AnalysisPhase } from "@/types";
import { ANALYSIS_PHASES } from "@/lib/constants";

interface AnalysisState {
  status: "idle" | "running" | "completed" | "error";
  phases: AnalysisPhase[];
  currentPhaseIndex: number;
  error: string | null;
  analysisId: string | null;
  redirect: string | null;
}

export function useAnalysisStream() {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    phases: ANALYSIS_PHASES.map((p) => ({
      key: p.key,
      label: p.label,
      status: "pending",
      result: null,
      started_at: null,
      completed_at: null,
    })),
    currentPhaseIndex: -1,
    error: null,
    analysisId: null,
    redirect: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const startAnalysis = useCallback((repoFullName: string) => {
    setState((prev) => ({ ...prev, status: "running", error: null }));

    const es = new EventSource(
      `/api/intelligence/analyze?repo=${encodeURIComponent(repoFullName)}`
    );
    eventSourceRef.current = es;

    es.addEventListener("phase_start", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => {
        const phases = [...prev.phases];
        const idx = data.index as number;
        phases[idx] = { ...phases[idx], status: "running", started_at: new Date().toISOString() };
        return { ...prev, phases, currentPhaseIndex: idx };
      });
    });

    es.addEventListener("phase_progress", (e) => {
      // Could display sub-messages in UI
    });

    es.addEventListener("phase_complete", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => {
        const phases = [...prev.phases];
        const idx = phases.findIndex((p) => p.key === data.phase);
        if (idx !== -1) {
          phases[idx] = { ...phases[idx], status: "completed", result: data.result, completed_at: new Date().toISOString() };
        }
        return { ...prev, phases };
      });
    });

    es.addEventListener("analysis_complete", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => ({
        ...prev,
        status: "completed",
        analysisId: data.analysis_id,
        redirect: data.redirect,
      }));
      es.close();
    });

    es.addEventListener("error", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setState((prev) => ({ ...prev, status: "error", error: data.message }));
      } catch {
        setState((prev) => ({ ...prev, status: "error", error: "Connection lost" }));
      }
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setState((prev) => ({ ...prev, status: "error", error: "Connection lost" }));
      es.close();
    };
  }, []);

  const cancel = useCallback(() => {
    eventSourceRef.current?.close();
    setState((prev) => ({ ...prev, status: "idle" }));
  }, []);

  return { ...state, startAnalysis, cancel };
}
```

- [ ] **Step 5: Create TimelinePhase component**

Create `src/features/timeline/timeline-phase.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";
import type { AnalysisPhase } from "@/types";

export function TimelinePhase({ phase, index }: { phase: AnalysisPhase; index: number }) {
  const isActive = phase.status === "running";
  const isCompleted = phase.status === "completed";
  const isPending = phase.status === "pending";

  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING.medium, delay: index * 0.08 }}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        {isCompleted && (
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 border border-success/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING.fast}
          >
            <Check className="h-5 w-5 text-success" />
          </motion.div>
        )}
        {isActive && (
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10 border border-accent-blue/30"
            animate={{ boxShadow: ["0 0 0 rgba(79,124,255,0)", "0 0 20px rgba(79,124,255,0.3)", "0 0 0 rgba(79,124,255,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader2 className="h-5 w-5 text-accent-blue animate-spin" />
          </motion.div>
        )}
        {isPending && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
            <Circle className="h-4 w-4 text-text-muted" />
          </div>
        )}
      </div>

      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isCompleted && "text-text-secondary",
          isActive && "text-text-primary",
          isPending && "text-text-muted"
        )}
      >
        {phase.label}
      </span>
    </motion.div>
  );
}
```

- [ ] **Step 6: Create IntelligenceTimeline component**

Create `src/features/timeline/intelligence-timeline.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAnalysisStream } from "@/hooks/use-analysis-stream";
import { TimelinePhase } from "./timeline-phase";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/lib/constants";

export function IntelligenceTimeline({ repoFullName }: { repoFullName: string }) {
  const router = useRouter();
  const { status, phases, error, redirect, startAnalysis } = useAnalysisStream();

  useEffect(() => {
    startAnalysis(repoFullName);
  }, [repoFullName, startAnalysis]);

  useEffect(() => {
    if (status === "completed" && redirect) {
      const timer = setTimeout(() => router.push(redirect), 1500);
      return () => clearTimeout(timer);
    }
  }, [status, redirect, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING.gentle}
      >
        <motion.h2
          className="font-display text-2xl font-bold tracking-tight text-center mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Building Engineering Brain
        </motion.h2>
        <p className="text-center text-sm text-text-secondary mb-10">
          {repoFullName}
        </p>

        <div className="space-y-4">
          {phases.map((phase, i) => (
            <TimelinePhase key={phase.key} phase={phase} index={i} />
          ))}
        </div>

        {status === "completed" && (
          <motion.p
            className="mt-8 text-center text-sm text-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Engineering Brain ready. Redirecting...
          </motion.p>
        )}

        {status === "error" && (
          <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-danger mb-4">{error}</p>
            <Button variant="secondary" onClick={() => startAnalysis(repoFullName)}>
              Retry Analysis
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 7: Create analyze page**

Create `src/app/repo/[id]/analyze/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntelligenceTimeline } from "@/features/timeline/intelligence-timeline";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnalyzePage({ params }: Props) {
  const { id } = await params;
  const repoFullName = decodeURIComponent(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen">
      <IntelligenceTimeline repoFullName={repoFullName} />
    </main>
  );
}
```

- [ ] **Step 8: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add Repository Intelligence Engine with SSE streaming and animated timeline"
```

---

### Task 7: Mission Control Dashboard

**Files:**
- Create: `src/app/repo/[id]/brain/page.tsx`
- Create: `src/app/repo/[id]/layout.tsx`
- Create: `src/features/intelligence/mission-control.tsx`
- Create: `src/features/intelligence/repo-header.tsx`
- Create: `src/features/intelligence/insight-card.tsx`
- Create: `src/components/ui/sidebar.tsx`
- Create: `src/hooks/use-analysis.ts`

**Interfaces:**
- Consumes: Supabase client, `KnowledgeModel` type, Card, GlassPanel, motion presets
- Produces: `/repo/[id]/brain` page with 4-zone layout, sidebar navigation, `useAnalysis(repoId)` hook

- [ ] **Step 1: Create useAnalysis hook**

Create `src/hooks/use-analysis.ts`:

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeModel } from "@/types";

export function useAnalysis(repoFullName: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["analysis", repoFullName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repository_analysis")
        .select("*")
        .eq("repository_id", repoFullName)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as {
        id: string;
        summary: string;
        tech_stack: KnowledgeModel["tech_stack"];
        architecture_pattern: string;
        knowledge_model: KnowledgeModel;
      };
    },
  });
}
```

- [ ] **Step 2: Create Sidebar component**

Create `src/components/ui/sidebar.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, MessageSquare, Network, Activity } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { icon: Brain, label: "Brain", path: "brain" },
  { icon: MessageSquare, label: "Chat", path: "chat" },
  { icon: Network, label: "Architecture", path: "architecture" },
  { icon: Activity, label: "Health", path: "health" },
];

export function Sidebar({ repoId }: { repoId: string }) {
  const pathname = usePathname();
  const basePath = `/repo/${repoId}`;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-border bg-background py-4 gap-2">
      {NAV_ITEMS.map((item) => {
        const href = `${basePath}/${item.path}`;
        const isActive = pathname === href;
        return (
          <Link key={item.path} href={href} className="group relative">
            <motion.div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-button transition-colors",
                isActive
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="h-5 w-5" />
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-button border border-accent-blue/30 shadow-[0_0_12px_rgba(79,124,255,0.2)]"
                  layoutId="sidebar-active"
                />
              )}
            </motion.div>
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-surface border border-border text-xs text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
```

- [ ] **Step 3: Create repo layout with sidebar**

Create `src/app/repo/[id]/layout.tsx`:

```tsx
import { Sidebar } from "@/components/ui/sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function RepoLayout({ children, params }: Props) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen">
      <Sidebar repoId={id} />
      <main className="flex-1 pl-14">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Create RepoHeader component**

Create `src/features/intelligence/repo-header.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import type { KnowledgeModel } from "@/types";
import { variants } from "@/lib/motion";

export function RepoHeader({
  repoName,
  model,
}: {
  repoName: string;
  model: KnowledgeModel;
}) {
  return (
    <motion.div {...variants.fadeUp} className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {repoName}
        </h1>
        <span className="flex items-center gap-1 text-xs text-text-muted bg-white/[0.04] px-2 py-1 rounded-full border border-border">
          <GitBranch className="h-3 w-3" />
          {model.architecture.pattern}
        </span>
      </div>
      <p className="text-sm text-text-secondary max-w-2xl">{model.summary}</p>
    </motion.div>
  );
}
```

- [ ] **Step 5: Create InsightCard component**

Create `src/features/intelligence/insight-card.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { variants } from "@/lib/motion";

export function InsightCard({
  title,
  items,
  icon: Icon,
  accentColor = "accent-blue",
  delay = 0,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  accentColor?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="rounded-card border border-border bg-surface/80 backdrop-blur-md p-5"
      initial={variants.cardReveal.initial}
      animate={variants.cardReveal.animate}
      transition={{ delay }}
      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-4 w-4", `text-${accentColor}`)} />
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-text-secondary">
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
```

- [ ] **Step 6: Create MissionControl component**

Create `src/features/intelligence/mission-control.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Layers, Shield, Zap, AlertTriangle, Code2, MessageSquare } from "lucide-react";
import { useAnalysis } from "@/hooks/use-analysis";
import { RepoHeader } from "./repo-header";
import { InsightCard } from "./insight-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { variants } from "@/lib/motion";

export function MissionControl({ repoFullName }: { repoFullName: string }) {
  const router = useRouter();
  const { data: analysis, isLoading } = useAnalysis(repoFullName);
  const repoName = repoFullName.split("/").pop() ?? repoFullName;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-20 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;
  const model = analysis.knowledge_model;

  return (
    <div className="p-8 max-w-dashboard mx-auto">
      <RepoHeader repoName={repoName} model={model} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <InsightCard
          title="Tech Stack"
          items={[...model.tech_stack.frameworks, ...model.tech_stack.languages]}
          icon={Code2}
          delay={0.1}
        />
        <InsightCard
          title="Strengths"
          items={model.health.strengths.slice(0, 4)}
          icon={Zap}
          accentColor="success"
          delay={0.2}
        />
        <InsightCard
          title="Risks"
          items={model.health.risks.slice(0, 4)}
          icon={AlertTriangle}
          accentColor="warning"
          delay={0.3}
        />
        <InsightCard
          title="Architecture"
          items={model.architecture.layers.map((l) => l.name)}
          icon={Layers}
          accentColor="accent-purple"
          delay={0.4}
        />
        <InsightCard
          title="Quick Wins"
          items={model.health.quick_wins.slice(0, 4)}
          icon={Shield}
          accentColor="accent-cyan"
          delay={0.5}
        />
        <InsightCard
          title="Suggested Questions"
          items={model.suggested_questions.slice(0, 4)}
          icon={MessageSquare}
          delay={0.6}
        />
      </div>

      <motion.div {...variants.fadeUp} transition={{ delay: 0.7 }}>
        <Input
          placeholder="Ask anything about this repository..."
          icon={<MessageSquare className="h-4 w-4" />}
          className="cursor-pointer"
          readOnly
          onClick={() => router.push(`/repo/${encodeURIComponent(repoFullName)}/chat`)}
        />
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 7: Create brain page**

Create `src/app/repo/[id]/brain/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MissionControl } from "@/features/intelligence/mission-control";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BrainPage({ params }: Props) {
  const { id } = await params;
  const repoFullName = decodeURIComponent(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <MissionControl repoFullName={repoFullName} />;
}
```

- [ ] **Step 8: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add Mission Control dashboard with sidebar navigation and insight cards"
```

---

### Task 8: Engineering Brain Chat

**Files:**
- Create: `src/app/repo/[id]/chat/page.tsx`
- Create: `src/app/api/chat/route.ts`
- Create: `src/features/chat/chat-view.tsx`
- Create: `src/features/chat/chat-message.tsx`
- Create: `src/features/chat/chat-input.tsx`
- Create: `src/services/chat.service.ts`
- Create: `src/hooks/use-chat.ts`

**Interfaces:**
- Consumes: `useAnalysis()`, OpenAI Responses API, markdown renderer, Supabase
- Produces: `/repo/[id]/chat` page, streaming chat with repo context, `/api/chat` route

- [ ] **Step 1: Create chat service**

Create `src/services/chat.service.ts`:

```ts
import { openai } from "@/lib/openai";
import type { KnowledgeModel } from "@/types";

export function buildSystemPrompt(repoName: string, model: KnowledgeModel): string {
  return `You are the Engineering Brain for "${repoName}".

You have complete understanding of this repository:
- Architecture: ${model.architecture.pattern}
- Layers: ${model.architecture.layers.map((l) => l.name).join(", ")}
- Tech Stack: ${model.tech_stack.frameworks.join(", ")} (${model.tech_stack.languages.join(", ")})
- Key Entry Points: ${model.architecture.entry_points.join(", ")}
- Health Score: ${model.health.score}/100 (${model.health.maturity})

Rules:
- Reference specific files and paths
- Explain WHY, not just WHAT
- Be concise but thorough
- If uncertain, say "I couldn't find evidence for this" — never fabricate
- End with 1-2 suggested follow-up questions

Format answers as:
**Summary** (1-2 sentences)
**Explanation** (details)
**Relevant Files** (bullet list of paths)
**Suggested Questions** (1-2 follow-ups)`;
}

export async function* streamChatResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  });

  for await (const event of response) {
    if (event.type === "response.output_text.delta") {
      yield event.delta;
    }
  }
}
```

- [ ] **Step 2: Create chat API route**

Create `src/app/api/chat/route.ts`:

```ts
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt, streamChatResponse } from "@/services/chat.service";
import type { KnowledgeModel } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const { repoFullName, messages } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: analysis } = await supabase
    .from("repository_analysis")
    .select("knowledge_model")
    .eq("repository_id", repoFullName)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!analysis?.knowledge_model) {
    return new Response("No analysis found", { status: 404 });
  }

  const model = analysis.knowledge_model as KnowledgeModel;
  const repoName = repoFullName.split("/").pop() ?? repoFullName;
  const systemPrompt = buildSystemPrompt(repoName, model);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatResponse(systemPrompt, messages)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode("\n\n*Error generating response. Please try again.*")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

- [ ] **Step 3: Create useChat hook**

Create `src/hooks/use-chat.ts`:

```ts
"use client";

import { useState, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChat(repoFullName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoFullName,
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error("Chat failed");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + text }
                  : m
              )
            );
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Failed to generate response. Please try again." }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, repoFullName]
  );

  return { messages, isStreaming, sendMessage };
}
```

- [ ] **Step 4: Create ChatMessage component**

Create `src/features/chat/chat-message.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User, Brain } from "lucide-react";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/constants";

export function ChatMessage({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <motion.div
      className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING.fast}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border",
          isUser ? "bg-accent-blue/10" : "bg-accent-purple/10"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-accent-blue" />
        ) : (
          <Brain className="h-4 w-4 text-accent-purple" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[75%] rounded-card px-4 py-3 text-sm",
          isUser
            ? "bg-accent-blue/10 border border-accent-blue/20 text-text-primary"
            : "bg-surface border border-border text-text-secondary"
        )}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="font-semibold text-text-primary">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-accent-cyan">
                {children}
              </code>
            ),
            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
            li: ({ children }) => <li className="text-text-secondary">{children}</li>,
          }}
        >
          {content || "Thinking..."}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 5: Create ChatInput component**

Create `src/features/chat/chat-input.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-border">
      <Input
        placeholder="Ask about this repository..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
        disabled={disabled}
      />
      <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

- [ ] **Step 6: Create ChatView component**

Create `src/features/chat/chat-view.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/use-chat";
import { useAnalysis } from "@/hooks/use-analysis";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { variants } from "@/lib/motion";

export function ChatView({ repoFullName }: { repoFullName: string }) {
  const { messages, isStreaming, sendMessage } = useChat(repoFullName);
  const { data: analysis } = useAnalysis(repoFullName);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const suggestedQuestions = analysis?.knowledge_model?.suggested_questions ?? [
    "How does authentication work?",
    "Explain the architecture",
    "Find technical debt",
  ];

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold">Engineering Brain</h2>
        <p className="text-xs text-text-muted">
          Ask anything about {repoFullName.split("/").pop()}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <motion.div {...variants.fadeUp} className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <p className="text-sm text-text-muted">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestedQuestions.slice(0, 5).map((q) => (
                <Button
                  key={q}
                  variant="secondary"
                  size="sm"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
```

- [ ] **Step 7: Create chat page**

Create `src/app/repo/[id]/chat/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatView } from "@/features/chat/chat-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  const repoFullName = decodeURIComponent(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ChatView repoFullName={repoFullName} />;
}
```

- [ ] **Step 8: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add Engineering Brain chat with streaming responses and suggested questions"
```

---

### Task 9: Architecture Explorer

**Files:**
- Create: `src/app/repo/[id]/architecture/page.tsx`
- Create: `src/features/architecture/architecture-graph.tsx`
- Create: `src/features/architecture/custom-node.tsx`
- Create: `src/features/architecture/node-detail-panel.tsx`

**Interfaces:**
- Consumes: `useAnalysis()`, React Flow, `GraphNode`/`GraphEdge` types
- Produces: `/repo/[id]/architecture` page with interactive React Flow graph, custom nodes, detail panel

- [ ] **Step 1: Create custom graph node**

Create `src/features/architecture/custom-node.tsx`:

```tsx
"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@reactflow/core";
import { motion } from "framer-motion";
import { Layers, Server, Database, Globe, Code2, Puzzle, Boxes } from "lucide-react";
import { cn } from "@/lib/cn";

const TYPE_CONFIG: Record<string, { icon: typeof Layers; color: string }> = {
  frontend: { icon: Layers, color: "text-accent-blue" },
  backend: { icon: Server, color: "text-accent-purple" },
  api: { icon: Globe, color: "text-accent-cyan" },
  database: { icon: Database, color: "text-success" },
  service: { icon: Puzzle, color: "text-warning" },
  external: { icon: Boxes, color: "text-text-muted" },
  utility: { icon: Code2, color: "text-text-secondary" },
};

export const CustomNode = memo(function CustomNode({
  data,
  selected,
}: NodeProps<{ label: string; type: string; description?: string }>) {
  const config = TYPE_CONFIG[data.type] ?? TYPE_CONFIG.utility;
  const Icon = config.icon;

  return (
    <motion.div
      className={cn(
        "rounded-card border bg-surface/90 backdrop-blur-md px-4 py-3 min-w-[140px]",
        selected ? "border-accent-blue/50 shadow-[0_0_20px_rgba(79,124,255,0.15)]" : "border-border"
      )}
      whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.15)" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent-blue !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className="text-sm font-medium text-text-primary">{data.label}</span>
      </div>
      {data.description && (
        <p className="mt-1 text-xs text-text-muted line-clamp-2">{data.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-accent-purple !w-2 !h-2 !border-0" />
    </motion.div>
  );
});
```

- [ ] **Step 2: Create NodeDetailPanel**

Create `src/features/architecture/node-detail-panel.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileCode } from "lucide-react";
import type { GraphNode } from "@/types";
import { SPRING } from "@/lib/constants";

export function NodeDetailPanel({
  node,
  onClose,
}: {
  node: GraphNode | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          className="absolute right-4 top-4 bottom-4 w-80 rounded-card border border-border bg-surface/95 backdrop-blur-xl p-5 overflow-y-auto z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={SPRING.fast}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">{node.label}</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>

          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-white/[0.04] border border-border text-text-muted mb-3">
            {node.type}
          </span>

          {node.description && (
            <p className="text-sm text-text-secondary mb-4">{node.description}</p>
          )}

          {node.files.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-text-muted mb-2">Files</h4>
              <ul className="space-y-1">
                {node.files.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                    <FileCode className="h-3 w-3 text-text-muted" />
                    <span className="font-mono truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create ArchitectureGraph component**

Create `src/features/architecture/architecture-graph.tsx`:

```tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@reactflow/core";
import "@reactflow/core/dist/style.css";
import { useAnalysis } from "@/hooks/use-analysis";
import { CustomNode } from "./custom-node";
import { NodeDetailPanel } from "./node-detail-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { GraphNode } from "@/types";

const nodeTypes = { custom: CustomNode };

export function ArchitectureGraph({ repoFullName }: { repoFullName: string }) {
  const { data: analysis, isLoading } = useAnalysis(repoFullName);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!analysis?.knowledge_model?.graph) return { initialNodes: [], initialEdges: [] };

    const graphData = analysis.knowledge_model.graph;
    const nodes: Node[] = graphData.nodes.map((n, i) => ({
      id: n.id,
      type: "custom",
      position: { x: (i % 3) * 250 + 50, y: Math.floor(i / 3) * 150 + 50 },
      data: { label: n.label, type: n.type, description: n.description },
    }));

    const edges: Edge[] = graphData.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      animated: true,
      style: { stroke: "rgba(79,124,255,0.4)" },
      labelStyle: { fontSize: 10, fill: "#6F7282" },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [analysis]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = analysis?.knowledge_model?.graph?.nodes.find(
        (n) => n.id === node.id
      );
      setSelectedNode(graphNode ?? null);
    },
    [analysis]
  );

  if (isLoading) return <Skeleton className="h-full w-full" />;

  return (
    <div className="relative h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background color="rgba(255,255,255,0.03)" gap={32} />
        <Controls className="!bg-surface !border-border !rounded-button [&_button]:!bg-surface [&_button]:!border-border [&_button]:!text-text-muted" />
        <MiniMap
          nodeColor={() => "rgba(79,124,255,0.3)"}
          className="!bg-surface !border-border !rounded-card"
        />
      </ReactFlow>

      <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
```

- [ ] **Step 4: Create architecture page**

Create `src/app/repo/[id]/architecture/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArchitectureGraph } from "@/features/architecture/architecture-graph";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArchitecturePage({ params }: Props) {
  const { id } = await params;
  const repoFullName = decodeURIComponent(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ArchitectureGraph repoFullName={repoFullName} />;
}
```

- [ ] **Step 5: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add Architecture Explorer with React Flow graph and detail panel"
```

---

### Task 10: Engineering Health Report

**Files:**
- Create: `src/app/repo/[id]/health/page.tsx`
- Create: `src/features/health/health-view.tsx`
- Create: `src/features/health/health-ring.tsx`
- Create: `src/features/health/findings-list.tsx`

**Interfaces:**
- Consumes: `useAnalysis()`, `HealthReport` type, motion presets
- Produces: `/repo/[id]/health` page with animated health rings and findings

- [ ] **Step 1: Create animated HealthRing**

Create `src/features/health/health-ring.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { SPRING } from "@/lib/constants";

export function HealthRing({
  score,
  label,
  size = 100,
  delay = 0,
}: {
  score: number;
  label: string;
  size?: number;
  delay?: number;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={5}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ ...SPRING.gentle, delay }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-lg font-bold text-text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create FindingsList**

Create `src/features/health/findings-list.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import type { HealthFinding } from "@/types";
import { cn } from "@/lib/cn";
import { variants } from "@/lib/motion";

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
};

export function FindingsList({ findings }: { findings: HealthFinding[] }) {
  return (
    <motion.div className="space-y-2" variants={variants.listStagger} initial="initial" animate="animate">
      {findings.map((f, i) => {
        const config = SEVERITY_CONFIG[f.severity];
        const Icon = config.icon;
        return (
          <motion.div
            key={i}
            className="flex items-start gap-3 rounded-card border border-border bg-surface/60 p-4"
            variants={variants.cardReveal}
          >
            <div className={cn("rounded-full p-1.5", config.bg)}>
              <Icon className={cn("h-3.5 w-3.5", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{f.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.description}</p>
              {f.file && (
                <span className="inline-block mt-1 text-xs font-mono text-accent-cyan/80">
                  {f.file}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create HealthView**

Create `src/features/health/health-view.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { useAnalysis } from "@/hooks/use-analysis";
import { HealthRing } from "./health-ring";
import { FindingsList } from "./findings-list";
import { InsightCard } from "@/features/intelligence/insight-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, AlertTriangle, Lightbulb, Bug } from "lucide-react";
import { variants } from "@/lib/motion";
import { SPRING } from "@/lib/constants";

export function HealthView({ repoFullName }: { repoFullName: string }) {
  const { data: analysis, isLoading } = useAnalysis(repoFullName);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      </div>
    );
  }

  if (!analysis) return null;
  const health = analysis.knowledge_model.health;
  const categories = health.categories;

  return (
    <div className="p-8 max-w-dashboard mx-auto">
      <motion.div {...variants.fadeUp} className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">
          Engineering Health
        </h1>
        <p className="text-sm text-text-secondary">
          {health.maturity} — Score {health.score}/100
        </p>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-8 justify-center mb-10 p-6 rounded-card border border-border bg-surface/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING.gentle}
      >
        <HealthRing score={health.score} label="Overall" size={120} delay={0} />
        <HealthRing score={categories.architecture.score} label="Architecture" delay={0.1} />
        <HealthRing score={categories.maintainability.score} label="Maintainability" delay={0.2} />
        <HealthRing score={categories.security.score} label="Security" delay={0.3} />
        <HealthRing score={categories.documentation.score} label="Documentation" delay={0.4} />
        <HealthRing score={categories.testing.score} label="Testing" delay={0.5} />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <InsightCard title="Strengths" items={health.strengths} icon={Zap} accentColor="success" delay={0.2} />
        <InsightCard title="Risks" items={health.risks} icon={AlertTriangle} accentColor="danger" delay={0.3} />
        <InsightCard title="Quick Wins" items={health.quick_wins} icon={Lightbulb} accentColor="accent-cyan" delay={0.4} />
        <InsightCard title="Technical Debt" items={health.technical_debt} icon={Bug} accentColor="warning" delay={0.5} />
      </div>

      <motion.div {...variants.fadeUp} transition={{ delay: 0.6 }}>
        <h2 className="font-semibold text-text-primary mb-4">Findings</h2>
        <FindingsList
          findings={Object.values(categories).flatMap((c) => c.findings).sort(
            (a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0)
          )}
        />
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Create health page**

Create `src/app/repo/[id]/health/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HealthView } from "@/features/health/health-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HealthPage({ params }: Props) {
  const { id } = await params;
  const repoFullName = decodeURIComponent(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <HealthView repoFullName={repoFullName} />;
}
```

- [ ] **Step 5: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add Engineering Health Report with animated rings and findings"
```

---

### Task 11: Landing Page

**Files:**
- Create: `src/features/landing/hero-section.tsx`
- Create: `src/features/landing/features-section.tsx`
- Create: `src/features/landing/cta-section.tsx`
- Create: `src/features/landing/hero-scene.tsx` (Three.js)
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Button, GSAP, Three.js/R3F, motion presets
- Produces: Full landing page with 3D hero, scroll sections, final CTA

- [ ] **Step 1: Create Three.js hero scene**

Create `src/features/landing/hero-scene.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function BrainSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#4F7CFF"
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

function Particles() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#8B5CF6" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#4F7CFF" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#8B5CF6" />
        <BrainSphere />
        <Particles />
        <EffectComposer>
          <Bloom luminanceThreshold={0.6} intensity={0.5} radius={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Create HeroSection**

Create `src/features/landing/hero-section.tsx`:

```tsx
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SITE, SPRING } from "@/lib/constants";
import Link from "next/link";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => ({ default: m.HeroScene })),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <div className="relative z-10 text-center max-w-hero mx-auto">
        <motion.h1
          className="font-display text-5xl sm:text-7xl font-bold tracking-[-0.04em] mb-6"
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...SPRING.elegant, delay: 0.2 }}
        >
          {SITE.tagline}
        </motion.h1>

        <motion.p
          className="text-lg text-text-secondary max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.elegant, delay: 0.4 }}
        >
          {SITE.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.elegant, delay: 0.6 }}
        >
          <Link href="/login">
            <Button size="xl">Connect GitHub</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create FeaturesSection**

Create `src/features/landing/features-section.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Brain, Network, Activity, Zap, Shield, MessageSquare } from "lucide-react";
import { variants } from "@/lib/motion";

const FEATURES = [
  { icon: Brain, title: "Engineering Brain", desc: "AI builds complete repository understanding before answering." },
  { icon: Network, title: "Architecture Explorer", desc: "Visualize real software architecture, not just folders." },
  { icon: Activity, title: "Engineering Health", desc: "Executive-level insights into code quality and risks." },
  { icon: MessageSquare, title: "Repository Chat", desc: "Ask anything — every answer grounded in your code." },
  { icon: Zap, title: "Intelligence Timeline", desc: "Watch understanding being built in real-time." },
  { icon: Shield, title: "Grounded Answers", desc: "No hallucinations. Every claim references real files." },
];

export function FeaturesSection() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-hero mx-auto">
        <motion.h2
          className="font-display text-4xl font-bold tracking-tight text-center mb-16"
          {...variants.fadeUp}
        >
          How WebVerse Thinks
        </motion.h2>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={variants.listStagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              className="rounded-card border border-border bg-surface/60 backdrop-blur-md p-6"
              variants={variants.cardReveal}
              whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.12)" }}
            >
              <f.icon className="h-6 w-6 text-accent-blue mb-3" />
              <h3 className="font-semibold text-text-primary mb-1">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create CTASection**

Create `src/features/landing/cta-section.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/lib/constants";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-32 px-4 text-center">
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={SPRING.gentle}
      >
        <h2 className="font-display text-4xl font-bold tracking-tight mb-4">
          Understand your codebase today.
        </h2>
        <p className="text-text-secondary mb-8">
          Stop spending days reading code. Let WebVerse build the understanding for you.
        </p>
        <Link href="/login">
          <Button size="xl">Connect GitHub</Button>
        </Link>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 5: Update home page**

Replace `src/app/page.tsx`:

```tsx
import { HeroSection } from "@/features/landing/hero-section";
import { FeaturesSection } from "@/features/landing/features-section";
import { CTASection } from "@/features/landing/cta-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
```

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add landing page with Three.js hero, features grid, and CTA"
```

---

## Execution Complete

Plan covers all 11 tasks across the full MVP: scaffold → design system → providers → auth → dashboard → intelligence engine → mission control → chat → architecture → health → landing page.

Total estimated time: ~26 hours of focused development.

---
