# Repository Guidelines

このリポジトリでは日本語で回答してください。

## Project Structure & Module Organization
This is a Vite + TanStack Start React app targeting Cloudflare Pages. Core code lives in `src/`, with feature code split into `src/components`, `src/hooks`, and `src/modules`. Routes are file-based under `src/routes` (for example `src/routes/index.tsx`, and nested folders like `src/routes/ranking`).

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
No project-level test runner is configured yet.

## Commit & Pull Request Guidelines
- コミットメッセージは、日本語で生成してください。
- 体言止めを使用してください。
- 複数の変更があるときは、修正したコンポーネントの名前を含む短く簡潔かつ網羅的な概要を1行目に、必要なら詳細を3行目以降に箇条書きで書いてください。
- 詳細も同じ内容になるなら、1行だけにしてください。

例:1行だけの場合
```
コンポーネントのタイトルの変数名を `title` から `componentTitle` に変更
```

例:複数行の場合
```
概要画面のタイトルの変数名を修正

- タイトルの変数名を `title` から `componentTitle` に変更
- 関連するテストケースも更新
```
