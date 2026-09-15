# Ash Wickramasinghe — portfolio

This project is a public, multi-page React + TypeScript + Vite portfolio for Ash Wickramasinghe. The visual direction is dark-first editorial, with a coral accent, optional light mode, fluid typography, scroll reveals, hover states, project detail pages, a view-only CV state, and reduced-motion support.

## Run locally

```bash
npm run dev
```

The app is served on port 5000.

## Deploy to Vercel

This is a Vite SPA and includes `vercel.json` so direct navigation falls back to the app shell. Use:

```bash
npm install
npm run build
```

Set the Vercel output directory to `dist`. The lockfile is generated against the public npm registry so it can be installed outside Replit.

## Content rules

- Use “Ash Wickramasinghe” as the current visible professional name.
- Keep the visible identity focused on Graphic Design, Social Media Management, Digital Content, and Writing.
- Photography and Photographer are not part of the public site.
- Do not invent clients, awards, qualifications, certifications, or work history.
- Public routes include `/`, `/about`, `/services`, `/projects`, `/projects/:slug`, `/writing`, `/cv`, and `/contact`.
- The public app deliberately has no admin navigation, dashboard hint, or public admin dashboard. `/admin` and nested admin paths resolve to the public not-found boundary.

## Later CMS work

Firebase environment placeholders are in `.env.example`. The future private CMS/auth application should be deployed separately from the public experience rather than linked from the main navigation or route tree.