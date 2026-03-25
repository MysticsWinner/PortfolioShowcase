# Master Pipeline Architecture (CI/CD) ⚙️

Reliability and seamless deployment are core pillars of this application. This document details our bulletproof Continuous Integration (CI) pipeline powered by **GitHub Actions**.

---

## 🏗️ Overview

The repository is built as a highly interdependent **pnpm monorepo**. To ensure that all packages natively build without cross-contamination or dependency lock conflicts, our GitHub Action (`.github/workflows/main.yml`) processes the backend and frontend dynamically for every `Push` and `Pull Request` to `main` and `master`.

### Core Pipeline Sequence

1. **Checkout Repository**: Uses `actions/checkout@v4`.
2. **Environment Restitution (Node & pnpm)**: 
   - Forces **Node.js 20** injection via `actions/setup-node@v4`.
   - Injects **pnpm 10** natively via `pnpm/action-setup@v4`. This strictly honors our `pnpm@10.27.0` signature located in `package.json`.
3. **Workspace Installation**: Restores the `pnpm-lock.yaml` tree dynamically.
4. **Database Scaffolding Guard**: Runs `pnpm --filter backend exec prisma generate` safely ensuring strong TypeScript mapping inside isolated Ubuntu Actions runners.
5. **Backend Compilation & Testing**: Checks strict type compilations (NestJS) and executes the Jest suites securely.
6. **Frontend Static Prerendering (SSG)**: Orchestrates `next build` with dummy URL fallbacks to guarantee UI components correctly compile without breaking types.
7. **CI/CD Deployment Forks:**
   - **Frontend:** Handled completely externally natively by Vercel listening instantly to GitHub webhook pushes.
   - **Backend:** Actions runs a conditional curl POST to our `RENDER_DEPLOY_HOOK` GitHub Secret instantly signaling the Render Cloud instance to auto-rebuild.

---

## 🛠️ Modifying the Pipeline

To append new microservices or testing suites, natively update the configuration at `.github/workflows/main.yml`. Ensure you wrap your sequences with proper `pnpm --filter [workspace_name]` targeting logic to prevent leaking executions into isolated spaces.

[← Return to Master Plan](../Readme.md)
