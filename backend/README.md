# Spinwheel API

Backend service for the Spinwheel project. Provides a PostgreSQL-powered REST API for managing prizes and tracking spin results.

## Getting Started

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Copy the environment template and update the values for your database:

   ```bash
   cp .env.example .env
   ```

   The server prefers a `DATABASE_URL`, but you can also use discrete `PG*` variables if you manage credentials with pgAdmin.

3. (Optional) Run the database migration manually:

   ```bash
   psql "$DATABASE_URL" -f src/db/migrations/001_create_prizes.sql
   ```

   The server will now attempt to create the `prizes` table automatically on boot. Running the SQL ahead of time in pgAdmin ensures the correct permissions are in place, especially if the database user cannot install the `pgcrypto` extension.

4. Start the development server:

   ```bash
   npm run dev
   ```

   By default the API listens on [http://localhost:4000](http://localhost:4000) and accepts requests from the Vite dev server on port 5173.

   The root path (`/`) now returns a short JSON message so you can verify the service is online even without hitting a specific endpoint.

## API Overview

| Method | Endpoint           | Description                                           |
| ------ | ------------------ | ----------------------------------------------------- |
| GET    | `/prizes`          | List prizes sorted by `sortIndex`.                    |
| POST   | `/prizes`          | Create a new prize entry. (Requires admin token)      |
| PUT    | `/prizes/:id`      | Update prize fields such as name, quota, or chances. (Requires admin token) |
| DELETE | `/prizes/:id`      | Remove a prize from the catalog. (Requires admin token) |
| POST   | `/prizes/:id/win`  | Increment the `won` counter when a participant wins.  |
| POST   | `/prizes/reorder`  | Persist a new manual ordering for the prize segments. (Requires admin token) |

Authentication helpers:

| Method | Endpoint      | Description                                                                 |
| ------ | ------------- | --------------------------------------------------------------------------- |
| POST   | `/auth/login` | Exchange the admin username/password (from environment variables) for a token. |
| POST   | `/auth/logout`| Revoke the active session token. Requires the `Authorization: Bearer` header. |
| GET    | `/auth/me`    | Validate the active session token and return the admin username.             |

A simple `/health` endpoint is also available for uptime checks.

## Project Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── src
│   ├── index.ts           # Express entry point
│   ├── db
│   │   ├── pool.ts        # PostgreSQL pool + helpers
│   │   └── migrations
│   │       └── 001_create_prizes.sql
│   ├── routes
│   │   └── prizes.ts      # REST endpoints
│   └── utils
│       └── validation.ts  # Zod schemas
```

The service uses `helmet` and `cors` for basic security hardening and reads configuration from environment variables so it can run locally, on Render, Railway, or other Node-friendly hosts.

## Next Steps

* Wire the frontend to call this API instead of relying on React state.
* Add authentication middleware to protect management routes.
* Introduce migration tooling (e.g., `node-pg-migrate` or `drizzle-kit`) once the schema starts evolving.
* Capture a spin log table to audit participation and track analytics.
