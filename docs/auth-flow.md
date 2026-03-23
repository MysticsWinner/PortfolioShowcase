# 🔐 Authentication Flow & Cryptography

Security operations within the Portfolio Showcase are built upon hardened enterprise standards, avoiding session cookies in favor of strictly intercepted JWT chains.

---

## 🛡️ Current State Authentication Flow

### 1. Cryptographic Bootstrapping (Login)
When a user targets `POST /auth/login`, NestJS executes a native internal crosscheck using the Prisma ORM.
- **Hashing Verification:** Raw passwords from the frontend are measured against the database using `bcrypt.compareSync`.
- **Issuance:** A strict, short-lived JSON Web Token (JWT) is constructed using `@nestjs/jwt` containing the minimal payload `sub: userId` and `role`. It never encodes PII inside the token.

### 2. Next.js Interceptor Web
Instead of risking Cross-Site Request Forgery (CSRF) via native browser cookies, the React frontend leverages an Axios Interceptor (`utils/api.ts`).
- It extracts the `localStorage` token globally.
- Injects it sequentially into every `config.headers.Authorization` binding natively across all requests.
- **Auto-Termination:** If the NextJS Interceptor detects a `401 Unauthorized` signal from NestJS, it instantly obliterates `localStorage.removeItem('token')` and forces a hard redirect to `/auth/login`.

### 3. Role-Based Execution Guards (RBAC)
Controllers requiring `ADMIN` authority are explicitly wrapped in `@Roles(RoleType.ADMIN)` guard constraints native to NestJS. The core pipeline reads the user's validated JWT profile automatically evaluating permission hierarchies cleanly.

---

## 🔮 Suggested Planned Features (Authentication Security)

To evolve the application toward a zero-trust network standard:

1. **OAuth2 SSO Integrations:** Implement Passport strategy modules specifically for `Google`, `GitHub`, and `LinkedIn` SSO, completely eliminating standard weak password attack surfaces.
2. **Refresh Token Rotation (High Security):** Currently tokens are relatively static relying on expiration times. We must implement a secondary `refreshToken` database structure. When a short 15-minute token dies, the client secretly exchanges a hardened, encrypted 7-day token for a new pair seamlessly without user disruption.
3. **Instant Redis Token Blacklisting:** Create a robust "Logout Everywhere" algorithm by dumping specific JWT signatures into a Redis Expiring Cache. On every Request, NestJS dynamically probes Redis checking if the incoming token has been manually blacklisted before its expiration time successfully terminates.

[← Return to Master Plan](../Readme.md)
