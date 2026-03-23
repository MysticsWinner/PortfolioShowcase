# Comprehensive Testing Strategy 🧪

Zero regressions. That is the fundamental philosophy of this stack. We enforce an uncompromising 100% stable test suite utilizing **Jest** running flawlessly on both the Next.js Frontend and NestJS Backend isolation environments.

---

## 💻 NestJS Backend Execution

Because our backend manages complex telemetry generation, strictly isolated Database interactions via Prisma, and strict WebSockets, we test natively via `supertest` & `Jest`.

**Run Backend Integration:**
```bash
pnpm --filter backend test
pnpm --filter backend test:watch
pnpm --filter backend test:cov
```

### Mocking Specificity (Prisma)
To prevent network layer lockups during mocked service execution, we strongly type-cast our Prisma abstractions. Always ensure mocked query resolution adheres to Jest signature types:

```typescript
// ✅ Good: Strict Jest Mocking preventing TS2339 errors in CI
(prisma.project.findMany as jest.Mock).mockResolvedValue(mockData);

// ❌ Bad: Will fatally crash strict TSC environments during GitHub Action Build
prisma.project.findMany.mockResolvedValue(mockData);
```

---

## 🎨 Next.js Frontend Execution

The frontend DOM architecture relies purely on `@testing-library/react` married synchronously to `jest-environment-jsdom`. Rather than merely snapshotting elements, we natively fire synthetic click and focus telemetry actions onto Interactive React Server Components (RSC) to ensure identical browser execution semantics.

**Run Frontend Integration:**
```bash
pnpm --filter frontend test
pnpm --filter frontend test:watch
```
*Note: Depending on configuration, UI assertions aggressively validate accessibility (A11y) using WAI-ARIA tag bindings natively.*

### Next.js Node Assertions
We bypass `process.env` pollution by spinning up isolated JSDOM workers. Ensure `NEXT_PUBLIC_API_URL=http://localhost:3001` is actively mocked during `beforeAll` stubs if testing external telemetry (like `/analytics/track`).

---

## 📊 Coverage Guidelines

We recommend compiling the coverage reports to generate static metric HTML files automatically if you intend to analyze bottlenecks in code quality. 
By maintaining these isolated test workspaces via pnpm filters, we successfully achieve absolute decoupling, preventing frontend UI tests from tangling into backend telemetry workers.

[← Return to Master Plan](../Readme.md)
