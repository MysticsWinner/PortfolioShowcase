# 🚀 Production Deployment Guide

This document outlines the exact, step-by-step process used to deploy the **Portfolio Showcase** monorepo to production. 

The architecture is split into three cloud-native tiers:
- **Database:** Neon (Serverless PostgreSQL)
- **Backend API:** Render (Node.js Web Service)
- **Frontend App:** Vercel (Next.js Application)

---

## 1. Database Provisioning (Neon)

1. Create a free account on [Neon.tech](https://neon.tech) and spin up a new PostgreSQL project.
2. Copy your **Connection String** from the dashboard (it looks like `postgresql://user:password@host/db`).
3. You will need this string for your backend server. The backend uses Prisma ORM to automatically create and sync all tables securely upon boot.

---

## 2. Backend Deployment (Render)

Because the backend is a stateful NestJS application managing WebSockets and secure telemetry, it must be deployed as a continuously running web service.

1. Create a new **Web Service** on [Render](https://render.com) holding this GitHub repository.
2. **Configuration Settings:**
   - **Root Directory:** `./apps/backend` (or leave empty if executing from the workspace root).
   - **Build Command:** `pnpm install && pnpm --filter backend build`
   - **Start Command:** `pnpm --filter backend start:prod`
3. **Environment Variables:**
   - `DATABASE_URL`: Your exact Neon connection string.
   - `ENCRYPTION_KEY`: A random, highly secure **32-character string** required for payload encryption (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`).
   - `FRONTEND_URL`: (Optional) Restricts CORS access. If left empty, the backend automatically allows standard Vercel domains (`/\.vercel\.app$/`).
4. **Deploy Hooks:** Render allows you to trigger deployments via a Webhook URL, which the GitHub Actions CI pipeline uses to automate backend updates.

---

## 3. Frontend Deployment (Vercel)

The Next.js 14 frontend is deployed to Vercel, utilizing their highly optimized Edge Network for Server Components.

1. In your [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this GitHub repository.
2. **Critical Monorepo Configuration:**
   - In the Configure Project settings, click **Edit** next to **Root Directory** and select `apps/frontend`.
   - Vercel will immediately recognize the Next.js framework within the monorepo architecture.
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: The live URL belonging to your Render backend web service (e.g., `https://portfolio-showcase-backend.onrender.com`).
4. Click **Deploy**. Vercel will automatically listen to all `git push` events to your repository and incrementally rebuild your frontend safely.

---

## 4. Automated CI/CD Pipeline

This project includes a fully robust GitHub Actions workflow located in `.github/workflows/main.yml`.

Whenever code is pushed to the `main` or `master` branch:
1. **Validation:** It provisions Node.js & PNPM v10, strictly validating types, linting, and internal Jest testing suites across the monorepo.
2. **Deployment:** 
   - The Frontend is natively intercepted and deployed by Vercel's GitHub integration.
   - The Backend deployment is triggered dynamically by GitHub Actions hitting your Render Deploy Hook URL securely.

*Note: You must set your Render Deploy Hook URL as `RENDER_DEPLOY_HOOK` within your GitHub Repository Secrets for the automated pipeline to trigger Render builds!*
