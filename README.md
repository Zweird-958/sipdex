# Fantadex

Monorepo for **Fantadex** — an app to catalogue Fanta flavours from around the
world and track the ones you've tasted.

## Packages

| Package                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| [`backend`](./backend) | REST API (Hono, better-auth, Drizzle, Postgres, Minio) |

A React Native / Expo app will be added later.

## TODO

- [ ] Add a React Native / Expo app
- [ ] Add a web app (Vite + React + Tailwind)
- [ ] Verify email
- [ ] Handle zValidator errors in a more user-friendly way
- [ ] Don't show all information about the user in sign-in
- [ ] Create config file instead of env
- [ ] Country form should accept other languages (e.g. "Deutschland" for Germany)

## Getting started

```bash
pnpm install          # installs all packages + Git hooks
pnpm docker:up        # start Postgres + Minio
pnpm db:migrate       # create tables
pnpm dev              # run the backend API
```

All scripts run from the repo root and proxy to the relevant package (e.g.
`pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm format`, `pnpm make-admin`).
See [backend/README.md](./backend/README.md) for full docs.

## Quality gate

A [Husky](https://typicode.github.io/husky/) pre-commit hook
([.husky/pre-commit](.husky/pre-commit)) runs **typecheck**, **Prettier format
check**, and **ESLint** across the workspace before each commit and blocks the
commit if any fail.
