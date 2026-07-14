import type { auth } from "../auth"
import type { Context } from "../lib/context"

type AuthSession = typeof auth.$Infer.Session

export type AuthUser = AuthSession["user"]

export type AppEnv = {
  Variables: Context
}
