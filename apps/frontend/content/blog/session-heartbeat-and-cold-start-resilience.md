---
title: "Killing Zombie Sessions: Active JWT Heartbeats & Cold-Start Resilience on Serverless Containers"
date: "2026-10-24"
description: "An engineering post-mortem on handling spinning container cold-starts, proactive JWT expiration tracking on every browser event, and preventing unauthorized zombie sessions."
tags: ["Security", "Authentication", "DevOps", "React", "Render"]
---

Building modern web applications that integrate stateful microservices with serverless or auto-sleeping cloud instances (like Render, Fly.io, or Railway free tiers) exposes subtle edge cases in authentication and connection resilience.

Over the past few sprints, we tackled two critical architectural challenges in **Portfolio Showcase**:
1. **The Zombie Session Vulnerability**: Users leaving tabs open with expired JWT tokens, resulting in broken states or delayed security expulsions.
2. **Cold-Start Connection Drops**: Network timeouts and 502/503 errors when sleeping microservices take 30–50 seconds to spin up.

Here is how we resolved both challenges through active session heartbeats and cold-start interceptors.

---

## 1. The Anatomy of a Zombie Session

In many Single Page Applications (SPAs), authentication state is stored in `localStorage` or session memory:

```typescript
// Typical naive check
const isAuthenticated = !!localStorage.getItem('token');
```

The fatal flaw with this pattern is that the token might have expired hours ago. The frontend UI continues rendering authenticated buttons, dashboards, and private views until the user clicks an action that makes an API call. When the call fails with `401 Unauthorized`, the app jolts the user with a sudden error or redirection.

Even worse, if a shared device is left unattended, an expired session might still reveal sensitive dashboard layouts because the client-side router never actively verified the token's `exp` claim.

---

## 2. Active Verification on Every Activity

We modified our `AuthProvider` (`apps/frontend/components/AuthProvider.tsx`) and HTTP client (`api.ts`) to actively inspect session claims on every single user interaction:

```typescript
// Active Token Claim Verification
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
```

Then, we hooked event listeners to the browser window:
- `window.addEventListener('focus', checkActiveSession)`
- `window.addEventListener('click', checkActiveSession)`
- `window.addEventListener('keydown', checkActiveSession)`
- Next.js route change transitions (`pathname` updates)

If the token has expired, the session is invalidated instantly: `localStorage` is cleared, user state is wiped, and the browser cleanly redirects to `/auth/login?redirect=...`. No zombie sessions. No stale state.

---

## 3. Surviving 50-Second Cloud Cold Starts

Our backend runs on a managed container tier that automatically spins down after 15 minutes of inactivity. When a request arrives, the host container boots from cold storage:
- Node.js initialization: ~8s
- Prisma database connection pool: ~12s
- NestJS dependency graph compilation: ~15s
- Total spin-up time: **~35 to 50 seconds**

Standard Axios and browser fetch configurations timeout after 10–15 seconds, throwing `ECONNABORTED` or `504 Gateway Timeout` to the user.

To make the app completely resilient to cold boots, we implemented a three-layer defense:

### Layer A: Extended 75-Second Axios Timeout
```typescript
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 75000, // Accommodates Render spin-up without dropping frames
});
```

### Layer B: Proactive Non-Blocking Wake-Up Ping
Upon landing on any public page or login view, the application dispatches a silent `GET /health` probe:
```typescript
systemApi.wakeUpBackend(); // Triggers host container container spin-up early
```
By the time the user types their credentials or clicks a portfolio project, the backend container is already warm and serving responses with 12ms latency!

### Layer C: Visual Spin-Up Notification
If a request encounters a waking container, the UI displays a clean status badge (`"Waking up backend server (free tier)..."`) instead of showing an alarming red error screen.

---

## Summary

Security and infrastructure constraints shouldn't compromise developer experience. By combining **active client-side session heartbeats** with **cold-start awareness**, Portfolio Showcase delivers enterprise-grade security and smooth user experiences on completely zero-cost infrastructure.
