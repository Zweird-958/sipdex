# Fantadex — Backend

REST API for **Fantadex**, an app to catalogue drink flavours from around the
world and track the ones you've tasted. Anyone can browse the catalogue; signed-in
users keep a personal "tasted" list; admins curate drinks, brands, and countries.

The API is framework-agnostic on the client side and is built to be consumed by
an **Expo** mobile app (bearer-token auth, permissive CORS, public image URLs).

All application routes are mounted under the `/api` base path and return a
consistent envelope: successful responses are `{ "result": …, "meta": {} }` and
errors are `{ "error": "message", "key": "ERROR_KEY" }`.

---

## Table of contents

- [Stack](#stack)
- [Features & permissions](#features--permissions)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Authentication](#authentication)
- [API reference](#api-reference)
- [Testing with Bruno](#testing-with-bruno)
- [Notes for the Expo app](#notes-for-the-expo-app)
- [Troubleshooting](#troubleshooting)

---

## Stack

| Concern        | Choice                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| HTTP framework | [Hono](https://hono.dev/) on the Node runtime                            |
| Auth           | [better-auth](https://better-auth.com/) (email/password, roles, bearer)  |
| ORM / DB       | [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL 18                 |
| Validation     | [Zod](https://zod.dev/)                                                  |
| Object storage | [RustFS](https://rustfs.com/) (S3-compatible) via the AWS SDK for images |
| Country data   | [i18n-iso-countries](https://www.npmjs.com/package/i18n-iso-countries)   |
| API testing    | [Bruno](https://www.usebruno.com/) collection (`./bruno`)                |
| Lint / format  | ESLint (typescript-eslint) + Prettier                                    |

---

## Features & permissions

| Capability                                               | Anonymous | User | Admin |
| -------------------------------------------------------- | :-------: | :--: | :---: |
| Browse the full drink list                               |    ✅     |  ✅  |  ✅   |
| View a drink's detail (flavour, brand, countries, image) |    ✅     |  ✅  |  ✅   |
| See a `tasted` flag on each drink                        |     —     |  ✅  |  ✅   |
| Add / remove a drink from the tasted list                |     —     |  ✅  |  ✅   |
| View own tasted list                                     |     —     |  ✅  |  ✅   |
| Browse the brand list                                    |    ✅     |  ✅  |  ✅   |
| Create a country                                         |     —     |  —   |  ✅   |
| Create a brand (name + logo)                             |     —     |  —   |  ✅   |
| Create a drink (image + brand + countries + flavour)     |     —     |  —   |  ✅   |

Roles come from better-auth's admin plugin. New accounts default to `user`; see
[Authentication](#authentication) for promoting an admin.

---

## Monorepo layout

This package lives at `backend/` inside the `fantadex` **pnpm workspace**. Run
`pnpm install` once at the repo root (`fantadex/`) — it installs every package
and sets up the Git hooks. Every command below can be run either from the repo
root (root scripts proxy to this package) or from inside `backend/`. Examples
use the `backend/` form.

---

## Prerequisites

- **Node 20+** and **pnpm**
- **Docker** + Docker Compose (runs PostgreSQL 18 and RustFS locally)

---

## Quick start

```bash
# From the repo root (fantadex/): installs all packages + Git hooks
pnpm install

# Local config (matches the docker-compose defaults). Adjust if a port is taken.
cp .env.local.example .env.local

# Start PostgreSQL 18 and RustFS (data persists under ./data)
pnpm docker:up

# Create the S3 bucket images are stored in (see "Create the storage bucket").
# Only needed once — the data volume persists it afterwards.

# Create the database tables
pnpm db:migrate

# (Optional) seed countries, brands, drinks, users, and some tastings.
# Requires the bucket to exist first (seed uploads real images).
pnpm seed

# Run the API with hot reload
pnpm dev
```

> All of the above also work from the repo root (e.g. `pnpm docker:up`,
> `pnpm db:migrate`, `pnpm dev`) thanks to the root orchestration scripts.

The API is now on **http://localhost:3000** (or whatever `PORT` you set), with
all routes under `/api`. Quick check:

```bash
curl http://localhost:3000/            # {"name":"fantadex-backend","status":"ok"}
curl http://localhost:3000/api/drinks  # {"result":[],"meta":{}}
```

`pnpm seed` creates two ready-to-use accounts (both password `Password123!`):

| Role  | Email               |
| ----- | ------------------- |
| Admin | `admin@fantadex.io` |
| User  | `user@fantadex.io`  |

Service endpoints:

| Service         | URL                       |
| --------------- | ------------------------- |
| API             | http://localhost:3000/api |
| PostgreSQL      | localhost:5432            |
| RustFS (S3 API) | http://localhost:9000     |
| RustFS console  | http://localhost:9001     |

### Create the storage bucket

RustFS starts empty — you must create the bucket named by `S3_BUCKET_NAME`
(`fanta-images` by default) once, and make it public-read so images load via
`S3_PUBLIC_URL`. Do it whichever way you prefer; the bucket then persists in the
`./data/rustfs` volume across restarts.

**Option A — RustFS web console (no tooling):**

1. Open the console at **http://localhost:9001** and sign in with
   `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (default `rustfsadmin` /
   `rustfsadmin`).
2. Create a bucket named **`fanta-images`** (must match `S3_BUCKET_NAME`).
3. Set its access policy to **public / read-only** so objects are served
   anonymously over `S3_PUBLIC_URL`.

**Option B — AWS CLI** (RustFS is S3-compatible):

```bash
export AWS_ACCESS_KEY_ID=rustfsadmin
export AWS_SECRET_ACCESS_KEY=rustfsadmin
export AWS_REGION=auto

# Create the bucket
aws --endpoint-url http://localhost:9000 s3 mb s3://fanta-images

# Allow anonymous reads (so <S3_PUBLIC_URL>/... serves images)
aws --endpoint-url http://localhost:9000 s3api put-bucket-policy \
  --bucket fanta-images \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicRead",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::fanta-images/*"
      }
    ]
  }'
```

**Option C — MinIO client (`mc`):**

```bash
mc alias set local http://localhost:9000 rustfsadmin rustfsadmin
mc mb local/fanta-images
mc anonymous set download local/fanta-images   # public read
```

> Non-local environments: create the same bucket on your real S3 provider and
> point `S3_URL`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
> and `S3_PUBLIC_URL` at it in `.env.development` / `.env.production`.

### Docker data

Postgres and RustFS persist to **bind mounts under `backend/data/`**
(`data/postgres` and `data/rustfs`), which is git-ignored. To wipe everything and
start fresh:

```bash
docker compose down
rm -rf data
docker compose up -d && pnpm db:migrate
```

---

## Environment variables

All variables live in `.env` (see `.env.example` for the template).

| Variable               | Default                               | Description                                                        |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `PORT`                 | `3000`                                | Port the API listens on                                            |
| `BASE_URL`             | `http://localhost:3000`               | Public base URL of the API                                         |
| `DATABASE_URL`         | `postgresql://…@localhost:5439/…`     | Postgres connection string                                         |
| `POSTGRES_USER`        | `fantadex`                            | Postgres user (used by Docker)                                     |
| `POSTGRES_PASSWORD`    | `fantadex`                            | Postgres password (used by Docker)                                 |
| `POSTGRES_DB`          | `fantadex`                            | Postgres database name (used by Docker)                            |
| `POSTGRES_PORT`        | `5439`                                | Host port mapped to Postgres                                       |
| `BETTER_AUTH_SECRET`   | —                                     | Secret for signing sessions/tokens (`openssl rand -base64 32`)     |
| `BETTER_AUTH_URL`      | `http://localhost:3000`               | Base URL better-auth uses to build links                           |
| `TRUSTED_ORIGINS`      | `http://localhost:3000,…`             | Comma-separated CORS / CSRF trusted origins (add your Expo scheme) |
| `S3_PORT`              | `9000`                                | Host port mapped to the RustFS S3 API (Docker only)                |
| `S3_CONSOLE_PORT`      | `9001`                                | Host port mapped to the RustFS web console (Docker only)           |
| `S3_URL`               | `http://localhost:9000`               | S3 API endpoint used by the AWS SDK client                         |
| `S3_BUCKET_NAME`       | `fanta-images`                        | Bucket for drink and brand images                                  |
| `S3_ACCESS_KEY_ID`     | `rustfsadmin`                         | S3 access key                                                      |
| `S3_SECRET_ACCESS_KEY` | `rustfsadmin`                         | S3 secret key                                                      |
| `S3_PUBLIC_URL`        | `http://localhost:9000/fanta-images/` | Public base URL images are served from (trailing slash required)   |

The environment is validated with Zod at startup ([src/env.ts](src/env.ts)); the
server refuses to boot on invalid config.

---

## Scripts

| Script             | Description                                         |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | Run the API with hot reload (tsx watch)             |
| `pnpm start`       | Run the API once                                    |
| `pnpm typecheck`   | `tsc --noEmit`                                      |
| `pnpm lint`        | ESLint                                              |
| `pnpm lint:fix`    | ESLint with `--fix`                                 |
| `pnpm format`      | Prettier check                                      |
| `pnpm format:fix`  | Prettier write                                      |
| `pnpm db:generate` | Generate a SQL migration from the schema            |
| `pnpm db:migrate`  | Apply pending migrations                            |
| `pnpm db:push`     | Push the schema directly (no migration files)       |
| `pnpm db:studio`   | Open Drizzle Studio                                 |
| `pnpm make-admin`  | Promote a user to admin: `pnpm make-admin <email>`  |
| `pnpm seed`        | Reset & seed countries, drinks, users, and tastings |

### Git hooks

A [Husky](https://typicode.github.io/husky/) **pre-commit** hook lives at the
**repo root** (`fantadex/.husky/pre-commit`) and runs `typecheck`, Prettier
`format` check, and `lint` before every commit, blocking it if any fail. It's
installed automatically by the root `prepare` script on `pnpm install`.

---

## Project structure

```
fantadex/                         Repo root (pnpm workspace)
├── package.json                  Root orchestration scripts (proxy to packages)
├── pnpm-workspace.yaml           Workspace packages list
├── .husky/pre-commit             typecheck + format + lint gate (repo-wide)
└── backend/
    ├── docker-compose.yml        Postgres 18 + RustFS (data in ./data)
    ├── drizzle.config.ts         Drizzle Kit config
    ├── eslint.config.mjs         ESLint (typescript-eslint, type-checked)
    ├── drizzle/                  Generated SQL migrations
    ├── bruno/                    Bruno API test collection
    ├── scripts/
    │   ├── make-admin.ts         Promote a user to admin
    │   └── seed.ts               Reset & seed demo data
    └── src/
        ├── index.ts              App entry: middleware, routes, server
        ├── env.ts                Zod-validated environment
        ├── storage.ts            S3 upload + image URL + bucket bootstrap
        ├── auth/                 better-auth config + access-control roles
        ├── types/                All shared types (drink, brand, country, http, db)
        ├── db/
        │   ├── index.ts          Drizzle client (pg Pool)
        │   ├── utils.ts          Shared columns (uuid id + timestamps)
        │   └── schema/           auth + app tables and relations
        ├── lib/
        │   ├── context.ts        send() / fail() response helpers
        │   ├── countries.ts      ISO country validation
        │   └── s3.ts             AWS SDK S3 client (RustFS)
        ├── handlers/
        │   └── is-authorized.ts  Permission-checking middleware factory
        ├── middleware/
        │   └── auth.ts           optionalAuth / auth / admin
        ├── schemas/              Zod request schemas (per scope)
        ├── routes/
        │   ├── drinks.ts         /drinks
        │   ├── brands.ts         /brands
        │   ├── countries.ts      /countries
        │   └── tastings.ts       /me/tastings, /drinks/:id/taste
        └── services/             DB queries + DTO serialization
```

---

## Data model

All primary keys are **UUID**s (generated by Postgres via `gen_random_uuid()`).
better-auth owns `users`, `sessions`, `accounts`, and `verifications`. The app adds:

- **countries** — `id`, `name` (unique), `code` (ISO 3166-1 alpha-2), timestamps.
  Names are validated against the ISO country list on create, so `"germany"`,
  `"Germany"`, `"DE"`, and `"DEU"` all resolve to `{ name: "Germany", code: "DE" }`.
- **brands** — `id`, `name` (unique), `logoKey` (S3/RustFS object key), timestamps.
- **drinks** — `id`, `flavour` (unique), `imageKey` (S3/RustFS object key),
  `brandId` (FK → `brands.id`, required), timestamps.
- **drink_countries** — many-to-many join between `drinks` and `countries`
  (columns `drink_id`, `country_id`; the countries a flavour is sold in).
- **tastings** — many-to-many join between `users` and `drinks` (a user's tasted
  list), with `tastedAt`.

App tables share `id` (uuid), `createdAt`, `updatedAt`, and `deletedAt` columns
(see [src/db/utils.ts](src/db/utils.ts)). `users.role` is `user` or `admin`.

---

## Authentication

better-auth is mounted at `/api/auth/*` with the **email/password**, **admin**,
and **bearer** plugins.

- **Sign up / sign in** return the session token in the `set-auth-token`
  response header. Send it back as `Authorization: Bearer <token>` on subsequent
  requests — ideal for mobile clients that don't use cookies.
- **Roles & permissions**: the admin plugin uses access-control roles
  ([src/auth/permissions.ts](src/auth/permissions.ts)). `user` may
  create/delete/list tastings; `admin` additionally creates countries, brands,
  and drinks.
  Routes enforce this via the `isAuthorized({ resource: [action] })` middleware.
- **Roles**: new users are `user`. Get an admin either by running `pnpm seed`
  (creates `admin@fantadex.io`) or by promoting an existing account:

  ```bash
  # 1. sign the account up (via the app or POST /api/auth/sign-up/email)
  # 2. promote it
  pnpm make-admin admin@fantadex.io
  ```

- **IDs**: user ids are database-generated UUIDs, so better-auth is configured
  with `advanced.database.generateId: false`.
- **CSRF**: for cookie-bearing requests better-auth requires a trusted `Origin`
  header. Bearer-token clients (no cookies) are unaffected.

---

## API reference

Base URL: `http://localhost:3000/api`. App routes wrap their payload in
`{ "result": …, "meta": {} }`; the auth routes below are handled by better-auth
and return its own shapes.

### Auth (better-auth)

| Method | Path                      | Body                              |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/api/auth/sign-up/email` | `{ "email", "password", "name" }` |
| POST   | `/api/auth/sign-in/email` | `{ "email", "password" }`         |
| GET    | `/api/auth/get-session`   | — (Bearer token)                  |
| POST   | `/api/auth/sign-out`      | `{}` (Bearer token)               |

### Countries

**`GET /countries`** — public. Lists countries ordered by name.

```json
{
  "result": [
    { "id": "b3a…-uuid", "name": "Germany", "code": "DE", "createdAt": "…" }
  ],
  "meta": {}
}
```

**`POST /countries`** — requires `countries:create` (admin). Body
`{ "name": "Germany" }`. `400` if the name isn't a real country, `409` if it
already exists.

### Brands

**`GET /brands`** — public. Lists brands.

```json
{
  "result": [
    {
      "id": "a1b2…-uuid",
      "name": "Fanta",
      "logoUrl": "http://localhost:9000/fanta-images/brands/fanta.png"
    }
  ],
  "meta": {}
}
```

**`POST /brands`** — requires `brands:create` (admin). `multipart/form-data`:

| Field   | Type   | Notes                           |
| ------- | ------ | ------------------------------- |
| `name`  | string | required, unique                |
| `image` | file   | required; png or jpeg, max 5 MB |

```bash
curl -X POST http://localhost:3000/api/brands \
  -H "Authorization: Bearer <admin-token>" \
  -F name=Fanta \
  -F image=@/path/to/fanta-logo.png
```

Returns the created brand `{ id, name, logoUrl }`.

### Drinks

**`GET /drinks`** — public. Lists all drinks. Include a bearer token to get the
`tasted` flag for that user.

```json
{
  "result": [
    {
      "id": "0f1c6122-…-uuid",
      "flavour": "Orange",
      "imageUrl": "http://localhost:9000/fanta-images/drinks/orange.png",
      "brand": {
        "id": "a1b2…-uuid",
        "name": "Fanta",
        "logoUrl": "http://localhost:9000/fanta-images/brands/fanta.png"
      },
      "countries": [
        { "id": "b3a…-uuid", "name": "Germany", "code": "DE", "createdAt": "…" }
      ],
      "tasted": false,
      "createdAt": "…"
    }
  ],
  "meta": {}
}
```

**`GET /drinks/:id`** — public. Same shape as one list item. `404` if not found.

**`POST /drinks`** — requires `drinks:create` (admin). `multipart/form-data`:

| Field          | Type   | Notes                                                 |
| -------------- | ------ | ----------------------------------------------------- |
| `flavour`      | string | required, unique                                      |
| `brandId`      | uuid   | required; must reference an existing brand            |
| `countryCodes` | string | ISO codes, comma-separated (e.g. `DE,FR`); must exist |
| `image`        | file   | required; png or jpeg, max 5 MB                       |

```bash
curl -X POST http://localhost:3000/api/drinks \
  -H "Authorization: Bearer <admin-token>" \
  -F flavour=Orange \
  -F brandId=a1b2c3d4-…-uuid \
  -F countryCodes=DE,FR \
  -F image=@/path/to/orange.png
```

Returns the created drink with `{ id, flavour, imageUrl, brand, countries, tasted }`.

### Tastings

| Method | Path                | Permission        | Description                     |
| ------ | ------------------- | ----------------- | ------------------------------- |
| GET    | `/me/tastings`      | `tastings:list`   | Own tasted list, newest first   |
| POST   | `/drinks/:id/taste` | `tastings:create` | Add to tasted list (idempotent) |
| DELETE | `/drinks/:id/taste` | `tastings:delete` | Remove from tasted list         |

### Errors

Errors are JSON: `{ "error": "message", "key": "ERROR_KEY" }`. Keys/codes:
`BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
`CONFLICT` (409), and `500` for unexpected failures.

---

## Testing with Bruno

The `./bruno` folder is a ready-made [Bruno](https://www.usebruno.com/) collection.

1. Run `pnpm seed` so the admin account (`admin@fantadex.io`) exists.
2. Open `./bruno` in Bruno and select the **Local** environment. The collection
   variable `baseUrl` already includes the `/api` base path.
3. Work through the numbered folders (Auth → Countries → Brands → Drinks → Tastings → Session).
   `1-Auth > Sign In` captures the bearer `token` into the environment
   automatically; every authenticated request reuses it.

Headless run:

```bash
cd bruno && npx @usebruno/cli run --env Local
```

---

## Notes for the Expo app

- Add the app's deep-link scheme and dev origin to `TRUSTED_ORIGINS` (e.g.
  `fantadex://`, `http://localhost:8081`).
- Authenticate with bearer tokens (no cookies): read `set-auth-token` from the
  sign-in response and send `Authorization: Bearer <token>`. The
  [`@better-auth/expo`](https://better-auth.com/docs/integrations/expo) client
  wraps this, including secure token storage.

---

## Troubleshooting

- **Port already in use** — change `PORT` / `POSTGRES_PORT` / `S3_PORT` in
  `.env`, then `docker compose up -d` again.
- **Postgres 18 volume error** — the compose file mounts `./data/postgres` at
  `/var/lib/postgresql` (not `/var/lib/postgresql/data`), as required by the
  Postgres 18 image. Don't change that mount target.
- **Images 403 / not loading** — images are served from `S3_PUBLIC_URL`, so the
  bucket must allow public reads. Confirm RustFS is up (`docker compose ps`) and
  reachable at `S3_URL`, and that `S3_PUBLIC_URL` points at the bucket.
- **`set-auth-token` header missing** — it's only returned by sign-in/sign-up;
  make sure the bearer plugin is enabled (it is, in [src/auth/index.ts](src/auth/index.ts)).

```

```
