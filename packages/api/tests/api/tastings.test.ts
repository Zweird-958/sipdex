import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { listTastedFanta } from "../../src/lib/fanta/list-tasted-fanta"
import { addTasting } from "../../src/lib/tastings/add-tasting"
import { fantaExists } from "../../src/lib/tastings/fanta-exists"
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

vi.mock("../../src/lib/fanta/list-tasted-fanta")
vi.mock("../../src/lib/tastings/add-tasting")
vi.mock("../../src/lib/tastings/fanta-exists")
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
    it("returns the tasted fanta", async () => {
      const fanta = {
        id: faker.string.uuid(),
        flavour: faker.commerce.productName(),
        imageUrl: faker.internet.url(),
        countries: [],
        tasted: true,
        createdAt: new Date(),
      }

      vi.mocked(listTastedFanta).mockResolvedValue([fanta])

      const response = await app.request("/api/tastings")

      expect(response.status).toBe(200)
      expect(listTastedFanta).toHaveBeenCalledWith(user.id)
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

  describe("POST /api/fanta/:id/taste", () => {
    it("tastes the fanta", async () => {
      const fantaId = faker.string.uuid()

      vi.mocked(fantaExists).mockResolvedValue(true)

      const response = await app.request(`/api/fanta/${fantaId}/taste`, {
        method: "POST",
      })

      expect(response.status).toBe(201)
      expect(await response.json()).toEqual({
        result: { fantaId, tasted: true },
        meta: {},
      })
      expect(addTasting).toHaveBeenCalledWith(user.id, fantaId)
    })

    it("returns 404 for an unknown fanta", async () => {
      vi.mocked(fantaExists).mockResolvedValue(false)

      const response = await app.request(
        `/api/fanta/${faker.string.uuid()}/taste`,
        { method: "POST" },
      )

      expect(response.status).toBe(404)
      expect(addTasting).not.toHaveBeenCalled()
    })
  })

  describe("DELETE /api/fanta/:id/taste", () => {
    it("removes the tasting", async () => {
      const fantaId = faker.string.uuid()

      const response = await app.request(`/api/fanta/${fantaId}/taste`, {
        method: "DELETE",
      })

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: { fantaId, tasted: false },
        meta: {},
      })
      expect(removeTasting).toHaveBeenCalledWith(user.id, fantaId)
    })

    it("rejects requests without permission", async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValue(
        buildPermissionResult(false),
      )

      const response = await app.request(
        `/api/fanta/${faker.string.uuid()}/taste`,
        { method: "DELETE" },
      )

      expect(response.status).toBe(403)
    })
  })
})
