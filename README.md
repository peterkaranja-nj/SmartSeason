#  SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

**Stack:** Node.js + Express · React · PostgreSQL · JWT Auth

---

## Demo Credentials

| Role      | Email                        | Password   |
|-----------|------------------------------|------------|
| Admin     | admin@smartseason.com        | admin123   |
| Agent     | james@smartseason.com        | agent123   |
| Agent     | amina@smartseason.com        | agent123   |
| Agent     | kwame@smartseason.com        | agent123   |
| Agent     | ngangi@smartseason.com       | agent123   |  
---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo

```bash
git clone https://github.com/yourname/smartseason.git
cd smartseason
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/smartseason
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
```

### 3. Create the database

```bash
psql -U postgres -c "CREATE DATABASE smartseason;"
```

### 4. Install dependencies

```bash
# From repo root:
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run migrations and seed data

```bash
cd backend
npm run migrate   # creates tables
npm run seed      # populates demo data
```

### 6. Start the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev       # runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start         # runs on http://localhost:3000
```

Open **http://localhost:3000** and sign in.

---

## API Reference

| Method | Endpoint                    | Access | Description                     |
|--------|-----------------------------|--------|---------------------------------|
| POST   | `/api/auth/login`           | Public | Login, returns JWT              |
| GET    | `/api/auth/me`              | Auth   | Get current user                |
| GET    | `/api/dashboard`            | Auth   | Role-aware dashboard stats      |
| GET    | `/api/fields`               | Auth   | List fields (scoped by role)    |
| GET    | `/api/fields/:id`           | Auth   | Get field + update history      |
| POST   | `/api/fields`               | Admin  | Create field                    |
| PUT    | `/api/fields/:id`           | Admin  | Update field metadata           |
| DELETE | `/api/fields/:id`           | Admin  | Delete field                    |
| POST   | `/api/fields/:id/updates`   | Auth   | Log stage update + notes        |
| GET    | `/api/users`                | Admin  | List agents                     |
| POST   | `/api/users`                | Admin  | Create agent                    |
| DELETE | `/api/users/:id`            | Admin  | Remove agent                    |

---

## Design Decisions

### Field Status Logic

Each field has a computed `status` derived from its `stage` and `planting_date`. This is calculated server-side on every request (no stored column), ensuring it always reflects current time.

**Rules:**

| Status      | Condition                                                                 |
|-------------|---------------------------------------------------------------------------|
| `completed` | Stage is `harvested`                                                      |
| `at_risk`   | Stage has stalled beyond expected maximum duration for that stage         |
| `active`    | All other fields progressing normally                                     |

**Stage time thresholds (days in stage before flagging at-risk):**

| Stage     | Max Days |
|-----------|----------|
| planted   | 21       |
| growing   | 90       |
| ready     | 14       |

These are configurable in `backend/src/models/fieldStatus.js`.

### Authentication

JWT Bearer tokens stored in `localStorage`. Tokens expire after 7 days. An Axios interceptor automatically attaches the token to every request and redirects to `/login` on 401 responses.

### Role-based Access

Two roles: `admin` (Coordinator) and `agent` (Field Agent).

- **Admin**: full CRUD on fields, can assign agents, sees all fields in dashboard and lists
- **Agent**: can only view and update their assigned fields; cannot create/delete fields or manage users

Access is enforced both in the frontend routing and in backend middleware (`requireAdmin`).

### Separation of Concerns

```
backend/
  controllers/   — business logic per resource
  middleware/    — auth + role guards
  models/        — computed logic (fieldStatus.js)
  routes/        — route definitions only
  config/        — db connection, migrations, seed

frontend/
  pages/         — full-page views
  components/    — reusable UI pieces
  context/       — global auth state (React Context)
  utils/         — Axios instance with interceptors
```

### Data Model

Three tables:
- `users` — id, name, email, password_hash, role
- `fields` — id, name, crop_type, planting_date, area_hectares, location, stage, assigned_agent_id
- `field_updates` — id, field_id, agent_id, previous_stage, new_stage, notes, created_at

`field_updates` provides an immutable audit log of every stage transition.

---

## Assumptions

- A field can only be assigned to one agent at a time
- Stage progression is forward-only in the UI (planted → growing → ready → harvested), though the API accepts any valid stage value
- Status is computed at read time; no scheduled jobs required
- "Area" and "Location" are optional metadata fields
- Admins can also submit field updates (useful for direct overrides)
- Passwords are hashed with bcrypt (cost factor 10); no password reset flow is included in this version

