# Admin panel (`src/features/admin`)

Neon dark UI for the portfolio admin. All business logic is unchanged; only structure and styling were refactored.

## Folder structure

```
admin/
├── admin.css              # Theme tokens, glow cards, scrollbar
├── charts.ts              # Chart.js registration
├── constants.ts           # Nav items, theme presets, chart options
├── types.ts
├── utils.ts
├── context/
│   └── AdminContext.tsx   # Provider + useAdmin()
├── hooks/
│   └── useAdminPage.ts    # State, API calls, filters, chart data
├── components/
│   ├── layout/
│   │   ├── AdminShell.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminLogin.tsx
│   │   └── AdminLoading.tsx
│   └── ui/
│       ├── AdminCard.tsx
│       ├── AdminInput.tsx
│       ├── AdminButton.tsx
│       ├── AdminBadge.tsx
│       ├── StatCard.tsx
│       ├── AdminListToolbar.tsx
│       └── AdminNotice.tsx
└── sections/
    ├── DashboardSection.tsx
    ├── ProjectsSection.tsx
    ├── AboutSection.tsx
    ├── SocialSection.tsx
    ├── QueriesSection.tsx
    ├── ThemeSection.tsx
    ├── HeroSection.tsx
    └── AnalyticsSection.tsx
```

## Entry point

`frontend/app/admin/page.tsx` — wraps `AdminProvider` and renders login / shell.
