# Backend (Express + MongoDB)

This folder contains the full admin + public API backend.

## Stack

- Node.js + Express
- MongoDB with Mongoose
- dotenv for environment variables
- JWT auth + bcrypt hashing
- Nodemailer template-based emails
- Joi input validation
- CORS enabled

## Structure

- `src/models`: MongoDB models
- `src/controllers`: route handlers
- `src/routes`: API routes
- `src/middleware`: auth, validation, upload
- `src/validators`: Joi schemas
- `src/seed`: default admin + email templates seeding

## Environment Variables

Copy `.env.example` to `.env` in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/landing-page
JWT_SECRET=replace-with-strong-secret
FRONTEND_URL=http://localhost:3000
ADMIN_ALERT_EMAIL=mohit@mailinator.com
EMAIL_FROM=no-reply@landing-page.local
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

Default seeded admin:
- Email: `mohit@mailinator.com`
- Password: `123123123`

## Run

Use root commands only:

```bash
npm install
npm run dev:backend
```

## Main APIs

- Auth: `/api/auth/*`
- Projects CRUD: `/api/projects/*`
- About CRUD: `/api/about/*`
- Social Links CRUD: `/api/social-links/*`
- Queries: `/api/queries/*`
- Theme Settings: `/api/theme/*`
- Analytics: `/api/analytics/*`
