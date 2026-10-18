# 🔐 Authentication Flow, Session Retention & Cryptography

Security and identity operations within the Portfolio Showcase ([MysticsWinner/PortfolioShowcase](https://github.com/MysticsWinner/PortfolioShowcase)) are built upon hardened enterprise standards, combining strictly intercepted JWT chains with continuous session re-hydration and multi-factor OTP verification.

---

## 🛡️ Upgraded Authentication Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant FE as Next.js 14 App (AuthProvider)
    participant API as NestJS Gateway (/auth)
    participant Guard as JwtAuthGuard & Strategy
    participant DB as Neon PostgreSQL (Prisma)

    %% Registration & Activation
    rect rgb(20, 20, 35)
    note right of User: Phase 1: Registration & Multi-Factor OTP
    User->>FE: Enters Name, Email, Password
    FE->>API: POST /auth/register
    API->>DB: User created (isActive: false, hashed pass, OTP)
    API-->>FE: { requiresVerification: true, email }
    FE->>User: Route to /auth/verify?email=...
    User->>FE: Submits 6-digit OTP code
    FE->>API: POST /auth/verify
    API->>DB: Validate OTP & expiresAt; Set isActive: true
    API-->>FE: { accessToken, user (sanitized) }
    FE->>FE: AuthProvider.setSession() & Storage sync
    end

    %% Login & Session Retention
    rect rgb(30, 20, 35)
    note right of User: Phase 2: Login & Session Retention
    User->>FE: Submits Credentials (Remember Me enabled)
    FE->>API: POST /auth/login
    alt Account Inactive
        API-->>FE: 401 Unauthorized (ACCOUNT_NOT_VERIFIED)
        FE->>User: Display "Activate Account with OTP" button
    else Valid Credentials
        API-->>FE: { accessToken, user (sanitized) }
        FE->>FE: Persist token, user cache & remember preference
    end
    end

    %% Session Heartbeat
    rect rgb(20, 35, 30)
    note right of User: Phase 3: Profile Re-hydration (/auth/me)
    User->>FE: Refresh page or open new tab
    FE->>API: GET /auth/me (Authorization: Bearer <token>)
    API->>Guard: Validate JWT signature & expiration
    Guard->>DB: findUnique user where sub=id & isActive=true
    DB-->>API: Fresh user record
    API-->>FE: Sanitized fresh user profile
    FE->>FE: Update React state & sync tabs via storage events
    end
```

---

## ⚡ Core Upgraded Capabilities

### 1. Self-Healing Profile Re-hydration (`GET /auth/me`)
- Avoids stale user roles or disabled account bypasses by verifying incoming JWT tokens against the live database.
- Decorated with `@UseGuards(JwtAuthGuard)` to validate signatures and claims.
- Strips all password and OTP hashes, returning only safe public metadata (`id, name, email, isActive, role, createdAt`).

### 2. Multi-Tab Session Synchronization
- The `AuthProvider` component listens for native browser `storage` events.
- Logging in or signing out in one browser tab immediately synchronizes authentication status across all active workspace tabs without requiring manual page reloads.

### 3. Stateful Remember-Me Persistence
- Users can persist credentials across sessions for up to 30 days.
- When enabled, remembered email and token chains are preserved securely in local storage; when disabled, session-scoped retention cleans up upon browser termination.

### 4. Post-Authentication Return URL Retention
- Unauthenticated access to guarded assets (e.g. dynamic resume generation, CMS routes) automatically preserves the destination URI using `?redirect=<encoded_path>`.
- Following successful authentication or OTP verification, the user is forwarded directly to their original destination.

### 5. Unverified Account Interception & Resend OTP Recovery Flow
- If a user attempts to log in before verifying their email, NestJS returns a structured error:
  ```json
  {
    "statusCode": 401,
    "message": "ACCOUNT_NOT_VERIFIED",
    "email": "user@example.com"
  }
  ```
- The frontend detects this payload, displays an interactive alert, and presents a direct link allowing the user to jump directly to the OTP verification view with their email pre-filled.

### 6. Dynamic User Presentation & Role Badging
- `Navbar` and `AdminSidebar` display the user's name, initials avatar ring, verified status indicator, and dynamic role badge (`ADMIN` or `MEMBER`).
- Interactive dropdown profile menu provides instant navigation to Dashboard, My Portfolios, Dynamic Resume PDF, and administrative panels.

---

## 🔮 Suggested Planned Features (Authentication Security)

To evolve the application toward a zero-trust network standard:

1. **OAuth2 SSO Integrations:** Implement Passport strategy modules specifically for `Google`, `GitHub`, and `LinkedIn` SSO, completely eliminating standard weak password attack surfaces.
2. **Refresh Token Rotation (High Security):** Currently tokens rely on expiration times. We plan to implement a secondary `refreshToken` database structure. When a short 15-minute token expires, the client secretly exchanges a hardened, encrypted 7-day token for a new pair seamlessly without user disruption.
3. **Instant Redis Token Blacklisting:** Create a robust "Logout Everywhere" algorithm by dumping specific JWT signatures into a Redis Expiring Cache. On every Request, NestJS dynamically probes Redis checking if the incoming token has been manually blacklisted before its expiration time successfully terminates.

---

[← Return to Master Plan](../Readme.md) | [Requirements Matrix](requirements.md)
