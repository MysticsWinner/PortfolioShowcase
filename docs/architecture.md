# 🏗️ Master Architectural Topography & System Design

This document outlines the holistic architecture defining the **Portfolio Showcase Application** at its current state and traces its evolutionary vector.

---

## 🧭 Current State Architecture

### 1. Production Infrastructure Matrix
The production application achieves maximum decoupled scale utilizing an advanced trifecta of modern hosting providers:
- **Frontend (Vercel):** The Next.js 14 application binds directly to the Vercel Edge Network via native GitHub integrations. It automatically rebuilds on `main` branch pushes utilizing Turbopack.
- **Backend (Render):** The NestJS monolithic telemetry & control service runs as a continuously bound `Node.js Web Service`.
- **Database (Neon Serverless):** PostgreSQL operations reside in Neon's auto-scaling pooled network, allowing Prisma to execute zero-downtime schema pushes effortlessly.

### 2. NestJS Backend Topology
- **Prisma Data Engine:** We bypass complex raw SQL injections by abstracting data through Prisma ORM mapping directly to PostgreSQL. Models include `User`, `Project`, `ExternalWork`, `Portfolio`, and `AnalyticsEvent`.
- **Telemetry Interceptors:** A custom analytics endpoint dumps massive parallel hit payloads gracefully into PostgreSQL silently.
- **WebSocket Tunnels:** Instantiated using `@nestjs/websockets` for Live Chat features entirely segregated from normal `http` TCP traffic.

### 3. Next.js Frontend Philosophy
- **Selective Rendering Boundaries:** The application leverages strict Server Components natively. Explicit `"use client"` directives are limited strictly to interactive layouts (e.g., the globally lazy-loaded `HeroCanvas` WebGL component).
- **Global Command Palette:** Intercepts `Cmd/Ctrl + K` inputs and leverages `cmdk` node utilities to hot-jump developers into private dashboards.
- **Dynamic CSS Isolation:** Relies entirely on Tailwind CSS v4 to generate atomic utility classes securely at build-time.

---

## 🔮 Suggested Planned Features (Architecture)

As load scales and telemetry demands rise, the backend monolithic structure must split.
1. **Microservices Extraction (Event-Driven System):** Break the `AnalyticsService` out of the primary NestJS controller completely. Convert the telemetry ingest into a standalone **Go/Rust microservice** dropping hits into a RabbitMQ / Kafka stream to prevent blocking main UI renders during viral traffic spikes.
2. **Global Edge Computing:** Convert all `/projects` and `/external-work` API queries into Edge functions executing near the user, syncing directly against a globally distributed database like PlanetScale or Turso.
3. **Dedicated In-Memory Blacklisting Schema:** Establish an aggressive separate global Redis cluster handling nothing but instant JWT invalidation and granular DDoS rate-limiting across distributed nodes.

[← Return to Master Plan](../Readme.md)
