# DTI — Don't Trash It

AI-powered upcycling platform: photograph an unwanted object and discover creative,
eco-friendly ways to reuse it. This repository currently holds the **frontend
foundation** (Angular + Tailwind CSS) with a polished landing page. AI integration,
backend, and authentication are intentionally out of scope for now.

## Stack

- Angular 21 (standalone components, Router, signals) + TypeScript (strict)
- Tailwind CSS v4 (PostCSS plugin, CSS-first `@theme` tokens)
- Lucide icons via `lucide-angular` (central registry in `src/app/shared/icons.ts`)
- Unit tests with Vitest (`npm test`)

## Prerequisites

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0` (Angular 21 requirement)
- npm 11 (see `packageManager` in `package.json`)

## Commands

```sh
npm install   # install dependencies
npm start     # dev server → http://localhost:4200/
npm run build # production build → dist/dti/
npm test      # unit tests (Vitest, single run: npm test -- --watch=false)
```

## Project structure

```text
src/
  app/
    core/                 # app-wide constants & future configuration
    shared/
      icons.ts            # Lucide icon registry (register once, use anywhere)
      components/         # navbar, footer
    features/
      home/               # landing page + upload prototype (local preview only)
      results/            # placeholder for the future suggestions interface
      how-it-works/       # process explanation + project roadmap
    app.config.ts         # router (scroll restoration), icons, zoned change detection
    app.routes.ts         # lazy-loaded routes
  styles.css              # Tailwind v4 theme + global foundation
```

## Prototype notes

- The upload area shows a **local-only preview** (FileReader, no server involved);
  the "Analyze with AI" action stays disabled until a backend exists.
- The `/results` page is an honest empty state — no fake AI output.
- No API keys, secrets, or backend code exist in this project yet.
