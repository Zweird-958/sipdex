import { faker } from "@faker-js/faker"
import type { auth } from "../../../src/auth"
import type { AuthUser } from "../../../src/types/http"

type Session = Awaited<ReturnType<typeof auth.api.getSession>>
type PermissionResult = Awaited<ReturnType<typeof auth.api.userHasPermission>>

// Auth is mocked at the module level (see tests/api/*.test.ts), so these
// fixtures only need to carry the fields the routes actually read.
export const buildAuthUser = (overrides: Partial<AuthUser> = {}) =>
  ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: "user",
    ...overrides,
  }) as unknown as AuthUser

export const buildSession = (user: AuthUser | null) =>
  (user ? { user, session: {} } : null) as unknown as Session

export const buildPermissionResult = (granted: boolean) =>
  ({ success: granted }) as unknown as PermissionResult
