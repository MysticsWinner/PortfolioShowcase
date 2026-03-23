# Master Pipeline Architecture (CI/CD) ⚙️

Reliability and seamless deployment are core pillars of this application. This document details our bulletproof Continuous Integration (CI) pipeline powered by **GitHub Actions**.

---

## 🏗️ Overview

The repository is built as a highly interdependent **pnpm monorepo**. To ensure that all packages natively build without cross-contamination or dependency lock conflicts, our GitHub Action (`.github/workflows/main.yml`) processes the backend and frontend dynamically for every `Push` and `Pull Request` to `main` and `master`.

### Core Pipeline Sequence

1. **Checkout Repository**: Uses `actions/checkout@v4`.
2. **Environment Restitution (Node & pnpm)**: 
   - Forces **Node.js 20** injection via `actions/setup-node@v4`.
   - Injects **pnpm 10** natively via `pnpm/action-setup@v4`. This prevents catastrophic `ERR_PNPM_BAD_PM_VERSION` errors and strictly honors our `pnpm@10.27.0` signature located in `package.json`.
3. **Workspace Installation**: Restores the `pnpm-lock.yaml` tree dynamically.
4. **Database Scaffolding Guard**: Runs `pnpm --filter backend exec prisma generate`.
   - *Why?:* GitHub Actions runners execute inside a fresh Ubuntu isolated slate. Because Prisma Client relies on generated types mapped to the disk, omitting this step causes strict TypeScript `nest build` compilations to fatally crash.
5. **Backend Compilation & Testing**: Checks strict type compilations (NestJS) and executes the Jest suites securely.
6. **Frontend Static Prerendering (SSG)**: Orchestrates `next build`.
   - *Environment Injection:* The pipeline actively injects dummy placeholders for `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` during the frontend build. Next.js natively prerenders pages and would normally throw a `CRITICAL` error halting the pipeline if it detected missing variables inside `utils/api.ts`.

---

## 🛠️ Modifying the Pipeline

To append new microservices or testing suites, natively update the configuration at `.github/workflows/main.yml`. Ensure you wrap your sequences with proper `pnpm --filter [workspace_name]` targeting logic to prevent leaking executions into isolated spaces.

[← Return to Master Plan](../Readme.md)
