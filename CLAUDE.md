# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This is an npm-workspaces monorepo with two independent apps:

- `apps/web` — React 19 + Vite + TypeScript frontend (fresh scaffold, default Vite/React starter content, no routing/state library added yet).
- `apps/api` — NestJS 12 + Prisma 7 + PostgreSQL backend (fresh `nest new` scaffold, default `AppController`/`AppService` only, no domain models yet).

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
npx prisma generate     # regenerates client into apps/api/generated/prisma
npx prisma migrate dev  # create/apply a migration
npx prisma studio
```
Config lives in `prisma7.config.ts` (Prisma 7's config file, not `schema.prisma`), which reads `DATABASE_URL` from the environment via `dotenv/config`. The schema itself (`prisma/schema.prisma`) only declares the generator/datasource — no models yet.

## Architecture notes

- **Local Postgres**: `docker-compose.yml` at the root defines a single `postgres:16-alpine` service (user/db `kanban`) on port 5432. `apps/api/.env` must set `DATABASE_URL` pointing at it (see `apps/api/.env.example` for the format).
- **ESM + NodeNext everywhere in `apps/api`**: `package.json` has `"type": "module"`, and `tsconfig.json` uses `module`/`moduleResolution: nodenext`. Relative imports must include the `.js` extension (e.g. `import { AppService } from './app.service.js'`) even though the source files are `.ts`.
- **Linting split**: `apps/api` uses `oxlint` (config in `apps/api/oxlint.json`), not ESLint. `apps/web` uses ESLint's flat config (`apps/web/eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- **Formatting**: `apps/api` uses Prettier (`.prettierrc`: single quotes, trailing commas everywhere). `apps/web` has no Prettier config.
- **Testing**: `apps/api` uses Vitest with two separate configs/commands — unit specs (`vitest.config.ts`, pattern `**/*.spec.ts`, colocated with source) and e2e specs (`vitest.config.e2e.ts`, pattern `**/*.e2e-spec.ts`, under `apps/api/test/`). Both configs resolve TS path aliases via `vite-tsconfig-paths`. `apps/web` has no test setup yet.
- **No observability/tracing configured yet.** The `nest new` scaffold's default `@nestjs/observe` module was removed (it required external cloud credentials, unnecessary for local learning). Revisit as a separate topic later if needed.
