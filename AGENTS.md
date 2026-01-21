# Repository Guidelines

This repository is a small TypeScript/Express app using Handlebars views and
static CSS.

## Project Structure & Module Organization

- `src/main.ts` is the entry point; it wires auth and starts the server.
- HTTP setup and routing live under `src/express.ts`, `src/routes/`, and
  `src/controllers/`.
- Cross-cutting concerns sit in `src/middleware/`, with data models in
  `src/models/` and helpers in `src/managers/`.
- UI templates are Handlebars files in `src/views/` (`layouts/`, `partials/`,
  `notes/`), with static assets in `src/public/css/`.
- Build output goes to `dist/`; static assets and views are copied there on build.

## Build, Test, and Development Commands

- `npm i`: install dependencies.
- `npm run dev`: start the app with `tsx` in watch mode (also watches `.hbs` and
  `.css`).
- `npm run build`: compile TypeScript to `dist/` and copy views/assets.
- `npm run build:run`: build then run `node dist/main.js` (script invokes `pnpm`,
  so ensure `pnpm` is available or adjust the script).

## Coding Style & Naming Conventions

- TypeScript ESM is required; keep `.js` extensions in imports (NodeNext).
- Use 4-space indentation and keep functions small and focused.
- Use `camelCase` for variables/functions, `PascalCase` for types/classes.
- Prefer explicit types for module boundaries; keep comments short and useful.

## Testing Guidelines

- No automated test runner is configured yet.
- For new tests, prefer `*.test.ts` naming and add a `tests/` or `src/__tests__/`
  folder alongside a matching npm script.

## Commit & Pull Request Guidelines

- Git history uses short, lowercase summaries (e.g., `updated packages`);
  keep messages brief and descriptive.
  template/CSS changes.

## Configuration & Security Tips

- The server defaults to port `5000`; keep port changes centralized in
  `src/main.ts`.
- Default auth credentials are hardcoded for local use; move to environment
  variables before deploying.
