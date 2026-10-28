# DTI — Règles frontend (Angular)

> Périmètre : ce dépôt uniquement. Règles communes : lire `../AGENTS.md`
> (principes, efficacité, secrets, frontières).
> Efficacité : ne pas réanalyser le projet — partir de ce fichier, ouvrir
> uniquement les fichiers concernés, élargir seulement si nécessaire.

## Stack (vérifiée)

- Angular 21.2 (standalone partout), TypeScript 5.9 strict, RxJS 7.8.
- Tailwind CSS v4 (plugin PostCSS, tokens CSS-first dans `src/styles.css`).
- `lucide-angular` via registre central `src/app/shared/icons.ts` (`APP_ICONS`).
- Tests : Vitest via `ng test` (TestBed, 4 specs).
- Lint : angular-eslint (recommended + template + accessibilité), Prettier.

## Architecture réelle

- `src/app/core/` : constantes applicatives (`app-info.ts`).
- `src/app/shared/` : `icons.ts` + `components/{navbar,footer}/`.
- `src/app/features/{home,results,how-it-works}/` : un dossier par page.
- `app.config.ts` : providers (routeur + restauration du scroll, icônes, zone).
- `app.routes.ts` : routes lazy (`loadComponent`) avec `title`.
- `main.ts` : `bootstrapApplication(App, appConfig)`.
- Composants standalone, **sans suffixe `Component`** (convention `addTypeToClassName: false`), `templateUrl` externe, sélecteur `app-*` en kebab-case.
- Templates : syntaxe moderne (`@if`, `@for` avec `track`), signaux (`signal()`).

## Conventions

- TypeScript strict : `import type` séparé pour les types, pas de `any` implicite.
- Imports : externes d'abord, puis relatifs, groupes séparés par une ligne vide.
- Styles : classes utilitaires Tailwind dans les templates ; tokens `forest/leaf/cream` via `@theme` ; ne pas casser `styles.css` ; pas de styles JS inline.
- Réutiliser `Navbar`, `Footer`, `APP_ICONS`, `APP_INFO` avant de créer.
- Aucun appel HTTP ni `ApiService` pour l'instant ; aucun usage de `@angular/forms` (inputs natifs + handlers). Si ajoutés : service dédié + intercepteur Bearer, URL backend `http://127.0.0.1:3000` en dev, reactive forms de préférence.
- UX : suivre les patterns existants — signal `errorMessage` + `role="alert"`, page vide honnête (`results`), bouton désactivé documenté.
- Accessibilité et responsive : conserver le niveau actuel (skip link, `aria-hidden` sur icônes décoratives, labels, `:focus-visible`, `prefers-reduced-motion`, breakpoints `sm/md/lg`).
- Pas de fichiers d'environnement Angular ; en aucun cas des secrets côté frontend.

## Commandes (vérifiées, depuis `DTI/`)

- `npm start` (dev :4200), `npm run build` (prod, vérifie aussi les templates), `npm test` (+ `-- --watch=false` pour un run unique).
- `npm run lint` / `lint:fix`, `npm run format` / `format:check`, `npm run typecheck` (tsc app + specs, hors templates).
