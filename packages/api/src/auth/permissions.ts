import { createAccessControl } from "better-auth/plugins/access"

const statement = {
  fanta: ["create"],
  countries: ["create"],
  tastings: ["create", "delete", "list"],
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({
  tastings: ["create", "delete", "list"],
})

export const admin = ac.newRole({
  ...user.statements,
  fanta: ["create"],
  countries: ["create"],
})
