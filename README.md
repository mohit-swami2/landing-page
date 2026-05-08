# Landing Page (Single Full-Stack Project)

This repository is now structured as one project with:

- `frontend/` for the Next.js app
- `backend/` for the Express + MongoDB API
- one root `package.json` to run everything

## Project Structure

- `frontend/app` - Next.js app router files
- `frontend/src/features/portfolio` - portfolio UI feature code
- `backend/src` - API server, routes, DB config

## Install

```bash
npm install
```

## Run

- Run both frontend + backend together:

```bash
npm run dev
```

- Run only frontend:

```bash
npm run dev:frontend
```

- Run only backend:

```bash
npm run dev:backend
```

## Build Frontend

```bash
npm run build
```

## Admin Dashboard

- URL: `http://localhost:3000/admin`
- Seeded login on first backend run:
  - Email: `mohit@mailinator.com`
  - Password: `123123123`

## Backend Environment

Copy `backend/.env.example` to `backend/.env` and adjust SMTP/JWT values.

## Vercel (Two-Project Setup)

Use two separate Vercel projects:

- Frontend project root: `frontend/`
- Backend project root: `backend/`

Required environment variables:

- Frontend (`frontend` project):
  - `NEXT_PUBLIC_API_BASE=https://<your-backend-domain>/api`
- Backend (`backend` project):
  - `MONGODB_URI=...`
  - `JWT_SECRET=...`
  - `FRONTEND_URL=https://<your-frontend-domain>`
  - `ADMIN_ALERT_EMAIL=...`
  - `EMAIL_FROM=...`
  - `SMTP_HOST=...`
  - `SMTP_PORT=587`
  - `SMTP_SECURE=false`
  - `SMTP_USER=...`
  - `SMTP_PASS=...`
