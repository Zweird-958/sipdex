import { createFactory } from "hono/factory"
import { auth as authConfig } from "../auth"
import type { ac } from "../auth/permissions"
import { auth } from "../middleware/auth"

type Statements = typeof ac.statements

type Permissions = {
  [Resource in keyof Statements]?: Statements[Resource][number][]
}

const factory = createFactory()

export const isAuthorized = (permissions: Permissions) =>
  factory.createHandlers(auth, async ({ var: { fail, user } }, next) => {
    const result = await authConfig.api.userHasPermission({
      body: {
        userId: user.id,
        permissions,
      },
    })

    if (!result.success) {
      return fail("forbidden")
    }

    return next()
  })
