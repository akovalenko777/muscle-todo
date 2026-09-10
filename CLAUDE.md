# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This is an npm-workspaces monorepo with two independent apps:

- `apps/web` — React 19 + Vite + TypeScript frontend (fresh scaffold, default Vite/React starter content, no routing/state library added yet).
- `apps/api` — NestJS 12 + Prisma 7 + PostgreSQL backend. Kanban domain: `User`, `Task`, `TaskOwner` (many-to-many join table) in `prisma/schema.prisma`; a global `PrismaModule`/`PrismaService` (`src/prisma/`); a `TasksModule` (`src/tasks/`) with DTOs, service, and REST controller.

## Commands

Run from the repo root unless noted.

```bash
# Start Postgres (required before running the API)
docker compose up -d

# Run both apps concurrently in dev mode
npm run dev

# apps/web (run with -w apps/web, or cd apps/web)
npm run dev -w apps/web          # vite dev server
npm run build -w apps/web        # tsc -b && vite build
npm run lint -w apps/web         # eslint .

# apps/api (run with -w apps/api, or cd apps/api)
npm run start:dev -w apps/api    # nest start --watch
npm run build -w apps/api        # nest build
npm run lint -w apps/api         # oxlint src/ test/
npm run format -w apps/api       # prettier --write src/**/*.ts test/**/*.ts
npm run test -w apps/api         # vitest run (unit specs: **/*.spec.ts)
npm run test:watch -w apps/api
npm run test:cov -w apps/api
npm run test:e2e -w apps/api     # vitest run --config vitest.config.e2e.ts (**/*.e2e-spec.ts)

# Run a single test file
npx vitest run src/app.controller.spec.ts -w apps/api   # or plain `cd apps/api && npx vitest run <path>`
```

Prisma (from `apps/api`):
```bash
npx prisma generate     # regenerates client into apps/api/src/generated/prisma
npx prisma migrate dev  # create/apply a migration
npx prisma studio
```
Config lives in `prisma7.config.ts` (Prisma 7's config file, not `schema.prisma`), which reads `DATABASE_URL` from the environment via `dotenv/config`.

## Architecture notes

- **Local Postgres**: `docker-compose.yml` at the root defines a single `postgres:16-alpine` service (user/db `kanban`) on port 5432. `apps/api/.env` must set `DATABASE_URL` pointing at it (see `apps/api/.env.example` for the format).
- **ESM + NodeNext everywhere in `apps/api`**: `package.json` has `"type": "module"`, and `tsconfig.json` uses `module`/`moduleResolution: nodenext`. Relative imports must include the `.js` extension (e.g. `import { AppService } from './app.service.js'`) even though the source files are `.ts`.
- **Linting split**: `apps/api` uses `oxlint` (config in `apps/api/oxlint.json`), not ESLint. `apps/web` uses ESLint's flat config (`apps/web/eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- **Formatting**: `apps/api` uses Prettier (`.prettierrc`: single quotes, trailing commas everywhere). `apps/web` has no Prettier config.
- **Testing**: `apps/api` uses Vitest with two separate configs/commands — unit specs (`vitest.config.ts`, pattern `**/*.spec.ts`, colocated with source) and e2e specs (`vitest.config.e2e.ts`, pattern `**/*.e2e-spec.ts`, under `apps/api/test/`). Both configs resolve TS path aliases via `vite-tsconfig-paths`. `apps/web` has no test setup yet.
- **No observability/tracing configured yet.** The `nest new` scaffold's default `@nestjs/observe` module was removed (it required external cloud credentials, unnecessary for local learning). Revisit as a separate topic later if needed.
- **Prisma 7 client generator outputs TypeScript source, not compiled JS+d.ts** (`generator client { provider = "prisma-client" }` in `schema.prisma`). Two consequences: (1) the `output` path (`../src/generated/prisma`) must live *inside* `src/`, because `tsconfig.build.json` sets `rootDir: "./src"` and `tsc` refuses to compile a `.ts` file that's outside `rootDir` — pointing `output` at `apps/api/generated/` (outside `src`) breaks `nest build`. (2) The generated `PrismaClient` requires an explicit driver adapter — plain `new PrismaClient()` doesn't work; `PrismaService` (`src/prisma/prisma.service.ts`) constructs it with `new PrismaPg({ connectionString: process.env.DATABASE_URL })` from `@prisma/adapter-pg`.
- **`main.ts` loads `.env` itself** via `import 'dotenv/config'` as its first line. Nest does not auto-load `.env` the way `prisma7.config.ts` does for the CLI — omitting this makes `process.env.DATABASE_URL` `undefined` at runtime, which surfaces as a confusing `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` error from `pg`, not a clear "missing env var" error.
- **`PrismaModule` is `@Global()`** (`src/prisma/prisma.module.ts`) — feature modules (e.g. `TasksModule`) inject `PrismaService` without importing `PrismaModule` themselves.
- **Validation**: `ValidationPipe({ whitelist: true, transform: true })` is registered globally in `main.ts`. DTOs use `class-validator` decorators; `UpdateTaskDto` is `PartialType(CreateTaskDto)` from `@nestjs/mapped-types` rather than redeclaring fields.

## Working conventions

- Commit messages: conventional commits (feat:, fix:, chore:, test:, docs:).
- Before considering a backend task "done": tests must pass (`npm run test -w apps/api`), lint must pass (`npm run lint -w apps/api`).
- Always show a plan before writing non-trivial code (multi-file changes, new modules, schema changes).
- Explain key architectural decisions when generating new code, not just the code itself.