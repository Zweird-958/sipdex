import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createAuthMiddleware } from "better-auth/api"
import { admin as adminPlugin } from "better-auth/plugins"
import { db } from "../db"
import * as schema from "../db/schema/auth"
import { env } from "../env"
import { ac, admin, user } from "./permissions"

const ADMIN_ROLES = ["admin"] as const
const ROLES = ["user", "admin"] as const
const DEFAULT_ROLE = "user" as const

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.TRUSTED_ORIGINS,

  hooks: {
    // eslint-disable-next-line require-await, consistent-return
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        return ctx.json({ result: true })
      }
    }),
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),

  advanced: {
    database: {
      generateId: false,
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },

  plugins: [
    adminPlugin({
      defaultRole: DEFAULT_ROLE,
      adminRoles: [...ADMIN_ROLES],
      ac,
      roles: {
        user,
        admin,
      },
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: [...ROLES],
        defaultValue: DEFAULT_ROLE,
        required: true,
      },
    },
  },
})
