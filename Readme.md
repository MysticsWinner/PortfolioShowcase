1️⃣ Database
2️⃣ Backend core (auth + entities)
3️⃣ Backend endpoints
4️⃣ Frontend auth wiring
5️⃣ Frontend pages
6️⃣ Integration verification


1️⃣ DATABASE — MAKE IT REAL
Step 1: Start PostgreSQL (Local)
Using Docker (recommended):

bash
Copy code
docker run --name portfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  -d postgres
Why:

Real DB

Same as production

Zero local setup issues

Step 2: Apply Prisma Schema
bash
Copy code
cd database
npx prisma migrate dev --name init
Why:

Creates tables

Locks schema

Enables Prisma Client

Verify:

bash
Copy code
npx prisma studio
You should see all entities (User, Project, etc.).

2️⃣ BACKEND — MAKE IT SERVE REAL DATA
Step 3: Start Backend
bash
Copy code
cd apps/backend
pnpm run start:dev
Backend should start on:

arduino
Copy code
http://localhost:3001
Step 4: Implement Auth (MANDATORY FIRST)
Auth flow
pgsql
Copy code
POST /auth/login
→ validate credentials
→ issue access + refresh tokens
→ return user + role
Minimal working logic:

Hash password with bcrypt

JWT for access

Refresh token in DB

Why first?

Everything depends on auth

RBAC blocks private data

Step 5: Seed Initial Admin User
Create seed script:

bash
Copy code
database/seed/seed.ts
Seed:

Role: ADMIN

User: you

Run:

bash
Copy code
pnpm ts-node database/seed/seed.ts
Verify:

Admin exists in DB

Password works

Step 6: Implement Core APIs
Minimum required endpoints
Entity	Endpoint	Purpose
Auth	/auth/login	Login
Auth	/auth/me	Session validation
Project	/projects	Public projects
Project	/projects/private	Admin projects
Project	/projects (POST)	Create project
Contact	/contact	Save messages

Why this set?

Covers full read/write lifecycle

Supports public + admin views

3️⃣ FRONTEND — CONNECT TO REAL BACKEND
Step 7: Configure API Client
📄 services/api.client.ts

ts
Copy code
export const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true
});
Why:

Centralizes API logic

Enables token handling

Future-proof

Step 8: Login Flow (Critical)
Flow:

pgsql
Copy code
Login Page
→ POST /auth/login
→ Save token (cookie or memory)
→ Redirect to /dashboard
Verification:

Login succeeds

Reload page → still logged in

Dashboard accessible

If this works → everything else will.

Step 9: Middleware Protection
📄 app/middleware.ts

Logic:

Block /dashboard if not authenticated

Allow public pages

Why:

Enforces RBAC on frontend

Prevents accidental leaks

4️⃣ FEATURE PAGES — MAKE THEM LIVE
Projects (Public)
Call GET /projects

Render cards

No auth required

Check:

Shows only PUBLIC projects

Dashboard → Projects
Call GET /projects/private

Admin only

Check:

Hidden projects visible

Edit + create works

Create Project
Flow:

bash
Copy code
Form → POST /projects
→ DB save
→ Re-fetch list
Check:

Appears instantly

Visibility toggle works

Contact Page
Flow:

bash
Copy code
Form → POST /contact
→ Success message
Admin:

View via /dashboard/messages

5️⃣ SYSTEM VERIFICATION CHECKLIST
Your project is operational if all boxes are checked:

✅ Backend runs independently
✅ Frontend loads without mocks
✅ Login persists on refresh
✅ Private projects hidden from public
✅ Admin dashboard fully functional
✅ DB survives restarts
✅ No hardcoded data

🧪 HOW TO TEST LIKE A PRO
Manual test flow
Open site as guest

View public projects

Try accessing /dashboard → blocked

Login as admin

Create private project

Logout

Confirm private project hidden

If this passes → you’ve built a real system

🎯 WHAT THIS PROJECT NOW PROVES
Skill	Evidence
Full-stack	Frontend + backend + DB
Auth	JWT + RBAC
Architecture	Monorepo, clean layers
Data modeling	Prisma schema
API design	REST contracts
Production thinking	Env config, seeding