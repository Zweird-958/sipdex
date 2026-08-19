import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { getDrink } from "../../src/lib/drinks/get-drink"
import { listDrinks } from "../../src/lib/drinks/list-drinks"
import {
  buildAuthUser,
  buildPermissionResult,
  buildSession,
} from "./helpers/auth"
import { buildDrink } from "./helpers/drinks"

vi.mock("../../src/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      userHasPermission: vi.fn(),
    },
    handler: vi.fn(),
  },
}))

vi.mock("../../src/lib/drinks/get-drink")
vi.mock("../../src/lib/drinks/list-drinks")

const app = createApp()

describe("drinks routes (read)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(
      buildSession(buildAuthUser()),
    )
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(true),
    )
  })

  describe("GET /api/drinks", () => {
    it("returns the drink list", async () => {
      const drink = buildDrink()

      vi.mocked(listDrinks).mockResolvedValue([drink])

      const response = await app.request("/api/drinks")

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: [{ ...drink, createdAt: drink.createdAt.toISOString() }],
        meta: {},
      })
    })

    it("works without a session", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))
      vi.mocked(listDrinks).mockResolvedValue([])

      const response = await app.request("/api/drinks")

      expect(response.status).toBe(200)
    })
  })

  describe("GET /api/drinks/:id", () => {
    it("returns the drink", async () => {
      const drink = buildDrink()

      vi.mocked(getDrink).mockResolvedValue(drink)

      const response = await app.request(`/api/drinks/${drink.id}`)

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: { ...drink, createdAt: drink.createdAt.toISOString() },
        meta: {},
      })
    })

    it("returns 404 for an unknown drink", async () => {
      vi.mocked(getDrink).mockResolvedValue(null)

      const response = await app.request(`/api/drinks/${faker.string.uuid()}`)

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: "Drink not found",
        key: "NOT_FOUND",
      })
    })
  })
})
