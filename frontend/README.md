# Frontend (Next.js)

This folder contains the migrated portfolio frontend in Next.js with the same static content and visual design intent as the original project.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Motion (`motion/react`)
- Lucide React icons

## Structure

- `app/layout.tsx`: global layout and metadata
- `app/page.tsx`: homepage route
- `app/globals.css`: global styles and Tailwind import
- `src/features/portfolio/PortfolioPage.tsx`: main client-rendered page UI

## Install & Run

Use root commands only:

```bash
npm install
npm run dev:frontend
```

## Performance Notes

- Client UI is split by feature folder for maintainability.
- Static content is kept in constants for easier future API integration.
- Next.js routing/build pipeline is in place for production optimization.

## Admin

- Login page: `/admin`
- Password reset page: `/admin/reset-password`
