# DTI — Don't Trash It

AI-powered upcycling platform: photograph an unwanted object and discover creative,
eco-friendly ways to reuse it. This repository holds the **frontend**
(Angular + Tailwind CSS) with a working photo-to-ideas flow connected to
the DTI backend. Authentication is intentionally out of scope for now.

## Stack

- Angular 21 (standalone components, Router, signals) + TypeScript (strict)
- Tailwind CSS v4 (PostCSS plugin, CSS-first `@theme` tokens)
- Lucide icons via `lucide-angular` (central registry in `src/app/shared/icons.ts`)
- HTTP via Angular `HttpClient` (`src/app/services/api.service.ts`)
- Unit tests with Vitest (`npm test`)

## Prerequisites

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0` (Angular 21 requirement)
- npm 11 (see `packageManager` in `package.json`)

## Commands

```sh
npm install        # install dependencies
npm start          # dev server → http://localhost:4200/
npm run build      # production build → dist/dti/
npm test           # unit tests (Vitest, single run: npm test -- --watch=false)
npm run lint       # ESLint (Angular + TypeScript + template a11y)
npm run format     # Prettier write (check only: npm run format:check)
npm run typecheck  # TypeScript check (app + specs; build also checks templates)
```

## Project structure

```text
src/
  app/
    core/                 # app-wide constants & future configuration
    shared/
      icons.ts            # Lucide icon registry (register once, use anywhere)
      format.ts           # shared display helpers
      components/         # navbar, footer
    services/
      api.service.ts      # backend client (photo upload, ideas, image URLs)
    features/
      home/               # landing page + upload, AI results, tutorial modal
      results/            # empty state shown before ideas are generated
      how-it-works/       # process explanation
    app.config.ts         # router (scroll restoration), icons, zoned change detection
    app.routes.ts         # lazy-loaded routes
  styles.css              # Tailwind v4 theme + global foundation
```

## Behavior notes

- The upload area previews locally (FileReader); "Generate Ideas" sends the photo
  to `POST http://127.0.0.1:3000/api/ai/generate-ideas` (backend must be running).
- The `/results` page is an honest empty state — no fake AI output.
- No API keys or secrets exist in this project: `MODEL_API_KEY` lives on the
  backend only; the frontend uploads photos and displays results.
