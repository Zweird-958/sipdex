import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { createCountry } from "../../src/lib/countries/create-country"
import { getCountries } from "../../src/lib/countries/get-countries"
import {
  buildAuthUser,
  buildPermissionResult,
  buildSession,
} from "./helpers/auth"

vi.mock("../../src/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      userHasPermission: vi.fn(),
    },
    handler: vi.fn(),
  },
}))

vi.mock("../../src/lib/countries/create-country")
vi.mock("../../src/lib/countries/get-countries")

const app = createApp()

const buildCountry = (overrides: { name?: string; code?: string } = {}) => ({
  id: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  name: overrides.name ?? faker.location.country(),
  code: overrides.code ?? faker.location.countryCode("alpha-2"),
})

const postCountry = (name: string) =>
  app.request("/api/countries", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  })

describe("countries routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(
      buildSession(buildAuthUser()),
    )
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(true),
    )
  })

  describe("GET /api/countries", () => {
    it("returns the countries list", async () => {
      const country = buildCountry()

      vi.mocked(getCountries).mockResolvedValue([country])

      const response = await app.request("/api/countries")

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: [
          {
            ...country,
            createdAt: country.createdAt.toISOString(),
            updatedAt: country.updatedAt.toISOString(),
          },
        ],
        meta: {},
      })
    })
  })

  describe("POST /api/countries", () => {
    it("creates the country", async () => {
      const created = buildCountry({ name: "France", code: "FR" })

      vi.mocked(createCountry).mockResolvedValue(created)

      const response = await postCountry("France")

      expect(response.status).toBe(201)
      expect(createCountry).toHaveBeenCalledWith({ name: "France", code: "FR" })
    })

    it("rejects an unrecognised country name", async () => {
      const response = await postCountry("Not a real country")

      expect(response.status).toBe(400)
      expect(createCountry).not.toHaveBeenCalled()
    })

    it("rejects a duplicate country", async () => {
      vi.mocked(createCountry).mockRejectedValue(
        Object.assign(new Error("duplicate key"), { code: "23505" }),
      )

      const response = await postCountry("France")

      expect(response.status).toBe(409)
    })

    it("rejects an invalid payload", async () => {
      const response = await postCountry("")

      expect(response.status).toBe(400)
    })

    it("rejects unauthenticated requests", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))

      const response = await postCountry("France")

      expect(response.status).toBe(401)
    })

    it("rejects requests without permission", async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValue(
        buildPermissionResult(false),
      )

      const response = await postCountry("France")

      expect(response.status).toBe(403)
    })
  })
})
