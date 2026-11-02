# DTI — Frontend Rules (Angular)

> Scope: This repository only. Shared rules: read `../AGENTS.md` (principles, efficiency, secrets, boundaries).
> Efficiency: Do not reanalyze the entire project. Start with this file, open only the relevant files, and expand the scope only when necessary.

## Verified Stack

- Angular 21.2 (standalone everywhere), TypeScript 5.9 strict, RxJS 7.8.
- Tailwind CSS v4 (PostCSS plugin, CSS-first tokens in `src/styles.css`).
- `lucide-angular` through the central registry `src/app/shared/icons.ts` (`APP_ICONS`).
- Tests: Vitest via `ng test` (TestBed, 4 specs).
- Linting: angular-eslint (recommended + template + accessibility), Prettier.

## Actual Architecture

- `src/app/core/`: application constants (`app-info.ts`).
- `src/app/shared/`: `icons.ts` + `components/{navbar,footer}/`.
- `src/app/features/{home,results,how-it-works,generated-ideas}/`: one directory per page.
- `app.config.ts`: providers (router + scroll restoration, icons, zone).
- `app.routes.ts`: lazy-loaded routes (`loadComponent`) with `title`.
- `main.ts`: `bootstrapApplication(App, appConfig)`.
- `services/api.service.ts`: HTTP client (`HttpClient` provided in `app.config.ts`), multipart uploads, image URLs; `shared/format.ts`: display helpers; `home/tutorial-modal/`: tutorial modal.
- Standalone components, **without the `Component` suffix** (convention: `addTypeToClassName: false`), external `templateUrl`, `app-*` kebab-case selectors.
- Templates: modern syntax (`@if`, `@for` with `track`), signals (`signal()`).

## Conventions

- Strict TypeScript: separate `import type` imports for types; no implicit `any`.
- Imports: external imports first, then relative imports, with groups separated by a blank line.
- Styles: Tailwind utility classes in templates; `forest/leaf/cream` tokens via `@theme`; do not break `styles.css`; no inline JavaScript styles.
- Reuse `Navbar`, `Footer`, `APP_ICONS`, and `APP_INFO` before creating new ones.
- HTTP requests must go through `ApiService` only (base URL: `http://127.0.0.1:3000` in development; no interceptor for now). Do not use `@angular/forms` (use native inputs + handlers); if forms are added, prefer reactive forms.
- UX: follow existing patterns — `errorMessage` signal + `role="alert"`, honest empty states (`results`), documented disabled buttons, tutorial modal (button + backdrop + Escape key to close).
- Accessibility and responsiveness: maintain the current level (skip link, `aria-hidden` on decorative icons, labels, `:focus-visible`, `prefers-reduced-motion`, `sm/md/lg` breakpoints).
- No Angular environment files; frontend secrets are strictly prohibited under all circumstances.

## Commands (Verified, Run from `DTI/`)

- `npm start` (development server: `:4200`), `npm run build` (production build, also validates templates), `npm test` (+ `-- --watch=false` for a single run).
- `npm run lint` / `lint:fix`, `npm run format` / `format:check`, `npm run typecheck` (tsc app + specs, excluding templates).