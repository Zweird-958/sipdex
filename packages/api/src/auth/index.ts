import { expo } from "@better-auth/expo"
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

// The mobile app scheme comes from env (MOBILE_ORIGIN). The `exp://` origins
// cover the Expo dev client / Expo Go during development.
const MOBILE_ORIGINS = [
  env.MOBILE_ORIGIN,
  ...(process.env.NODE_ENV === "production" ? [] : ["exp://", "exp://**"]),
]

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [...env.TRUSTED_ORIGINS, ...MOBILE_ORIGINS],

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
    expo(),
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
