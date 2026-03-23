<div align="center">
  <h1>🚀 Portfolio Showcase CMS (Monorepo Node)</h1>
  <p><b>A highly secure, full-stack Headless Presentation Engine & Telemetry Platform</b></p>
  <i>An elegantly architected ecosystem designed to seamlessly manage zero-latency portfolios, defend against unauthorized network access, and collect actionable visitor intelligence natively without 3rd-party bloat.</i>
  <br />
</div>

---

## 📑 Master Table of Contents

1. [🛑 Problem & Impact Statement](#-problem--impact-statement)
2. [🏗️ Architectural Topography](#-architectural-topography)
3. [⚡ Core Features](#-core-features)
4. [🛠️ Technology Ecosystem](#-technology-ecosystem)
5. [🖥️ Setup & Operations Guide](#-setup--operations-guide)
6. [📚 Dedicated Documentation Directory](#-dedicated-documentation-directory)

---

## 🛑 Problem & Impact Statement
Modern developers often rely on static templates to host their portfolios. These templates lack dynamic administration, fail to capture actionable visitor analytics natively without tracking scripts, and suffer from bloated bundle sizes. 

**The Solution:** This platform was engineered from the group up as a purely **Standalone Content Management System (CMS)** mapped natively to a **Dynamic Presentation Engine**. It securely isolates administrative operations via strict Role-Based Access Control (RBAC), tracks headless visitor analytics globally natively, and drastically optimizes render speeds utilizing **Redis caching** traversing **Next.js Server Components**.

### The Impact Metrics
- **< 10ms Latency**: `GET /projects` endpoints dynamically bypassed via `@nestjs/cache-manager` to eliminate Postgres row locks.
- **Zero Bundle Inflation**: Interactive WebGL components (`HeroCanvas`) globally injected via `next/dynamic` lazy loading, shedding all SSR rendering bottlenecks cleanly.
- **100% Application Hardening**: NestJS socket communications severely limited via strict `helmet` heuristics and `@nestjs/throttler` (100 req / minute).
- **Sub-1s Builds**: Turbopack & Tailwind gracefully combined with standard `pnpm run build` static compilations taking mere seconds natively.

---

## 🏗️ Architectural Topography

This project strictly follows a **Monorepo** convention managed entirely by **PNPM Workspaces** (`pnpm-workspace.yaml`). This ensures frictionless dependency extraction across domains without leaking binaries.

```bash
📂 PORTFOLIOSHOWCASE
 ┣ 📂 apps/
 ┃ ┣ 📂 backend/       # NestJS Telemetry Gateway API & Controllers
 ┃ ┗ 📂 frontend/      # Next.js 14 App Router Dynamic Platform
 ┣ 📂 docs/            # Comprehensive Implementation Manuals
 ┣ 📂 database/        # Seed Logic & Offline configurations
 ┣ 📂 infra/           # Infrastructure & Docker Scaffolding
 ┣ 📂 scripts/         # Environment Utility & Extractor Scripts
 ┣ 📂 tools/           # Peripheral Extensions (e.g. rust-cli)
 ┣ 📜 package.json     # Global execution registry
 ┣ 📜 pnpm-lock.yaml   # Verified v10 node bindings
 ┗ 📜 Makefile         # Global macro bindings
```

---

## ⚡ Core Features

- **CMS Command Center**: Secure generic `/dashboard/cms` routes allowing instant modifications to live Public Projects and Portfolios.
- **Global Command Palette**: Instant navigation indexing powered securely by `cmdk` node module using `Cmd + K`.
- **Dynamic PDF Rendering**: Convert HTML portfolio content automatically to aesthetically precise PDF snapshots executing off `@react-pdf/renderer` chunk pipelines.
- **Native Embedded Telemetry**: Evades standard blocking filters via a fully custom `AnalyticsProvider` React boundary reporting transparently into a private Prisma schema model.
- **Real-Time WebSockets**: Two-way interactive Live Chat bridging Next.js clients effortlessly to a highly sanitized NestJS Socket.io architecture.
- **Dynamic File Processing**: Accepts physical file payload blocks (doc, pdf) using authenticated interceptors protecting private files.

---

## 🛠️ Technology Ecosystem

**🌐 Client / Presentation (Frontend):**
- **Core:** Next.js 14 (App Router) & React 19
- **Aesthetics:** Tailwind CSS v4, Framer Motion, CmdK
- **WebGL Rendering:** React Three Fiber, Three.js, Drei

**⚙️ Server / Control Gateway (Backend):**
- **Core:** NestJS v11, TypeScript
- **State & Access Control:** Passport.js (JWT validation), Bcrypt, Express configurations
- **Integrations:** Socket.io, NodeMailer (SMTP), @nestjs/throttler (DDoS Protection)

**🗄️ Database & DevOps Lifecycle:**
- **ORM & Data Layer:** PostgreSQL mapped elegantly by Prisma Client
- **CI/CD Constraints:** GitHub Actions Pipeline
- **Orchestration:** Docker, Docker Compose, PM2 / Node Cluster Mode

---

## 🖥️ Setup & Operations Guide

### 1. Prerequisites
- **Node.js**: v20+ (Strict Requirement for Pipeline integrity)
- **PNPM**: `pnpm@10.27.0+`
- **PostgreSQL**: Running natively on local port `5432` OR executed via `docker-compose`.

### 2. Immediate Cloning & Installation
```bash
git clone https://github.com/your-username/portfolio-showcase.git
cd portfolio-showcase
pnpm install
```

### 3. Environment Variable Provisioning
Create two essential security profiles. 
*(Hint: Executing `./scripts/setup_env.sh` can partially accelerate this operation).*

**`apps/backend/.env`**:
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/showcase_db?schema=public"
JWT_SECRET="YOUR_SUPER_SECRET_KEY"
SMTP_HOST="smtp.provider.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-app-password"
```

**`apps/frontend/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Bootstrapping Database Architecture
Deploy the raw table layouts and compile the Prisma client definitions into `node_modules`.

```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

### 5. Running Monorepo Servers
Boot up the full topology using the singular universal launch command. This actively launches NestJS and Next.js utilizing `concurrently`.

```bash
# Deploys development environment
pnpm run start

# Compile fully to production format
make build
```
The Frontend binds natively to <a href="http://localhost:3000" target="_blank">`http://localhost:3000`</a> while the Backend engine runs silently on <a href="http://localhost:3001" target="_blank">`http://localhost:3001`</a>.

---

## 📚 Dedicated Documentation Directory

To maintain focus and conciseness, large operational complexities have been extracted and expanded into heavily detailed dedicated manual documents within the generic `docs/` partition. 

👉 **Always read these manuals before extensively modifying architecture logic:**

- **[🤖 CI/CD Pipeline Architecture](docs/ci-cd-pipeline.md):** Learn how our infallible automated GitHub Actions workflow strictly isolates backend compilation from Next.js Prerendering, handling TypeScript environment variables invisibly.
- **[🧪 Comprehensive Testing Matrix](docs/testing.md):** Instruction manuals on strictly typing Jest integrations, mocking Prisma services perfectly, and generating holistic UI snapshots safely.
- **[🧩 API Contracts](docs/api-contracts.md):** Data payloads and response body schematics mapping to the primary controllers.
- **[🔐 Authentication Flow](docs/auth-flow.md):** Detailed JWT interception and storage logic preventing XSS token lifting.
- **[🏰 Core Architecture Details](docs/architecture.md):** Breakdown of monorepo shared packages and boundary lines.
- **[🗺️ Future Roadmap](docs/roadmap.md):** Tracking upcoming integrations, extensions, and Phase 3 capabilities.

---
_Engineered purely for precision and high-performance availability._