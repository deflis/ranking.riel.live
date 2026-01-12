# Repository Guidelines

このリポジトリでは日本語で回答してください。

## Project Structure & Module Organization
This is a Vite + TanStack Start React app targeting Cloudflare Pages. Core code lives in `src/`, with feature code split into `src/components`, `src/hooks`, and `src/modules`. Routes are file-based under `src/routes` (for example `src/routes/__root.tsx`, `src/routes/index.tsx`, and nested folders like `src/routes/ranking`). Static assets belong in `public/`. Build artifacts are generated into `dist/` and `.output/` and should not be edited. The `app/` folder is reserved for Start routing conventions, but currently minimal.

## Build, Test, and Development Commands
Use pnpm (see `packageManager` in `package.json`).
- `pnpm dev`: start the Vite dev server for local development.
- `pnpm build`: build the production bundle.
- `pnpm start`: run Cloudflare Pages dev against `.output/public`.
- `pnpm deploy`: deploy the Pages build via Wrangler.
- `pnpm lint`: run Biome checks (lint + format).
- `pnpm lint:fix`: apply Biome fixes.
- `pnpm typecheck`: run the TypeScript compiler in no-emit mode.

## Coding Style & Naming Conventions
Formatting and linting are enforced by Biome (`biome.json`). Use tabs for indentation and double quotes in JS/TS. Typescript is strict (`tsconfig.json`), and `@/` is a path alias for `src/`. CSS Modules are used where appropriate (e.g. `*.module.css`). Route files follow TanStack Router conventions in `src/routes`.

## Testing Guidelines
No project-level test runner is configured yet. If you add tests, keep them near the feature (e.g. `src/modules/__tests__/feature.test.ts`) and document the runner in this file.

## Commit & Pull Request Guidelines
Recent commit history uses short, sentence-style messages (often Japanese) without Conventional Commit prefixes. Keep messages concise and descriptive. For pull requests, include a brief summary, verification steps, and screenshots for UI changes; link related issues when available.

## Environment & Configuration Tips
`mise.toml` pins Node to LTS. Cloudflare settings live in `wrangler.jsonc`, and local Pages state may appear in `.wrangler/`.
