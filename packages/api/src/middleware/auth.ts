import { createMiddleware } from "hono/factory"
import { auth as authConfig } from "../auth"
import type { AppEnv, AuthUser } from "../types/http"

type NullableAuth = {
  Variables: {
    user: AuthUser | null
  }
}

type Auth = {
  Variables: {
    user: AuthUser
  }
}

export const optionalAuth = createMiddleware<NullableAuth>(
  async ({ req, set }, next) => {
    const result = await authConfig.api.getSession({
      headers: req.raw.headers,
    })

    set("user", result?.user ?? null)

    await next()
  },
)

export const auth = createMiddleware<AppEnv & Auth>(
  async ({ req, set, var: { fail } }, next) => {
    const result = await authConfig.api.getSession({
      headers: req.raw.headers,
    })

    const user = result?.user

    if (!user) {
      return fail("unauthorized")
    }

    set("user", user)

    return await next()
  },
)
