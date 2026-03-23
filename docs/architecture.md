# 🏗️ Master Architectural Topography & System Design

This document outlines the holistic architecture defining the **Portfolio Showcase Application** at its current state and traces its evolutionary vector.

---

## 🧭 Current State Architecture

### 1. Monorepo Structural Philosophy
The repository abandons traditional segmented Git modules in favor of an unyielding **PNPM Workspace** matrix.
- `apps/frontend`: Governed by Next.js 14 executing on the cutting-edge App Router paradigm. Uses Turbopack for millisecond compilation limits.
- `apps/backend`: A monolithic API presentation gateway powered strictly by NestJS 11. It exposes Controllers that interface safely with deeper service classes.
- `packages/*` (Future scaffolding): Isolated cross-boundary typed interfaces and design tokens.

### 2. NestJS Backend Topology
- **Prisma Data Engine:** We bypass complex raw SQL injections by abstracting data through Prisma ORM mapping directly to PostgreSQL. Models include `User`, `Project`, `ExternalWork`, `Portfolio`, and `AnalyticsEvent`.
- **Telemetry Interceptors:** A custom analytics endpoint dumps massive parallel hit payloads gracefully into PostgreSQL without freezing the thread using fast async `trackEvent()` bounds.
- **WebSocket Tunnels:** Instantiated using `@nestjs/websockets` and `@nestjs/platform-socket.io`, creating an absolute bidirectional tunnel for Live Chat features entirely segregated from normal `http` TCP traffic.

### 3. Next.js Frontend Philosophy
- **Selective Rendering Boundaries:** The application utilizes React Server Components (RSC) everywhere possible, minimizing client-JS bloat. Explicit `"use client"` directives are limited strictly to interactive layouts (e.g., the globally lazy-loaded `HeroCanvas` WebGL component utilizing `@react-three/fiber`).
- **Global Command Palette:** Intercepts `Cmd/Ctrl + K` inputs and leverages `cmdk` node utilities to hot-jump developers into private `/dashboard` or `/projects` route arrays.
- **Dynamic CSS Isolation:** Relies entirely on Tailwind CSS v4 to generate atomic utility classes securely at build-time.

---

## 🔮 Suggested Planned Features (Architecture)

As load scales and telemetry demands rise, the backend monolithic structure must split.
1. **Microservices Extraction (Event-Driven System):** Break the `AnalyticsService` out of the primary NestJS controller completely. Convert the telemetry ingest into a standalone **Go/Rust microservice** dropping hits into a RabbitMQ / Kafka stream to prevent blocking main UI renders during viral traffic spikes.
2. **Global Edge Computing:** Convert all `/projects` and `/external-work` API queries into Edge functions executing near the user, syncing directly against a globally distributed database like PlanetScale or Turso.
3. **Dedicated In-Memory Blacklisting Schema:** Establish an aggressive separate global Redis cluster handling nothing but instant JWT invalidation and granular DDoS rate-limiting across distributed nodes.

[← Return to Master Plan](../Readme.md)
