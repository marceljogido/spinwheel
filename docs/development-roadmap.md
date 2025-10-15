# Spinwheel Development Roadmap (PostgreSQL + pgAdmin)

This roadmap translates the agreed feature set into a concrete implementation plan that fits the existing React frontend and a new Node.js backend powered by PostgreSQL (managed through pgAdmin). Each phase lists deliverables, required tasks, and tips to reduce surprises during development.

> **FAQ**
> * **"Harus pakai Prisma?"** &mdash; Tidak wajib. Prisma disebut sebagai _contoh_ tooling migrasi/ORM karena banyak dipakai pada stack TypeScript. Anda bisa menggantinya dengan `node-postgres` murni, `pg-promise`, `Drizzle`, `Kysely`, `Knex`, atau alat lain yang paling nyaman, sementara pgAdmin tetap dipakai untuk inspeksi data dan query manual.
> * **"Kenapa perlu folder backend?"** &mdash; Folder `server/` atau `backend/` hanya pemisahan struktur proyek supaya API Node.js tersentralisasi. Frontend React Anda tetap berada di repo yang sama, sementara kode API (Express routes, layanan bisnis, utilitas DB) dikelompokkan agar mudah diuji, dideploy, dan diberi dependensi berbeda dari aplikasi Vite.

---

## 0. High-Level Timeline

| Week | Focus | Key Deliverables |
|------|-------|------------------|
| 0 | Environment preparation | Shared `.env` contract, Docker/pgAdmin running, backend skeleton repo created |
| 1 | Database & migrations | Baseline schema, migration workflow, seed data for prizes |
| 2 | Core API surface | Prize CRUD, spin endpoint with transactional decrement, session listing |
| 3 | Frontend integration | React Query hooks, admin panel talking to backend, auth guard scaffold |
| 4 | Authentication & authorization | Sign-in page, JWT flow, role-based middleware, protected routes |
| 5 | Analytics & reporting | Spin logging, summary endpoints, admin dashboard charts |
| 6 | Advanced UX & safeguards | Probability validation, inventory warnings, session switching |
| 7 | Testing & CI | Unit/integration tests, Playwright smoke tests, GitHub Actions pipeline |
| 8 | Deployment & observability | Docker images, staging deploy, monitoring hooks |

> **Tip:** Create a GitHub Project board with these phases as columns. Every task below can become a card you track across the board.

---

## 1. Environment & Repository Setup

### Deliverables
* `server/` folder with Express + TypeScript scaffolding (nama folder bebas, mis. `backend/`).
* Shared `.env.example` documented for both frontend and backend.
* PostgreSQL reachable locally via Docker and pgAdmin.

### Tasks
1. **Bootstrap backend project**
   ```bash
   mkdir server && cd server
   npm init -y
   npm install express cors dotenv zod pino pg pg-promise bcrypt jsonwebtoken
   npm install -D typescript ts-node-dev tsup @types/express @types/node @types/jsonwebtoken jest ts-jest @types/jest
   npx tsc --init
   ```
2. **Create basic folder structure** (rename `server/` to `backend/` if you prefer)
   ```text
   server/
   ├── src/
   │   ├── app.ts
   │   ├── server.ts
   │   ├── routes/
   │   ├── controllers/
   │   ├── services/
   │   ├── repositories/
   │   └── middleware/
   ├── db/            ← tempat query builder, migrasi, atau ORM pilihan
   ├── tests/
   └── tsconfig.json
   ```
3. **Docker Compose for PostgreSQL** (runs alongside pgAdmin)
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:16
       environment:
         POSTGRES_DB: spinwheel
         POSTGRES_USER: spinwheel
         POSTGRES_PASSWORD: spinwheel
       ports:
         - '5432:5432'
       volumes:
         - db_data:/var/lib/postgresql/data
     pgadmin:
       image: dpage/pgadmin4
       environment:
         PGADMIN_DEFAULT_EMAIL: admin@example.com
         PGADMIN_DEFAULT_PASSWORD: admin
       ports:
         - '5050:80'
       depends_on:
         - db
   volumes:
     db_data:
   ```
4. **Environment variables**
   * `server/.env.example`
     ```env
     DATABASE_URL=postgresql://spinwheel:spinwheel@localhost:5432/spinwheel
     PORT=4000
     JWT_ACCESS_SECRET=replace-me
     JWT_REFRESH_SECRET=replace-me
     FRONTEND_ORIGIN=http://localhost:5173
     ```
   * `src/server.ts` should read `PORT` and start the Express app.
5. **Project hygiene**
   * Configure ESLint/Prettier or use Biome for both repos.
   * Add npm scripts: `dev`, `build`, `start`, `test`.

---

## 2. Database Schema & Migrations

### Deliverables
* Migration tool configured (pilih satu: Prisma, Drizzle, Kysely, Knex, node-pg-migrate, atau SQL murni yang dijalankan via skrip).
* Base tables + seed data for prizes.

### Tasks
1. Choose an ORM/migration tool. Contoh dengan **node-postgres + node-pg-migrate** (gaya SQL murni):
   ```bash
   npm install pg pg-promise node-pg-migrate
   npx node-pg-migrate init
   ```
2. Definisikan skema pada file migrasi SQL/TypeScript, misalnya `migrations/1699999999999_init.ts`:
   ```ts
   import { MigrationBuilder } from 'node-pg-migrate';

   export async function up(pgm: MigrationBuilder) {
     pgm.createTable('sessions', {
       id: 'uuid-primary-key',
       name: { type: 'text', notNull: true },
       starts_at: { type: 'timestamptz' },
       ends_at: { type: 'timestamptz' },
       config: { type: 'jsonb' },
       created_at: { type: 'timestamptz', default: pgm.func('now()') },
     });

     pgm.createTable('prizes', {
       id: 'uuid-primary-key',
       session_id: {
         type: 'uuid',
         references: 'sessions',
         onDelete: 'SET NULL',
       },
       name: { type: 'text', notNull: true },
       description: { type: 'text' },
       image_url: { type: 'text' },
       audio_url: { type: 'text' },
       quantity: { type: 'integer', notNull: true, default: 0 },
       probability_weight: { type: 'integer', notNull: true, default: 1 },
       is_active: { type: 'boolean', notNull: true, default: true },
       created_at: { type: 'timestamptz', default: pgm.func('now()') },
       updated_at: { type: 'timestamptz', default: pgm.func('now()') },
     });

     pgm.createTable('spins', {
       id: 'uuid-primary-key',
       session_id: {
         type: 'uuid',
         references: 'sessions',
         onDelete: 'CASCADE',
         notNull: true,
       },
       prize_id: {
         type: 'uuid',
         references: 'prizes',
         onDelete: 'SET NULL',
       },
       participant: { type: 'text' },
       status: {
         type: 'text',
         notNull: true,
         default: 'SUCCESS',
         check: "status IN ('PENDING','SUCCESS','FAILED')",
       },
       metadata: { type: 'jsonb' },
       spun_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
     });

     pgm.createTable('users', {
       id: 'uuid-primary-key',
       email: { type: 'text', notNull: true, unique: true },
       password_hash: { type: 'text', notNull: true },
       role: {
         type: 'text',
         notNull: true,
         default: 'ADMIN',
         check: "role IN ('ADMIN','OPERATOR','VIEWER')",
       },
       created_at: { type: 'timestamptz', default: pgm.func('now()') },
     });
   }

   export async function down(pgm: MigrationBuilder) {
     pgm.dropTable('users');
     pgm.dropTable('spins');
     pgm.dropTable('prizes');
     pgm.dropTable('sessions');
   }
   ```
3. Jalankan migrasi & siapkan seed script kustom (mis. `ts-node scripts/seed.ts`) untuk mengisi sesi dan hadiah default yang sesuai dengan dummy data frontend.
4. Gunakan pgAdmin untuk memverifikasi tabel, constraints, dan melakukan insert uji coba setelah migrasi.
5. Test the schema using pgAdmin (verify tables, run a test INSERT, etc.).

---

## 3. Backend API Surface

### Deliverables
* REST endpoints under `/api` with validation and logging.
* Transactional spin operation that decrements prize quantity safely.

### Tasks
1. Create Express router modules:
   * `routes/prizeRoutes.ts`
   * `routes/spinRoutes.ts`
   * `routes/sessionRoutes.ts`
   * `routes/authRoutes.ts`
2. Controllers should use Zod schemas to validate input and shape responses.
3. Implement service layer functions:
   * `listPrizes(sessionId)`
   * `createOrUpdatePrize(payload)`
   * `performSpin({ sessionId, participant })`
   * `listSessions()` / `createSession()`
4. Spin transaction flow (pseudocode, gunakan helper dari `pg-promise`/`pg`):
   ```ts
   await db.tx(async (tx) => {
     const prize = await pickPrize(tx, sessionId);
     if (prize) {
       await tx.none(
         'update prizes set quantity = quantity - 1, updated_at = now() where id = $1',
         [prize.id],
       );
     }
     await tx.none(
       'insert into spins (id, prize_id, session_id, status) values ($1, $2, $3, $4)',
       [uuidv4(), prize?.id ?? null, sessionId, 'SUCCESS'],
     );
     return prize;
   });
   ```
5. Return structured responses consumed easily by React Query:
   ```json
   {
     "data": [...],
     "meta": { "count": 10 }
   }
   ```
6. Configure global error handler middleware returning JSON with `code`, `message`, and optional `details` array.
7. Add request logging via `pino` or `morgan`.

---

## 4. Frontend Integration

### Deliverables
* React Query hooks replacing local state for prizes, spins, sessions.
* Admin panel forms persisting to backend.

### Tasks
1. Create API client in `src/lib/api.ts` using `fetch` or `axios` with base URL from `import.meta.env.VITE_API_URL`.
2. Introduce React Query mutation hooks:
   * `usePrizes(sessionId)`
   * `useUpsertPrize()`
   * `useSpinWheel()`
   * `useSessions()`
3. Update context/providers so that the admin panel pulls data via hooks and invalidates caches after mutations.
4. Replace mock statistics with API-driven data (initially simple counts, upgrade later).
5. Ensure audio assets and images use URLs from API responses; add fallback for legacy local files.
6. Use `toast` notifications based on API success/error responses.

---

## 5. Authentication & Authorization

### Deliverables
* Admin login flow with JWT (access + refresh tokens stored in HTTP-only cookies).
* Role-based guards for API routes and frontend navigation.

### Tasks
1. Backend
   * Create `/api/auth/login` and `/api/auth/refresh` endpoints.
   * Middleware `requireAuth` verifies access token, `requireRole('ADMIN')` for admin-only actions.
   * Store refresh tokens in `users` table or Redis (optional) with rotation.
2. Frontend
   * Add `Login` page using existing design system.
   * Store auth state in `AuthContext`; use `useMutation` for login.
   * Protect admin routes using `Navigate` + suspense fallback.
3. Provide script to create initial admin user:
   ```bash
   node scripts/create-admin.mjs admin@example.com supersecret
   ```

---

## 6. Analytics & Reporting

### Deliverables
* Aggregated statistics endpoints and charts in the admin dashboard.

### Tasks
1. Backend queries (gunakan SQL builder/ORM pilihan):
   * Total spins per session.
   * Prize distribution (group by prize).
   * Recent winners (limit 20).
2. Expose endpoints `/api/analytics/summary`, `/api/analytics/prize-distribution`, `/api/analytics/recent-spins`.
3. Frontend
   * Use `recharts` or `nivo` to render bar/pie charts.
   * Enhance statistics tab with filters (date range, session).

---

## 7. Multi-Session & Participant Tracking

### Deliverables
* Admin UI to manage sessions; operator can choose active session.
* Optional participant capture (name, phone, etc.).

### Tasks
1. Add `participants` table if you need richer contact info.
2. Update spin endpoint to accept `participant` payload; log it in `spins.metadata` or dedicated table.
3. Frontend menu mode: allow selecting active session (persist to localStorage).
4. Admin panel: ability to clone sessions, set defaults, view session-specific analytics.

---

## 8. Probability & Inventory Safeguards

### Deliverables
* Server-side enforcement of fair odds and inventory limits.

### Tasks
1. When admin saves prize configuration, normalize weights so active prize weights sum to 100 (or store raw weights and normalize during spin).
2. Reject updates that set negative quantities or leave all active prizes with zero weight.
3. Add warnings endpoint `/api/prizes/health` returning alerts like "Prize X low stock" or "Total probability < 100".
4. Display warnings in admin panel using the existing toast/alert components.

---

## 9. Testing & Quality Assurance

### Deliverables
* Automated tests covering business-critical flows.

### Tasks
1. Backend unit tests with Jest for services (mocking database layer).
2. Integration tests using `supertest` + Dockerized PostgreSQL (use `testcontainers` for hermetic runs).
3. Frontend tests with Vitest + React Testing Library for admin forms and spin logic.
4. End-to-end smoke suite with Playwright: login, configure prize, trigger spin, verify winner modal.
5. GitHub Actions workflow running lint, type-check, test, build on every PR.

---

## 10. Deployment & Observability

### Deliverables
* Production-ready stack with monitoring.

### Tasks
1. Build Docker images (`Dockerfile` for backend, optionally multi-stage) and push to registry.
2. Provision managed PostgreSQL (Railway, Render, Supabase) and set up backups.
3. Deploy backend to Render/Fly.io/Heroku; set environment variables and CORS origins.
4. Configure frontend hosting (Vercel/Netlify) with `VITE_API_URL` pointing to production API.
5. Add monitoring: Sentry for frontend/backend errors, UptimeRobot/Healthchecks for ping monitoring, Logtail/Datadog for logs.
6. Document release checklist (run migrations, seed sessions, rotate secrets, verify analytics dashboards).

---

## Appendices

* **pgAdmin Tips**
  * Create server connection using Docker service host `host.docker.internal` (macOS/Windows) or direct `localhost` on Linux.
  * Use pgAdmin query tool to inspect views/materialized views for analytics.
* **Security Notes**
  * Store JWT secrets in `.env` only; use parameter store in production.
  * Enforce HTTPS on production deployments; set `Secure` flag on cookies.
* **Next Steps After MVP**
  * Integrate S3-compatible storage for prize media uploads.
  * Webhook integration for event-driven notifications (Slack, email).
  * Optional hardware integration via Web Serial / Web Bluetooth for physical spin triggers.

This roadmap should give you a week-by-week path from the current single-page prototype to a full PostgreSQL-backed event platform, while keeping pgAdmin as your primary database management interface.
