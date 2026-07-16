# WebVerse — The AI Engineering Brain

Transform any GitHub repository into a living engineering knowledge base. WebVerse analyzes your codebase's architecture, patterns, dependencies, and health — then lets you chat with it.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![GPT-4o](https://img.shields.io/badge/GPT--4o-Powered-412991?logo=openai)

---

## Features

- **AI-Powered Analysis** — GPT-4o analyzes your entire repository structure, architecture patterns, and engineering health in real-time via streaming SSE
- **Architecture Visualization** — Interactive dependency graph built with React Flow showing modules, services, databases, and their relationships
- **Engineering Brain Chat** — Ask anything about your codebase and get contextual, source-aware answers with streaming responses
- **Health Reports** — Comprehensive quality scoring across categories with severity-rated findings
- **Intelligence Timeline** — Beautiful animated progress UI during analysis showing each phase in real-time
- **Premium UI** — Dark-mode glass morphism design with Framer Motion spring animations and GSAP landing page

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 + custom design tokens |
| UI Components | Custom (Button, Card, GlassPanel, Badge, Input, Skeleton) |
| Animations | Framer Motion (app) + GSAP (landing page) |
| Graph | React Flow (@xyflow/react) |
| Auth | Supabase Auth (GitHub OAuth) |
| AI | OpenAI GPT-4o (streaming + structured outputs) |
| State | Zustand (UI) + TanStack Query (server) |
| Fonts | Inter, Space Grotesk, JetBrains Mono |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A GitHub OAuth app (configured in Supabase)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |

### 3. Set up Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Enable **GitHub** provider
4. Add your GitHub OAuth App credentials
5. Set the callback URL to: `http://localhost:3000/auth/callback`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page (GSAP animated)
│   ├── layout.tsx                        # Root layout with fonts + providers
│   ├── dashboard/page.tsx                # Repository selection grid
│   ├── analyze/[owner]/[repo]/page.tsx   # Intelligence timeline (SSE streaming)
│   ├── brain/[owner]/[repo]/
│   │   ├── layout.tsx                    # Sidebar navigation
│   │   ├── page.tsx                      # Overview dashboard
│   │   ├── chat/page.tsx                 # AI chat interface
│   │   ├── architecture/page.tsx         # React Flow graph
│   │   └── health/page.tsx              # Health report
│   ├── api/
│   │   ├── analyze/route.ts             # Analysis SSE endpoint
│   │   └── chat/route.ts               # Chat streaming endpoint
│   └── auth/
│       ├── callback/route.ts            # OAuth callback handler
│       ├── login/route.ts               # Initiates GitHub OAuth
│       └── logout/route.ts             # Signs out user
├── components/
│   ├── providers.tsx                     # TanStack Query + AnimatePresence
│   └── ui/
│       ├── button.tsx                    # Framer Motion button with variants
│       ├── card.tsx                      # Glass card with hover lift
│       ├── input.tsx                     # Styled input with icon slot
│       ├── glass-panel.tsx              # Configurable glass morphism panel
│       ├── badge.tsx                     # Color-coded status badges
│       └── skeleton.tsx                 # Shimmer loading skeleton
├── lib/
│   ├── cn.ts                            # clsx + tailwind-merge utility
│   ├── constants.ts                     # Site config, phases, spring presets
│   ├── motion.ts                        # Animation variants + transitions
│   ├── types.ts                         # TypeScript interfaces
│   ├── github.ts                        # GitHub API utilities
│   ├── openai.ts                        # OpenAI streaming + structured output
│   └── supabase/
│       ├── client.ts                    # Browser Supabase client
│       ├── server.ts                    # Server Supabase client
│       └── middleware.ts               # Session refresh + route protection
├── stores/
│   ├── ui-store.ts                      # Sidebar, panels, command palette
│   └── analysis-store.ts              # Analysis state, events, results
└── middleware.ts                         # Next.js middleware (auth guard)
```

---

## User Flow

```
Landing Page → GitHub Login → Select Repository → Intelligence Timeline → Engineering Brain
                                                                              ├── Overview
                                                                              ├── Chat
                                                                              ├── Architecture
                                                                              └── Health Report
```

---

## Design System

- **Background:** #050505 (near-black)
- **Glass surfaces:** rgba(255,255,255, 0.02–0.06) with backdrop-blur
- **Accent gradient:** #4F7CFF → #8B5CF6 (blue to purple)
- **Border radius:** Buttons 14px, Inputs 16px, Cards 24px
- **Typography:** Inter (body), Space Grotesk (headings), JetBrains Mono (code)
- **Animations:** Spring physics (stiffness 260, damping 28, mass 0.8)
- **No spinners** — skeletons, streaming text, and progressive reveal only

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## License

MIT

---

Built with AI. For engineers, by engineers.
