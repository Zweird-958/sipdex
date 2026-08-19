import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { listTastedDrinks } from "../../src/lib/drinks/list-tasted-drink"
import { addTasting } from "../../src/lib/tastings/add-tasting"
import { drinkExists } from "../../src/lib/tastings/drink-exists"
import { removeTasting } from "../../src/lib/tastings/remove-tasting"
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

vi.mock("../../src/lib/drinks/list-tasted-drink")
vi.mock("../../src/lib/tastings/add-tasting")
vi.mock("../../src/lib/tastings/drink-exists")
vi.mock("../../src/lib/tastings/remove-tasting")

const app = createApp()

const user = buildAuthUser()

describe("tastings routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(user))
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(true),
    )
  })

  describe("GET /api/tastings", () => {
    it("returns the tasted drink", async () => {
      const drink = {
        id: faker.string.uuid(),
        flavour: faker.commerce.productName(),
        imageUrl: faker.internet.url(),
        brand: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          logoUrl: faker.internet.url(),
        },
        countries: [],
        tasted: true,
        createdAt: new Date(),
      }

      vi.mocked(listTastedDrinks).mockResolvedValue([drink])

      const response = await app.request("/api/tastings")

      expect(response.status).toBe(200)
      expect(listTastedDrinks).toHaveBeenCalledWith(user.id)
    })

    it("rejects unauthenticated requests", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))

      const response = await app.request("/api/tastings")

      expect(response.status).toBe(401)
    })

    it("rejects requests without permission", async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValue(
        buildPermissionResult(false),
      )

      const response = await app.request("/api/tastings")

      expect(response.status).toBe(403)
    })
  })

  describe("POST /api/drinks/:id/taste", () => {
    it("tastes the drink", async () => {
      const drinkId = faker.string.uuid()

      vi.mocked(drinkExists).mockResolvedValue(true)

      const response = await app.request(`/api/drinks/${drinkId}/taste`, {
        method: "POST",
      })

      expect(response.status).toBe(201)
      expect(await response.json()).toEqual({
        result: { drinkId, tasted: true },
        meta: {},
      })
      expect(addTasting).toHaveBeenCalledWith(user.id, drinkId)
    })

    it("returns 404 for an unknown drink", async () => {
      vi.mocked(drinkExists).mockResolvedValue(false)

      const response = await app.request(
        `/api/drinks/${faker.string.uuid()}/taste`,
        { method: "POST" },
      )

      expect(response.status).toBe(404)
      expect(addTasting).not.toHaveBeenCalled()
    })
  })

  describe("DELETE /api/drinks/:id/taste", () => {
    it("removes the tasting", async () => {
      const drinkId = faker.string.uuid()

      const response = await app.request(`/api/drinks/${drinkId}/taste`, {
        method: "DELETE",
      })

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: { drinkId, tasted: false },
        meta: {},
      })
      expect(removeTasting).toHaveBeenCalledWith(user.id, drinkId)
    })

    it("rejects requests without permission", async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValue(
        buildPermissionResult(false),
      )

      const response = await app.request(
        `/api/drinks/${faker.string.uuid()}/taste`,
        { method: "DELETE" },
      )

      expect(response.status).toBe(403)
    })
  })
})
