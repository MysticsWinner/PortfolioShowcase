<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<h1 align="center">Portfolio Showcase Platform</h1>

<p align="center">
  A highly secure, full-stack monorepo application designed to seamlessly manage, encrypt, and present professional portfolios and developmental projects. Built with an unapologetic focus on modern aesthetics, rigorous authentication, and clean decoupled architecture.
</p>

---

## 🚀 About the Project

The **Portfolio Showcase Platform** is a monolithic repository developed to bridge the gap between elegant frontend presentation and highly restrictive backend data security. As a developing software engineer, this project served as a comprehensive testing ground to move beyond basic CRUD applications and dive deep into real-world production constraints—like cross-environment symmetric encryption, strict JSON Web Token Lifecycle management, and raw Next.js 14 hydration patterns.

### 🧠 What I Learned

Building this project was a massive leap forward in my understanding of professional system architectures. Key learning milestones include:

1. **Applied Cryptography (AES-256 at Rest)**
   - I successfully engineered a secure interception layer in the backend that symmetrically encrypts sensitive portfolio data natively in memory before it even touches the PostgreSQL database, and dynamically decrypts it upon authorized retrieval.
2. **Advanced Authentication & JWT Lifecycle (Passport.js)**
   - I mastered stateless authentication by replacing basic hardcoded checkpoints with the raw NestJS Passport JWT Strategy. My API intercepts `401 Unauthorized` responses on the frontend, autonomously shreds stale cache payloads in `localStorage`, and mitigates cyclic React layout loops gracefully.
3. **Database Adapter Resilience & Edge Isolation**
   - I diagnosed and resolved complex `PrismaClient` initialization failures related to Edge runtime execution by wiring `@prisma/adapter-pg` across the native `pg` Node drivers, natively expanding the framework's TCP isolation tolerance.
4. **React Hydration & External DOM Mutators**
   - I investigated and successfully mitigated critical `React Hydration Errors` triggered by browser extensions (like Grammarly) mutating the DOM mid-mount, securing the Next.js `layout.tsx` tree via strict `suppressHydrationWarning` flags.
5. **Aesthetic UI Engineering**
   - Built a sleek, premium dark-mode interface utilizing heavily tailored Tailwind CSS glassmorphisms (`backdrop-blur`) paired intricately with Framer Motion grid-layout staggered entrance animations.

---

## ✨ Core Features

- **Strict Route Protection:** Unauthenticated users are sandboxed globally via Next.js Layout hooks. Protected routes dynamically evaluate the presence of valid browser cache tokens.
- **AES-Encryption At-Rest:** Private portfolio documentation is scrambled natively via cryptographic primitives.
- **Global API Logging Middleware:** Custom NestJS HTTP middleware meticulously tags and tracks incoming payloads and routing durations.
- **Database User Strictness:** Passwords are mathematically hashed via `bcrypt` natively. The platform actively scans the PostgreSQL configuration matrix to ensure accounts strictly flag `isActive: true` before yielding API scopes.
- **Monorepo Workspaces:** Cleanly segregated `apps/frontend` and `apps/backend` layers strictly orchestrating data via REST networks without domain cross-contamination.

---

## 🛠️ Technology Stack

**Frontend Ecosystem**
- **Next.js 14 (App Router)** - React server-centric ecosystem
- **Tailwind CSS** - Rapid utility-first styling matrix
- **Framer Motion** - Cinematic layout transitioning
- **Axios** - Intercepted HTTP networking payload handler

**Backend Ecosystem**
- **NestJS 11** - Heavily opinionated, heavily structured Node.js API
- **Prisma ORM** - Synchronous PostgreSQL abstractions
- **Passport JWT** - Bearer token payload signature verification
- **Bcrypt & Node Crypto** - AES-256 and Password salting

---

## 📂 Repository Structure

```tree
📦 portfolio-showcase
 ┣ 📂 apps/
 ┃ ┣ 📂 backend/         # NestJS Root Directory
 ┃ ┃ ┣ 📂 prisma/        # PostgreSQL Schema & Migrations
 ┃ ┃ ┗ 📂 src/           # Core API modules (Auth, Projects, Portfolios)
 ┃ ┗ 📂 frontend/        # Next.js 14 Root Directory
 ┃   ┣ 📂 app/           # App Router Layouts & Pages
 ┃   ┣ 📂 components/    # Reusable Tailwind UI (Navbar, Cards)
 ┃   ┗ 📂 utils/         # Intercepted Axios API connectors
 ┣ 📜 package.json       # Monorepo Workspace Definitions
 ┗ 📜 pnpm-workspace.yaml
```

---

## ⚙️ Getting Started

### Prerequisites

You will need the following dependencies installed locally to boot the platform:
- `Node.js` (v18+)
- `pnpm` (Core workspace package manager)
- `PostgreSQL` (Live instance running locally on Port 5432)

### 1. Installation

Clone the repository and install all monorepo dependencies seamlessly from the root workspace:

```bash
git clone https://github.com/your-username/portfolio-showcase.git
cd portfolio-showcase
pnpm install
```

### 2. Environment Configurations

You must generate secure environment variable blocks for both the Backend and Frontend. 

**Backend (`apps/backend/.env`)**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/portfolio"
JWT_SECRET="generate_a_highly_secure_random_string_here"
PORT=3001
COOKIE_SECRET="generate_another_random_secret"
NODE_ENV="development"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef" # MUST be strictly 32 bytes for AES-256!
FRONTEND_URL="http://localhost:3000"
JWT_EXPIRES_IN="60m"
```

**Frontend (`apps/frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Database Synchronization

Migrate the Prisma schema to construct the live PostgreSQL tables automatically:

```bash
cd apps/backend
npx prisma db push
```

### 4. Booting the Matrix (Single Command)

You no longer need to manually manage multiple terminal tabs or worry about stale services. The monorepo has been engineered with a robust execution script that autonomously hunts down and slaughters any rogue instances occupying ports `3000` & `3001` before dynamically launching both workspaces concurrently into a clean log stream.

**From the Root Directory, simply run:**
```bash
npm start
# OR: pnpm start
```

Visit `http://localhost:3000` to interact with the frontend interface. The backend API is synchronously listening on port `3001`!

---

## 🔬 System Utilities & Logging Metrics

### The Database Demolition Script
If you ever need to completely wipe the system state and start fresh (destroying all test users, mocked portfolios, and compromised tokens), you can invoke the integrated reset utility.

```bash
cd apps/backend
npm run db:reset
```
*Note: Executing this will violently drop all Postgres tables, rebuild the strict schema, and seamlessly auto-seed the foundational `admin@example.com` Root Administrator account natively.*

### Asynchronous System Logs
The NestJS backend doesn't just print colorful analytics to your terminal. It utilizes a non-blocking asynchronous streaming middleware to permanently append all HTTP network traffic into a flat `.log` file natively alongside your code.
- Navigate to `apps/backend/system.log`
- Every `[GET]`, `[POST]`, and `[PATCH]`, including timestamps, IP origins, and millisecond durations, will be physically recorded there!

---

<p align="center">
  <i>"Writing code is easy. Architecting fault-tolerant, uncompromisingly secure infrastructure is the true milestone."</i>
</p>