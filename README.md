<div align="center">

# 🧠 WebVerse — The AI Engineering Brain

### Turn any GitHub repository into a living, queryable engineering knowledge base.

Point WebVerse at a repo and it maps the **architecture**, extracts **dependencies**, detects **design patterns**, scores **engineering health**, and then lets you **chat with the codebase** — every answer grounded in the repo's real source, streamed live.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)
![OpenAI](https://img.shields.io/badge/GPT--4o-structured_outputs-412991?logo=openai&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_+_Postgres-3ecf8e?logo=supabase&logoColor=white)
![Build](https://img.shields.io/badge/build-passing-22c55e)
![License](https://img.shields.io/badge/license-MIT-6b7280)

</div>

---

## 💡 Why WebVerse

Onboarding onto an unfamiliar codebase is slow and lonely. READMEs go stale, architecture lives in someone's head, and "how does auth work here?" costs an afternoon.

**WebVerse compresses that to minutes.** It reads the *actual* repository — file tree, manifests, and source — and produces an evidence-grounded engineering brain you can interrogate in plain English. No hand-written docs. No guessing. Just your code, understood.

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 🔍 | **Evidence-grounded AI analysis** | GPT-4o with **strict structured outputs** turns the real file tree + source into a typed analysis. It's told to cite only files it can see — never to invent frameworks. |
| 🕸️ | **Interactive architecture graph** | A React Flow canvas of modules, services, databases and their relationships, grouped into layers. |
| 💬 | **Engineering Brain chat** | Ask anything; answers quote **actual source excerpts and file paths**, streamed token-by-token over SSE. |
| 🩺 | **Health report** | Rubric-based scoring across Structure, Type Safety, Testing, Security, Docs & Dependencies with severity-rated findings. |
| 📦 | **Deterministic dependency graph** | Dependencies are parsed **directly from manifests** (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pyproject.toml`) — exact names & versions, not LLM guesses. |
| ⏱️ | **Live intelligence timeline** | A cinematic, phase-by-phase progress UI driven by the real analysis stream. |
| 💾 | **Persistent knowledge base** | Analyses are saved to Postgres (per-user, RLS-protected) and rehydrate on refresh — and are cached to avoid re-billing. |
| 🎨 | **Premium UI** | Dark glassmorphism, Framer Motion spring physics, a GSAP landing page, and a 3D architecture view. No spinners — only skeletons and streaming. |

---

## 🧬 How the analysis engine works

```
POST /api/analyze  ──▶  Server-Sent Events stream
   │
   ├─ ①  Validate owner/repo · authorize (getUser) · rate-limit · check cache
   ├─ ②  Structure   → default branch + recursive file tree (reports truncation)
   ├─ ③  Architecture → fetch key files (manifests, README, configs, source)
   ├─ ④  Dependencies → parse manifests deterministically  ← source of truth
   ├─ ⑤  Patterns / Health → signals collected for scoring
   └─ ⑥  Synthesis   → GPT-4o (json_schema, strict) → typed AnalysisResults
                        │
                        ├─ merge authoritative deps over model output
                        ├─ persist to Supabase (per-user, cached)
                        └─ stream `complete` event → UI
```

**What makes the output accurate** (the hard part of this problem):

1. **Strict structured outputs** — the model must return JSON matching a strict `json_schema`. The *shape* is guaranteed by the API, so downstream views never break on malformed responses.
2. **Anti-hallucination prompt** — an evidence-only system prompt (`src/lib/analysis-prompt.ts`): cite real paths, never invent frameworks, describe *this* repo, follow a concrete health rubric, run at temperature `0.1`.
3. **Deterministic ground truth** — dependency names/versions come from a real manifest parser and are **merged over** the model's output, so they're correct regardless of the LLM.
4. **Injection-safe** — repository content is fenced as untrusted data the model must analyze but never obey, and chat context is rebuilt **server-side from the trusted database** rather than trusting the client.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 15** (App Router, Turbopack) · React 19 |
| Language | **TypeScript** (strict) — typechecks clean |
| AI | **OpenAI GPT-4o** — streaming chat + strict structured-output analysis |
| Auth | **Supabase Auth** (GitHub OAuth, least-privilege scopes) |
| Data | **Supabase Postgres** with Row-Level Security |
| Graph | **React Flow** (`@xyflow/react`) + Three.js 3D view |
| State | **Zustand** (client) · TanStack Query (server cache) |
| Styling | **Tailwind CSS 3.4** + custom design tokens |
| Motion | **Framer Motion** (app) + **GSAP** (landing) + Lenis smooth scroll |
| Fonts | Inter · Space Grotesk · JetBrains Mono |

---

## 🔐 Engineering & security highlights

Built with a production mindset, not just a demo:

- **Row-Level Security** — every analysis is scoped to its owner; users can only ever read their own data.
- **`getUser()` everywhere** — server authorization revalidates the auth token (not the spoofable `getSession()`).
- **Rate limiting** — the expensive AI endpoints are throttled per user (analyze 8/5min, chat 30/min) to prevent cost abuse.
- **Input validation** — `owner`/`repo` are pattern-validated and every GitHub path segment is URL-encoded.
- **Least-privilege OAuth** — defaults to `public_repo read:user`; private access is opt-in via env.
- **Security headers** — HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **CI** — typecheck, lint, `npm audit`, and build run on every push (`.github/workflows/ci.yml`).

> 📋 A full self-review of the codebase — findings, severities, and remediation — lives in **[`docs/REPOSITORY_REVIEW.md`](docs/REPOSITORY_REVIEW.md)**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project · an [OpenAI](https://platform.openai.com) API key · a GitHub OAuth app

### 1 · Install
```bash
npm install
```

### 2 · Environment
```bash
cp .env.local.example .env.local
```
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials |
| `GITHUB_OAUTH_SCOPES` | *(optional)* set to `repo read:user` to analyze **private** repos |

### 3 · Database
Run the migration in the Supabase **SQL Editor** (creates the RLS-protected `analyses` table):
```
supabase/migrations/0001_init.sql
```

### 4 · Supabase Auth
Authentication → Providers → enable **GitHub**, add your OAuth credentials, and set the callback URL to `http://localhost:3000/auth/callback`.

### 5 · Run
```bash
npm run dev
```
Open **http://localhost:3000**.

---

## 🗺️ User Flow

```
Landing → GitHub Login → Select Repo → Intelligence Timeline → Engineering Brain
                                                                    ├── 📊 Overview
                                                                    ├── 💬 Chat
                                                                    ├── 🕸️ Architecture
                                                                    └── 🩺 Health
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                          # GSAP landing page
│   ├── dashboard/page.tsx                # Repository selection grid
│   ├── analyze/[owner]/[repo]/page.tsx   # Intelligence timeline (SSE)
│   ├── brain/[owner]/[repo]/             # Overview · Chat · Architecture · Health
│   ├── api/
│   │   ├── analyze/route.ts              # Analysis SSE pipeline (validate→cache→AI→persist)
│   │   ├── chat/route.ts                 # Streaming chat (server-side trusted context)
│   │   ├── analysis/[owner]/[repo]/route.ts  # Rehydrate persisted analysis
│   │   └── github/repos/route.ts         # List the user's repositories
│   └── auth/                             # GitHub OAuth: login · callback · logout
├── lib/
│   ├── analysis-prompt.ts                # ⭐ System prompt + strict JSON schema
│   ├── dependencies.ts                   # ⭐ Deterministic manifest parser
│   ├── validation.ts                     # owner/repo input validation
│   ├── rate-limit.ts                     # Per-user sliding-window limiter
│   ├── github.ts                         # GitHub REST helpers (URL-safe)
│   ├── github-token.ts                   # Token resolution (getUser-guarded)
│   ├── openai.ts                         # OpenAI client
│   └── supabase/
│       ├── client.ts · server.ts · middleware.ts
│       └── analyses.ts                   # ⭐ Persist / load analyses (RLS)
├── stores/                               # Zustand: ui-store · analysis-store
└── middleware.ts                         # Auth guard
supabase/migrations/0001_init.sql          # analyses table + RLS policies
.github/workflows/ci.yml                   # typecheck · lint · audit · build
```

---

## 🎨 Design System

- **Canvas:** `#050505` near-black · glass surfaces `rgba(255,255,255,0.02–0.06)` + backdrop-blur
- **Accent gradient:** `#4F7CFF → #8B5CF6`
- **Radii:** buttons 14px · inputs 16px · cards 24px
- **Type:** Inter (body) · Space Grotesk (headings) · JetBrains Mono (code)
- **Motion:** spring physics (stiffness 260, damping 28) — no spinners, ever

---

## 📜 Scripts

```bash
npm run dev       # Dev server (Turbopack)
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```

---

## 🧭 Roadmap

- [ ] Shareable public analysis links
- [ ] Incremental re-analysis on new commits (webhooks)
- [ ] Multi-repo / monorepo-aware analysis
- [ ] Distributed rate limiting (Upstash) for multi-instance deploys
- [ ] Inline citations that deep-link to GitHub line ranges

---

<div align="center">

**Built with AI. For engineers, by engineers.** · MIT License

</div>
