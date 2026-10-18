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

---

## 5. Render Cold-Start Failsafes & Production Resilience

On Render free and low-cost tiers, backend containers spin down into idle/sleep mode after 15 minutes of inactivity. When a new request arrives, Render takes between 30 to 60 seconds to spin up the container and establish the database connection.

To ensure production resilience, the application implements active multi-layer failsafes:

### 1. Early Background Warm-Up Probe
- As soon as the Next.js frontend mounts, `AuthProvider` dispatches a non-blocking background ping to `GET /health`.
- If the Render instance is asleep, this initiates container boot sequence immediately before the user clicks to log in or create a portfolio.

### 2. Cold-Start Detection & Exponential Backoff
- The frontend Axios client (`apps/frontend/utils/api.ts`) is configured with a 75-second timeout and an intelligent response interceptor.
- If Render returns `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`, or network connection drops during container spin-up, the client marks the backend as `waking` and automatically retries the request up to 3 times with exponential backoff (3.5s, 7s, 10.5s).

### 3. User-Facing Diagnostics & Feedback (`BackendWarmupBanner`)
- While Render is spinning up, a sleek glassmorphic banner appears informing the visitor of the cold start with a live elapsed second counter.
- Requests do not fail abruptly with generic error messages; they queue and complete automatically as soon as Render responds.

### 4. Hosting Environment Introspection
- **Backend:** Detects `RENDER=true` or `RENDER_SERVICE_ID` and returns environment telemetry via `GET /health` and `GET /system/info`.
- **Frontend:** Inspects client hostname and environment flags (`VERCEL=1`), rendering live infrastructure telemetry across the Footer, Dashboard, and diagnostic modal.

---

[← Return to Master Plan](../Readme.md) | [Requirements Matrix](requirements.md)

*Note: You must set your Render Deploy Hook URL as `RENDER_DEPLOY_HOOK` within your GitHub Repository Secrets for the automated pipeline to trigger Render builds!*
