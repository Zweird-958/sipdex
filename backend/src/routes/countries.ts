import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { isAuthorized } from "../handlers/is-authorized"
import { HTTP_CREATED_STATUS, SQL_ERROR_CODES } from "../lib/constants"
import { resolveCountry } from "../lib/countries"
import { getSqlErrorCode } from "../lib/sql"
import { createCountrySchema } from "../schemas/countries"
import { createCountry, getCountries } from "../services/countries"
import type { AppEnv } from "../types/http"

export const countriesRoutes = new Hono<AppEnv>()

countriesRoutes.get("/", async ({ var: { send } }) => {
  const countries = await getCountries()

  return send(countries)
})

countriesRoutes.post(
  "/",
  ...isAuthorized({ countries: ["create"] }),
  zValidator("json", createCountrySchema),
  async ({ req, var: { send, fail } }) => {
    const { name } = req.valid("json")

    const resolved = resolveCountry(name)

    if (!resolved) {
      return fail("badRequest", `"${name}" is not a recognised country`)
    }

    try {
      const created = await createCountry({
        name: resolved.name,
        code: resolved.code,
      })

      return send(created, {}, HTTP_CREATED_STATUS)
    } catch (err) {
      if (getSqlErrorCode(err) === SQL_ERROR_CODES.UNIQUE_VIOLATION) {
        return fail("conflict", `Country "${resolved.name}" already exists`)
      }

      throw err
    }
  },
)
