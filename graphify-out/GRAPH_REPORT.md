# Graph Report - PortfolioShowcase  (2026-10-24)

## Corpus Check
- 136 files · ~47,916 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .prisma 1, .css 1)

## Summary
- 954 nodes · 1490 edges · 76 communities (53 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b0ccc21`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AuthProvider.tsx
- reset-db.js
- ⚡ 20 Functional Requirements (FR)
- backend/package.json
- ProjectsService
- package.json
- devDependencies
- admin.controller.ts
- dependencies
- PortfoliosService
- frontend/package.json
- compilerOptions
- resumeParser.ts
- auth.module.ts
- compilerOptions
- @nestjs/common
- devDependencies
- declarations.d.ts
- AppService
- scripts
- api.ts
- dependencies
- PrismaService
- react
- next
- app/blog/page.tsx
- shared/package.json
- backend/README.md
- app.module.ts
- jest.config.ts
- jest
- ChatGateway
- ⚡ Core Upgraded Capabilities
- Readme.md
- Comprehensive Testing Strategy 🧪
- nest-cli.json
- 🛡️ 20 Non-Functional Requirements (NFR)
- scripts
- 5. Render Cold-Start Failsafes & Production Resilience
- 🗺️ Master Strategic Roadmap
- 🖥️ Setup & Operations Guide
- backend/eslint.config.mjs
- route.tsx
- Master Pipeline Architecture (CI/CD) ⚙️
- seed_db.py
- session-heartbeat-and-cold-start-resilience.md
- tsconfig.build.json
- frontend/eslint.config.mjs
- frontend/README.md
- newsletter.module.ts
- understanding-rsc.md
- backup.service.ts
- dashboard/projects/page.tsx
- RolesGuard
- postcss.config.mjs
- setup_env.sh
- rust-cli
- ContactService
- verify/page.tsx
- portfolios/page.tsx
- main.ts
- HeroCanvas
- @testing-library/jest-dom
- Rules for Agents
- portfolios.controller.ts
- zero-compute-client-side-ocr.md
- chat.gateway.ts

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 44 edges
2. `react` - 33 edges
3. `next` - 29 edges
4. `PrismaService` - 26 edges
5. `compilerOptions` - 22 edges
6. `⚡ 20 Functional Requirements (FR)` - 21 edges
7. `ProjectsService` - 19 edges
8. `useAuth()` - 19 edges
9. `framer-motion` - 19 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `🔮 Suggested Planned Features (Architecture)` --references--> `AnalyticsService`  [INFERRED]
  docs/architecture.md → apps/backend/src/modules/analytics/analytics.service.ts
- `FR-12: Headless Native Visitor Analytics & Telemetry Tracking` --references--> `AnalyticsProvider()`  [INFERRED]
  docs/requirements.md → apps/frontend/components/AnalyticsProvider.tsx
- `⚡ Core Features` --references--> `AnalyticsProvider()`  [INFERRED]
  Readme.md → apps/frontend/components/AnalyticsProvider.tsx
- `2. Multi-Tab Session Synchronization` --references--> `AuthProvider()`  [INFERRED]
  docs/auth-flow.md → apps/frontend/components/AuthProvider.tsx
- `1. Early Background Warm-Up Probe` --references--> `AuthProvider()`  [INFERRED]
  docs/deployment.md → apps/frontend/components/AuthProvider.tsx

## Import Cycles
- None detected.

## Communities (76 total, 23 thin omitted)

### Community 0 - "AuthProvider.tsx"
Cohesion: 0.15
Nodes (17): LoginForm(), LoginPage(), DashboardLayout(), ChatMessage, MessagesPage(), DashboardPage(), SettingsPage(), AdminSidebar() (+9 more)

### Community 1 - "reset-db.js"
Cohesion: 0.11
Nodes (14): { Pool }, { PrismaClient }, { PrismaPg }, bcrypt, { execSync }, { Pool }, { PrismaClient }, { PrismaPg } (+6 more)

### Community 2 - "⚡ 20 Functional Requirements (FR)"
Cohesion: 0.10
Nodes (21): ContactMessage, ⚡ 20 Functional Requirements (FR), FR-01: Multi-Factor & OTP Email Account Verification, FR-02: Self-Healing Profile Re-hydration & Session Heartbeat (`GET /auth/me`), FR-03: Stateful Remember-Me Session Retention & Cross-Tab State Sync, FR-04: Graceful Post-Authentication Return URL Redirection, FR-05: Dynamic User Identity, Status & Avatar Presentation, FR-06: Role-Based Access Control (RBAC) Hierarchical Route & Component Isolation (+13 more)

### Community 3 - "backend/package.json"
Cohesion: 0.05
Nodes (41): author, description, eslint, jest, passport, passport-jwt, prisma, ts-node (+33 more)

### Community 4 - "ProjectsService"
Cohesion: 0.11
Nodes (6): ProjectsController, ProjectsService, 1. The UX Rule: Show How Projects Are Graded FIRST, Then Show Scores, 2. Server-Side Health Probing with Graceful Fallbacks, 3. The Interactive Rubric Customizer, What's Next?

### Community 5 - "package.json"
Cohesion: 0.07
Nodes (28): api, author, dependencies, axios, framer-motion, @nestjs/jwt, passport, passport-jwt (+20 more)

### Community 6 - "devDependencies"
Cohesion: 0.07
Nodes (30): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+22 more)

### Community 7 - "admin.controller.ts"
Cohesion: 0.14
Nodes (4): AdminController, AdminModule, AdminService, Roles()

### Community 8 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, bcrypt, cache-manager, cookie-parser, helmet, multer, @nestjs/cache-manager, @nestjs/common (+18 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.08
Nodes (24): eslint, jest, tailwindcss, ts-node, @types/jest, @types/node, typescript, name (+16 more)

### Community 11 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+14 more)

### Community 12 - "resumeParser.ts"
Cohesion: 0.24
Nodes (7): ProjectReviewMatrixProps, CandidateProject, COMMON_TECH_DICTIONARY, extractFallbackProjects(), extractProjectsFromChunk(), extractTechnologies(), ParseResult

### Community 13 - "auth.module.ts"
Cohesion: 0.07
Nodes (10): AuthController, AuthModule, AuthService, JwtStrategy, MailModule, MailService, UsersService, bcrypt (+2 more)

### Community 14 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 15 - "@nestjs/common"
Cohesion: 0.18
Nodes (4): AnalyticsController, AnalyticsModule, AnalyticsService, @nestjs/common

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, eslint-config-next, jest, jest-environment-jsdom, tailwindcss, @tailwindcss/postcss, @testing-library/dom (+8 more)

### Community 18 - "AppService"
Cohesion: 0.19
Nodes (4): AppController, AppService, HealthResponse, HostingInfo

### Community 19 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, db:reset, format, lint, start, start:debug, start:dev (+6 more)

### Community 20 - "api.ts"
Cohesion: 0.13
Nodes (16): BackendWarmupBanner(), adminApi, API_URL, apiClient, BackendState, BackendStatus, currentBackendState, getFrontendHostInfo() (+8 more)

### Community 21 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, cmdk, gray-matter, lucide-react, maath, next, pdfjs-dist, react (+7 more)

### Community 22 - "PrismaService"
Cohesion: 0.17
Nodes (5): DEFAULT_RUBRIC, RubricConfig, UsersModule, PrismaService, @prisma/client

### Community 23 - "react"
Cohesion: 0.19
Nodes (7): NewPortfolioPage(), HeroCanvas, LandingPage(), CreatePortfolioForm(), CreatePortfolioFormProps, framer-motion, react

### Community 24 - "next"
Cohesion: 0.14
Nodes (11): metadata, RootLayout(), config, AnalyticsProvider(), CommandPalette(), Footer(), LiveChatWidget(), Navbar() (+3 more)

### Community 25 - "app/blog/page.tsx"
Cohesion: 0.09
Nodes (23): DELETE(), GET(), getBlogDir(), POST(), BlogPage(), getPostMetadata(), PostMetadata, BlogPost() (+15 more)

### Community 26 - "shared/package.json"
Cohesion: 0.18
Nodes (10): author, description, keywords, license, main, name, packageManager, scripts (+2 more)

### Community 27 - "backend/README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 28 - "app.module.ts"
Cohesion: 0.15
Nodes (6): AppModule, ChatModule, PortfoliosModule, ProjectsModule, PrismaModule, @nestjs/testing

### Community 30 - "jest"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 31 - "ChatGateway"
Cohesion: 0.14
Nodes (5): ChatGateway, 1. Bidirectional WebSocket Gateway in NestJS, 2. The Unified Communications Center (`/dashboard/messages`), 3. High-Performance 3D Visuals Without Battery Drain, What’s Ahead

### Community 32 - "⚡ Core Upgraded Capabilities"
Cohesion: 0.33
Nodes (6): 1. Self-Healing Profile Re-hydration (`GET /auth/me`), 2. Multi-Tab Session Synchronization, 3. Stateful Remember-Me Persistence, 4. Post-Authentication Return URL Retention, 5. Unverified Account Interception & Resend OTP Recovery Flow, ⚡ Core Upgraded Capabilities

### Community 33 - "Readme.md"
Cohesion: 0.20
Nodes (8): 🔐 Authentication Flow, Session Retention & Cryptography, 🔮 Suggested Planned Features (Authentication Security), 🛡️ Upgraded Authentication Architecture, 🏗️ Architectural Topography, ⚡ Core Features, 📚 Dedicated Documentation Directory, 📑 Master Table of Contents, 🛠️ Technology Ecosystem

### Community 34 - "Comprehensive Testing Strategy 🧪"
Cohesion: 0.29
Nodes (6): Comprehensive Testing Strategy 🧪, 📊 Coverage Guidelines, Mocking Specificity (Prisma), 💻 NestJS Backend Execution, 🎨 Next.js Frontend Execution, Next.js Node Assertions

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "🛡️ 20 Non-Functional Requirements (NFR)"
Cohesion: 0.22
Nodes (9): 🛡️ 20 Non-Functional Requirements (NFR), 🎯 Architectural Overview, 📋 Comprehensive Requirements Specification Matrix, Maintainability & Open Source (MAINT), Performance & Latency (PERF), Reliability & Availability (REL), Scalability (SCAL), Security (SEC) (+1 more)

### Community 37 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, test

### Community 38 - "5. Render Cold-Start Failsafes & Production Resilience"
Cohesion: 0.22
Nodes (9): 1. Database Provisioning (Neon), 1. Early Background Warm-Up Probe, 2. Backend Deployment (Render), 2. Cold-Start Detection & Exponential Backoff, 3. Frontend Deployment (Vercel), 3. User-Facing Diagnostics & Feedback (`BackendWarmupBanner`), 4. Hosting Environment Introspection, 5. Render Cold-Start Failsafes & Production Resilience (+1 more)

### Community 39 - "🗺️ Master Strategic Roadmap"
Cohesion: 0.33
Nodes (5): Category: Artificial Intelligence 🤖, Category: Platform Tooling & Expansion 🚀, ✅ Current Execution State (Phases 1 & 2), 🗺️ Master Strategic Roadmap, 🔮 Phase 3 Suggested Planned Features (Future Horizon)

### Community 41 - "🖥️ Setup & Operations Guide"
Cohesion: 0.33
Nodes (6): 1. Prerequisites, 2. Immediate Cloning & Installation, 3. Environment Variable Provisioning, 4. Bootstrapping Database Architecture, 5. Running Monorepo Servers, 🖥️ Setup & Operations Guide

### Community 42 - "backend/eslint.config.mjs"
Cohesion: 0.40
Nodes (4): @eslint/js, eslint-plugin-prettier, globals, typescript-eslint

### Community 43 - "route.tsx"
Cohesion: 0.50
Nodes (4): GET(), ResumeDocument(), styles, @react-pdf/renderer

### Community 44 - "Master Pipeline Architecture (CI/CD) ⚙️"
Cohesion: 0.40
Nodes (4): Core Pipeline Sequence, Master Pipeline Architecture (CI/CD) ⚙️, 🛠️ Modifying the Pipeline, 🏗️ Overview

### Community 47 - "session-heartbeat-and-cold-start-resilience.md"
Cohesion: 0.25
Nodes (7): 1. The Anatomy of a Zombie Session, 2. Active Verification on Every Activity, 3. Surviving 50-Second Cloud Cold Starts, Layer A: Extended 75-Second Axios Timeout, Layer B: Proactive Non-Blocking Wake-Up Ping, Layer C: Visual Spin-Up Notification, Summary

### Community 48 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 50 - "frontend/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "newsletter.module.ts"
Cohesion: 0.19
Nodes (3): NewsletterController, NewsletterModule, NewsletterService

### Community 55 - "dashboard/projects/page.tsx"
Cohesion: 0.14
Nodes (12): BlogPostItem, PRESET_TAGS, DEFAULT_RUBRIC, RubricConfig, ProjectsPage(), ResumeImportModal(), ResumeImportModalProps, Project (+4 more)

### Community 66 - "ContactService"
Cohesion: 0.11
Nodes (3): ContactController, ContactModule, ContactService

### Community 67 - "verify/page.tsx"
Cohesion: 0.40
Nodes (3): VerifyOTPContent(), VerifyOTPPage(), authApi

### Community 68 - "portfolios/page.tsx"
Cohesion: 0.48
Nodes (5): PortfoliosPage(), PortfolioCard(), PortfolioCardProps, Portfolio, portfolioApi

### Community 70 - "HeroCanvas"
Cohesion: 0.20
Nodes (9): HeroCanvas(), 1. Production Infrastructure Matrix, 3. Next.js Frontend Philosophy, 🧭 Current State Architecture, 🏗️ Master Architectural Topography & System Design, 🔮 Suggested Planned Features (Architecture), FR-19: Dynamic Interactive WebGL Canvas with Device-Adaptive Performance, 🛑 Problem & Impact Statement (+1 more)

### Community 72 - "Rules for Agents"
Cohesion: 0.33
Nodes (5): 1. Graph-First Architecture Exploration, 2. Selective & Minimal I/O, 3. Graph Synchronization, Agent Performance & Token Optimization Guidelines, Rules for Agents

### Community 74 - "portfolios.controller.ts"
Cohesion: 0.17
Nodes (5): LoggerMiddleware, JwtAuthGuard, multerConfig, multer, @nestjs/cache-manager

### Community 75 - "zero-compute-client-side-ocr.md"
Cohesion: 0.33
Nodes (5): 1. The Core Philosophy: Moving Compute to the Edge (Literally), 2. In-Browser Document Decompilation, 3. Heuristic Segmentation: From Raw Text to Verified Projects, 4. The Multi-Project Review Matrix: Mandatory Approval to Publish, The Verdict

## Knowledge Gaps
- **55 isolated node(s):** `@nestjs/platform-socket.io`, `@types/nodemailer`, `cache-manager`, `passport`, `passport-jwt` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 508 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `ContactService`, `backend/package.json`, `admin.controller.ts`, `portfolios.controller.ts`, `chat.gateway.ts`, `auth.module.ts`, `AppService`, `newsletter.module.ts`, `backup.service.ts`, `PrismaService`, `app.module.ts`, `RolesGuard`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **What connects `@nestjs/platform-socket.io`, `@types/nodemailer`, `cache-manager` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthProvider.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `AuthProvider.tsx`, `verify/page.tsx`, `portfolios/page.tsx`, `frontend/package.json`, `route.tsx`, `react`, `dashboard/projects/page.tsx`, `app/blog/page.tsx`, `jest.config.ts`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `reset-db.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `AuthProvider.tsx`, `verify/page.tsx`, `portfolios/page.tsx`, `frontend/package.json`, `resumeParser.ts`, `api.ts`, `dashboard/projects/page.tsx`, `next`, `app/blog/page.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `⚡ 20 Functional Requirements (FR)` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._