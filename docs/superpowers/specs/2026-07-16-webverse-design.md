# WebVerse — The AI Engineering Brain

## Design Specification

**Date**: 2026-07-16
**Status**: Approved
**Tagline**: Understand Any Codebase in Minutes

---

## 1. Product Vision

WebVerse transforms any GitHub repository into a living Engineering Brain. Developers navigate understanding instead of code. The product should feel like the first release of a venture-backed AI startup — calm, confident, expensive, minimal.

**One sentence pitch**: WebVerse transforms any GitHub repository into a living engineering knowledge base that developers can understand, explore and interact with using AI.

**Differentiator**: ChatGPT answers questions. Copilot helps write code. WebVerse helps understand software — grounded in actual repository context.

---

## 2. Architecture

### Approach: Monolithic Next.js 15

Single Next.js 15 application deployed to Vercel.

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS 15 APP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PAGES (App Router)              API ROUTES                 │
│  /                               /api/auth/callback         │
│  /dashboard                      /api/github/repositories   │
│  /repo/[id]/analyze              /api/github/repository     │
│  /repo/[id]/brain                /api/intelligence/analyze  │
│  /repo/[id]/chat                 /api/chat                  │
│  /repo/[id]/architecture         /api/graph                 │
│  /repo/[id]/health               /api/health               │
│  /repo/[id]/report               /api/report               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    SERVICES LAYER                            │
│  github.service.ts     → GitHub REST API                    │
│  repository.service.ts → Repository loader                  │
│  analysis.service.ts   → Intelligence pipeline (OpenAI)     │
│  chat.service.ts       → Brain chat (context + streaming)   │
│  graph.service.ts      → Architecture node/edge builder     │
│  health.service.ts     → Engineering health analysis        │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                │
│  Supabase Auth         → GitHub OAuth sessions              │
│  Supabase Postgres     → repos, analyses, messages          │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, App Router, TypeScript |
| UI | React Server Components, Tailwind CSS, shadcn/ui (customized) |
| Animation | Framer Motion (app), GSAP + ScrollTrigger (landing), Three.js/R3F (hero) |
| Graph | React Flow |
| Code | Shiki (syntax highlighting), React Markdown |
| State | TanStack Query (server), Zustand (UI only) |
| Icons | Lucide |
| Auth | Supabase Auth (GitHub OAuth) |
| Database | Supabase Postgres |
| AI | OpenAI Responses API (GPT-4o, structured outputs, streaming) |
| Deploy | Vercel |

### Project Structure

```
src/
  app/                    # Next.js App Router pages
  components/             # Shared UI components (design system)
  features/              # Feature modules
    landing/
    dashboard/
    repository/
    intelligence/
    timeline/
    chat/
    architecture/
    health/
    report/
  hooks/                 # Custom React hooks
  lib/                   # Library configs (openai, github, supabase, constants)
  providers/             # Context providers
  services/              # Business logic services
  stores/                # Zustand stores (UI state only)
  types/                 # TypeScript types
  utils/                 # Utility functions
  styles/                # Global styles, tokens
  server/                # Server-only utilities
```

---

## 3. Database Schema

```sql
users (Supabase Auth managed)
  id, email, avatar_url, github_access_token, created_at

repositories
  id (uuid PK)
  user_id → users.id
  github_id (int)
  full_name (text)         -- "owner/repo"
  default_branch (text)
  language (text)
  stars (int)
  description (text)
  last_analyzed_at (timestamptz)
  created_at (timestamptz)

repository_analysis
  id (uuid PK)
  repository_id → repositories.id
  status (text)            -- pending | running | completed | failed
  phases (jsonb)           -- [{name, status, result, started_at, completed_at}]
  summary (text)
  tech_stack (jsonb)
  architecture_pattern (text)
  key_files (jsonb)
  knowledge_model (jsonb)  -- full structured repo understanding
  created_at (timestamptz)

chat_sessions
  id (uuid PK)
  analysis_id → repository_analysis.id
  created_at (timestamptz)

messages
  id (uuid PK)
  session_id → chat_sessions.id
  role (text)              -- user | assistant
  content (text)
  context_files (jsonb)
  confidence (text)        -- high | medium | low
  created_at (timestamptz)
```

---

## 4. Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| bg-primary | #050505 | Page background |
| bg-surface | #0B0B0D | Cards, panels |
| bg-glass | rgba(255,255,255,0.04) | Glass surfaces |
| border | rgba(255,255,255,0.08) | Card borders |
| text-primary | #FFFFFF | Headings |
| text-secondary | #A7A7B2 | Body |
| text-muted | #6F7282 | Labels |
| accent-blue | #4F7CFF | Primary actions |
| accent-purple | #8B5CF6 | AI/intelligence |
| accent-cyan | #22D3EE | Data/connections |
| success | #22C55E | Healthy |
| warning | #F59E0B | Attention |
| danger | #EF4444 | Critical |

### Typography

| Element | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| Hero title | Space Grotesk | 72px | 700 | -0.04em |
| Section title | Space Grotesk | 48px | 600 | -0.03em |
| Dashboard title | Inter | 32px | 600 | -0.02em |
| Card title | Inter | 20px | 600 | normal |
| Body | Inter | 16px | 400 | normal |
| Small/labels | Inter | 13px | 500 | 0.01em |
| Code | JetBrains Mono | 14px | 400 | normal |

### Spacing & Radii

- Base unit: 8px
- Max widths: 1440px (page), 1280px (dashboard), 1200px (hero content)
- Radii: Buttons 14px, Inputs 16px, Cards 24px, Dialogs 28px

### Glassmorphism

- backdrop-filter: blur(12px)
- background: rgba(255,255,255,0.04)
- border: 1px solid rgba(255,255,255,0.08)
- Used sparingly on cards, modals, command palette

### Gradients

- Hero: Blue → Purple → Cyan (soft radial, aurora-style)
- Primary CTA: Blue → Purple gradient with soft glow
- Background: Floating blurred light blobs, moving gradient mesh

---

## 5. Motion System

### Libraries by Context

| Context | Library | Scope |
|---------|---------|-------|
| App UI | Framer Motion | All dashboard interactions |
| Landing scroll | GSAP + ScrollTrigger | Pinned sections, reveals |
| Hero 3D | Three.js (React Three Fiber) | Landing hero only |

### Spring Configurations

| Tier | Stiffness | Damping | Mass | Use |
|------|-----------|---------|------|-----|
| Fast | 400 | 30 | 0.6 | Buttons |
| Medium | 260 | 28 | 0.8 | Cards (default) |
| Gentle | 180 | 24 | 1.0 | Dialogs, modals |
| Elegant | 120 | 20 | 1.2 | Hero, page transitions |

### Reusable Presets

fadeUp, fadeDown, fadeLeft, fadeRight, scaleIn, cardReveal, pageTransition, sharedLayout, listStagger, modalReveal, commandPalette, tooltip, hoverLift, buttonPress

### Preferred Transforms

opacity, translate, scale, blur, layout — NO rotation, bounce, random movement

### Reduced Motion

Respect `prefers-reduced-motion`. Replace all movement with opacity-only.

---

## 6. AI Pipeline (Repository Intelligence Engine)

### Ingestion Phases (streamed via SSE)

| Phase | Action | AI? | Output |
|-------|--------|-----|--------|
| 1. Read Repository | GitHub API: tree, README, configs | No | File tree, key files |
| 2. Detect Framework | GPT-4o structured output | Yes | {frameworks, languages, runtime, styling} |
| 3. Find Architecture | GPT-4o structured output | Yes | {pattern, layers, boundaries, entry_points} |
| 4. Map Dependencies | GPT-4o structured output | Yes | {nodes[], edges[]} for React Flow |
| 5. Analyze Health | GPT-4o structured output | Yes | {score, categories[], findings[]} |
| 6. Generate Brain | GPT-4o synthesis | Yes | {summary, key_insights, suggested_questions} |

### File Selection Heuristic

Fetch up to ~20 key files (≤80K tokens total):
1. README.md
2. Package manifest (package.json, Cargo.toml, go.mod, etc.)
3. Root configs (tsconfig, next.config, vite.config, etc.)
4. Entry points (src/index.*, src/app.*, src/main.*)
5. Route/page directories (first 10 files)
6. High-import-count files (inferred from naming)

### SSE Protocol

```
event: phase_start   → { phase, index }
event: phase_progress → { phase, message }
event: phase_complete → { phase, result }
event: analysis_complete → { analysis_id, redirect }
```

### Chat Question Pipeline

```
Question → Intent Detection → Relevant Files/Summaries → 
Repository Context Assembly → OpenAI Responses API → Streaming Answer
```

### Answer Format

Summary → Explanation → Relevant Files → Architecture References → Dependencies → Suggested Next Questions

### Confidence Levels

Every response includes High/Medium/Low confidence. Low confidence explains why and suggests files to inspect.

---

## 7. Screen Architecture

### User Journey

Landing → GitHub Login → Repository Selection → Intelligence Timeline → Mission Control → Chat / Architecture / Health / Report

### Screen Details

**Landing (/)**: GSAP scroll storytelling, Three.js hero (dark space, repo cube, particles, bloom, parallax). 7 pinned sections.

**Auth**: Centered glass card, animated GitHub icon, single "Connect GitHub" button.

**Repository Selection (/dashboard)**: Search + filter, repo cards with language dots, stars, hover glow/scale.

**Intelligence Timeline (/repo/[id]/analyze)**: Full-screen dark, phases stagger in with springs, active phase pulses, completed phases lock with checkmark draw + glow. On completion: compress → morph to sidebar → reveal Mission Control.

**Mission Control (/repo/[id]/brain)**: 4-zone OS-like layout:
- Top: repo name, branch, framework, status
- Center: Engineering Brain summary, knowledge graph preview, architecture
- Left: persistent timeline, recent discoveries
- Right: AI suggestions, insights, warnings
- Bottom: Command bar ("Ask anything...")

**Chat (/repo/[id]/chat)**: Command palette-style input. Streaming responses with file chips, architecture refs. Action buttons: Open File, View Graph, Explain Further. "Thinking" indicators before streaming.

**Architecture (/repo/[id]/architecture)**: React Flow, layered zoom (high-level → expand nodes). Custom nodes by type, animated edges, glow on selection, side panel on click.

**Health/Report (/repo/[id]/health)**: Engineering Maturity label (not just score). Categories: Architecture, Maintainability, Security, Documentation, Performance, Testing. Sections: Strengths, Risks, Quick Wins, Technical Debt.

### Navigation

- Linear flow for first-time (no nav visible)
- After analysis: 56px icon-only sidebar (Brain, Chat, Architecture, Health)
- Command Palette (Cmd+K) globally: navigation + search + AI questions

---

## 8. Component Requirements

Every component must have: hover, focus, pressed, disabled, loading, success, error, transition animation, keyboard accessibility, dark theme, mobile support.

### Key Components

- **Buttons**: Primary (gradient + glow), Secondary (glass), Ghost (underline). Spring hover, press scale 0.97, magnetic attraction.
- **Inputs**: Rounded, glass bg, glow on focus. Search = Raycast-style.
- **Command Palette**: Cmd+K. Navigation + search + AI. Fade + scale + blur backdrop. Individual result animation.
- **Cards**: Glass, rounded-24, hover lift + glow. Tell stories, not display widgets.
- **Timeline**: Stagger, lock, glow. Persistent after analysis.
- **Code Blocks**: Shiki, dark, copy button, language badge, file path, line numbers.
- **Health Indicators**: Custom SVG + Framer Motion. Animated radial rings, sparklines, capsules. NO Recharts.
- **Architecture Graph**: React Flow, custom nodes, animated edges, minimap, search, expand.

---

## 9. Implementation Plan (48 Hours)

### Day 1 (11 hours)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Project Setup | 2h | Next.js, Tailwind, shadcn, fonts, Supabase, providers |
| 2. Design System | 2h | Tokens, buttons, cards, inputs, sidebar, command bar, motion presets |
| 3. Landing Page | 4h | Hero (Three.js), GSAP scroll, feature sections, CTA |
| 4. Authentication | 1h | GitHub OAuth via Supabase, login screen |
| 5. Repo Selection | 2h | Cards, search, hover effects, metadata |

### Day 2 (15 hours)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 6. Intelligence Engine | 5h | Loader, timeline UI, framework detection, SSE streaming |
| 7. Mission Control | 3h | 4-zone layout, summary, health preview, graph preview |
| 8. Brain Chat | 3h | Streaming, context, suggested Qs, markdown, code highlighting |
| 9. Architecture | 2h | React Flow, animated graph, expandable nodes, layers |
| 10. Engineering Report | 2h | Executive summary, strengths, risks, debt, quick wins |
| 11. Polish | remaining | Microinteractions, loading states, empty states, responsive, deploy |

### Priority

P0: Landing, Timeline, Mission Control, Chat, Graph, Health
P1: Engineering Report, Impact Analysis
P2: Everything else (cut if time runs out)

---

## 10. Demo Strategy

**Duration**: 3:20 max

**Narrative**: "Understanding Software"

**Flow**:
0:00 Problem → 0:15 Landing → 0:35 Auth → 0:45 Repo Select → 1:00 Intelligence Timeline (emotional peak, let it breathe) → 1:45 Mission Control → 2:10 Brain Chat ("Explain authentication" → "What if I remove AuthService?") → 2:40 Architecture → 3:00 Report → 3:20 Close

**Key line**: "Developers don't need another chatbot. They need understanding."

---

## 11. Submission Package

- Professional README (hero, problem, solution, features, demo GIF, architecture, tech stack, install, env vars, roadmap)
- 3-min demo video
- Clean commits, no generated junk
- Screenshots of every screen
- Future roadmap: Repo Memory, Team Knowledge, PR Intelligence, Multi-Repo Brain, VS Code Extension
