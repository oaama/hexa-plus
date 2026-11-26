# HEXA PLUS

**Developed by Eng. Angelo Rezq**

HEXA PLUS is a bilingual agency website and business management platform. It combines public-facing company pages with a private workspace for the agency's day-to-day operations.

## Features

- Arabic and English public pages for the company, services, portfolio, industries, process, careers, FAQs, and contact.
- Inquiry forms and public content management.
- Private workspace modules for leads, projects, tasks, team members, files, invoices, payments, and expenses.
- Campaign and content records, notifications, audit history, reporting, and website settings.
- Supabase authentication, PostgreSQL data, private file storage, and row-level access policies.

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Radix UI components
- Supabase Auth, PostgreSQL, Storage, and Realtime
- React Hook Form, Zod, Recharts, Framer Motion, and PDF-lib

## Local development

Use Node.js 22 or newer.

```bash
npm ci
```

Create a local `.env.local` file with the values for the configured Supabase project and site origin:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVER_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public client key used by this application. `SUPABASE_SERVER_KEY` is server-only. Never expose it in browser code or commit its value.

Apply the SQL files in `supabase/migrations/` in filename order using an authorized database administrator connection. On a new environment, `npm run seed` can add the initial service catalog and approved public identity copy. Do not run database setup or QA scripts against populated production data without reviewing their effects first.

Start the development server:

```bash
npm run dev
```

## Checks

```bash
npm test
npm run typecheck
npm run build
```

The repository also includes integration, browser, Arabic-language, accessibility-related, and release-check scripts. Some integration and cleanup scripts create or remove temporary Supabase records, so use a dedicated test project when possible.

## Deployment

The application can run as a Node.js web service. Configure the required environment variables in the hosting provider, run `npm ci && npm run build`, then start the app with `npm start`. Keep database credentials and all server-only keys in the provider's secret settings, not in source control.

## Repository layout

- `src/app/` - public pages, dashboard routes, and API endpoints
- `src/components/` - website and workspace UI
- `src/lib/` - shared data, authentication, validation, and business logic
- `supabase/migrations/` - database schema and security policies
- `scripts/` and `tests/` - setup, verification, and QA tools
