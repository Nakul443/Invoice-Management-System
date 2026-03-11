## Invoice Management System

An end-to-end **Invoice Management System** consisting of a React + Vite frontend and a Node.js/Express + Prisma + PostgreSQL backend. It supports user authentication and full invoice lifecycle management (creation, listing, payment tracking, archiving, etc.).

---

### Project structure

- **Root**
  - `backend/` – Node.js/Express API, Prisma models & migrations
  - `frontend/` – React (TypeScript) SPA built with Vite and Tailwind CSS
  - `.vscode/` – Workspace/editor settings

- **Backend**
  - `src/index.ts` – Express server entrypoint
  - `src/controllers/` – Route handlers (e.g. invoices, auth)
  - `src/routes/` – API route definitions
  - `src/middleware/` – Auth and other middleware
  - `prisma/schema.prisma` – Database schema (User, Invoice, InvoiceLine, Payment, Status enum)
  - `prisma/migrations/` – Schema migrations
  - `.env` – Backend environment variables (see below)

- **Frontend**
  - `src/pages/` – Pages such as `Dashboard`, `InvoiceDetail`, `Login`, `Register`
  - `src/services/api.ts` – API client helpers
  - `src/types/` – Shared TypeScript types (e.g. `invoice.ts`)
  - `src/index.css` – Tailwind CSS entrypoint
  - `tailwind.config.js`, `postcss.config.js` – Tailwind/PostCSS configuration

---

### Tech stack

- **Frontend**
  - React 19 (TypeScript)
  - Vite
  - React Router
  - Tailwind CSS
  - `html2canvas`, `jspdf` for PDF/export features

- **Backend**
  - Node.js (ES modules)
  - Express 5
  - Prisma ORM
  - PostgreSQL
  - JSON Web Tokens (JWT) for authentication
  - bcrypt for password hashing

---

### Prerequisites

- Node.js (LTS recommended)
- npm
- A running PostgreSQL instance

---

### Backend setup

From the repository root:

```bash
cd backend
npm install
```

#### Environment variables

Backend expects a `.env` file in `backend/` with at least:

```bash
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/invoice_management_db?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

- **DATABASE_URL**: PostgreSQL connection string (adjust user/password/host/port/db to your local setup).
- **JWT_SECRET**: Secret used to sign JWT tokens.
- **PORT**: Port the Express server listens on (defaults to `5000` if omitted).

#### Database migration

Apply Prisma migrations to set up the database schema:

```bash
cd backend
npx prisma migrate deploy
```

You can also inspect or evolve the schema via `prisma/schema.prisma`.

#### Running the backend

Development:

```bash
cd backend
npm run dev
```

Production build & start:

```bash
cd backend
npm run build
npm start
```

The API will be available at `http://localhost:5000` by default, with main routes under:

- `/api/auth`
- `/api/invoices`
- `/health` (simple health check)

---

### Frontend setup

From the repository root:

```bash
cd frontend
npm install
```

#### Running the frontend (dev)

```bash
cd frontend
npm run dev
```

By default Vite serves the app at `http://localhost:5173` (or the next available port). Ensure the backend is running so API requests succeed.

#### Building the frontend

```bash
cd frontend
npm run build
```

Optional preview of the production build:

```bash
cd frontend
npm run preview
```

---

### Common scripts (summary)

- **Backend**
  - `npm run dev` – Start Express server with live reload (nodemon + ts-node)
  - `npm run build` – Transpile TypeScript to `dist/`
  - `npm start` – Run compiled server from `dist/index.js`
  - `npm run seed` – Run data seed script (`src/seed.ts`) if implemented

- **Frontend**
  - `npm run dev` – Start Vite dev server
  - `npm run build` – Type-check and create production build
  - `npm run preview` – Preview built frontend
  - `npm run lint` – Run ESLint on the frontend codebase

---

### Development workflow

1. Start PostgreSQL and ensure `DATABASE_URL` is reachable.
2. In `backend/`, install dependencies, run migrations, then start the dev server (`npm run dev`).
3. In `frontend/`, install dependencies and start the Vite dev server (`npm run dev`).
4. Access the app in your browser (default `http://localhost:5173`), register/login, and manage invoices.

---

### Notes

- Tailwind CSS is configured via `frontend/src/index.css` and `tailwind.config.js`.
- JWT-based authentication is enforced via middleware in `backend/src/middleware/authMiddleware.ts`.
- Schema changes require updating `prisma/schema.prisma` and generating/applying migrations with Prisma.
