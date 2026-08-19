# Fantadex

Monorepo for **Fantadex** — an app to catalogue drinks from multiple brands
(Coca-Cola, Red Bull, Monster, Fanta…) around the world and track the ones
you've tasted.

## Packages

| Package                          | Description                                           |
| -------------------------------- | ----------------------------------------------------- |
| [`apps/backend`](./apps/backend) | REST API host (Hono + @hono/node-server)              |
| [`apps/mobile`](./apps/mobile)   | React Native / Expo app                               |
| [`packages/api`](./packages/api) | Shared API (Hono, better-auth, Drizzle, Postgres, S3) |

## Getting started

```bash
pnpm install                          # installs all packages + Git hooks
cp .env.local.example .env.local      # local config (matches docker defaults)
pnpm env-symlink                      # symlink .env.local to apps and packages
pnpm docker:up                        # start Postgres + RustFS (S3)
# Create the S3 bucket (once). See packages/api/README.md → "Create the
# storage bucket" for console / AWS CLI / mc instructions.
pnpm db:migrate                       # create tables
pnpm seed                             # seed brands, countries, drinks, users (needs the bucket)
pnpm dev                              # run the backend API + mobile app
```

## Environments

Config is loaded from a single `.env` file at the repo root. Copy the committed
`.env.example` template, fill in the values, then run the API:

```bash
pnpm --filter @fantadex/backend start
```

The real `.env` file is git-ignored; only the `.env.example` template is
committed.

## Quality gate

A [Husky](https://typicode.github.io/husky/) pre-commit hook
([.husky/pre-commit](.husky/pre-commit)) runs **typecheck**, **Prettier format
check**, and **ESLint** across the workspace before each commit and blocks the
commit if any fail.
