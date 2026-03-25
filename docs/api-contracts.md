# 🧩 API Contracts & Payload Interfaces

To maintain strict predictability during integration builds across Workspaces, the backend API structures adhere to the following deterministic payload shapes.

---

## 📡 Current State API Mapping

### Authenticated Telemetry Ingest
**Endpoint:** `POST /analytics/track` <br/>
**Action:** Unobtrusively logs visitor route trajectories and session profiles anonymously.
```json
// Payload
{
  "eventName": "PAGE_VIEW",
  "path": "/projects/123",
  "visitorId": "hash-abc-123"
}
```

### Portfolio Storage & Document Operations 
**Endpoint:** `POST /portfolios/:portfolioId/upload` <br/>
**Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <TOKEN>` <br/>
**Action:** Catches `multipart/form-data` natively in RAM using `multer.memoryStorage()`, bypassing ephemeral server disks entirely, and injects the raw buffer securely into the permanent Neon PostgreSQL `Bytea` column.

**Endpoint:** `GET /portfolios/:portfolioId/download` <br/>
**Action:** Pulls the binary `Bytes` payload directly out of the Postgres database and returns a safe HTTP streaming `Blob` allowing the Next.js frontend to securely download the user's resume, completely immune to backend sleep/restart cycles.

### CMS Administrator Overrides
**Endpoint:** `PATCH /admin/users/:userId/status` <br/>
**Action:** Toggles a specific target account from `isActive: true` to `isActive: false`, instantly terminating their token validity on the next intercepted validation check.
**Endpoint:** `PATCH /admin/users/:userId/role` <br/>
**Action:** Elevates a `VIEWER` up to an `ADMIN` role instantly unlocking internal routes.

---

## 🔮 Suggested Planned Features (API Integration)

1. **Swagger / OpenAPI Auto-Generation:** Implement `@nestjs/swagger` immediately to automatically decorate and compile these raw contracts into an interactive `https://your-backend-url/api/docs` viewer natively.
2. **GraphQL Wrapping:** Implement Apollo Server over the NestJS topology allowing the Next.js `CMS` to run granular data fetches dynamically fetching only specific fields using GraphQL.
3. **Webhooks Outcast Engine:** Build an autonomous HTTP dispatcher that fires `POST` pulses to external platforms (Slack, Discord) whenever a visitor uses the `POST /contact` endpoint to send a message.

[← Return to Master Plan](../Readme.md)
