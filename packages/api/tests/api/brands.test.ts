import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { brandExists } from "../../src/lib/brands/brand-exists"
import { createBrand } from "../../src/lib/brands/create-brand"
import { getBrands } from "../../src/lib/brands/get-brands"
import { uploadImage } from "../../src/storage"
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

vi.mock("../../src/lib/brands/brand-exists")
vi.mock("../../src/lib/brands/create-brand")
vi.mock("../../src/lib/brands/get-brands")
vi.mock("../../src/storage")

const app = createApp()

const buildBrand = (overrides: { name?: string } = {}) => ({
  id: faker.string.uuid(),
  name: overrides.name ?? faker.company.name(),
  logoUrl: faker.internet.url(),
})

const postBrand = (name: string) => {
  const form = new FormData()

  form.append("name", name)
  form.append(
    "image",
    new File([Buffer.from("fake-image")], "logo.png", {
      type: "image/png",
    }),
  )

  return app.request("/api/brands", { method: "POST", body: form })
}

describe("brands routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(
      buildSession(buildAuthUser()),
    )
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(true),
    )
  })

  describe("GET /api/brands", () => {
    it("returns the brands list", async () => {
      const brand = buildBrand()

      vi.mocked(getBrands).mockResolvedValue([brand])

      const response = await app.request("/api/brands")

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: [brand],
        meta: {},
      })
    })
  })

  describe("POST /api/brands", () => {
    it("creates the brand", async () => {
      const created = buildBrand({ name: "Coca-Cola" })

      vi.mocked(brandExists).mockResolvedValue(false)
      vi.mocked(uploadImage).mockResolvedValue("brands/coca-cola.png")
      vi.mocked(createBrand).mockResolvedValue(created)

      const response = await postBrand("Coca-Cola")

      expect(response.status).toBe(201)
      expect(createBrand).toHaveBeenCalledWith({
        name: "Coca-Cola",
        slug: "coca-cola",
        logoKey: "brands/coca-cola.png",
      })
    })

    it("rejects a duplicate before uploading the logo", async () => {
      vi.mocked(brandExists).mockResolvedValue(true)

      const response = await postBrand("Coca-Cola")

      expect(response.status).toBe(409)
      expect(uploadImage).not.toHaveBeenCalled()
      expect(createBrand).not.toHaveBeenCalled()
    })

    it("rejects a duplicate that races past the pre-check", async () => {
      vi.mocked(brandExists).mockResolvedValue(false)
      vi.mocked(uploadImage).mockResolvedValue("brands/coca-cola.png")
      vi.mocked(createBrand).mockRejectedValue(
        Object.assign(new Error("duplicate key"), { code: "23505" }),
      )

      const response = await postBrand("Coca-Cola")

      expect(response.status).toBe(409)
    })

    it("rejects an invalid payload", async () => {
      const response = await postBrand("")

      expect(response.status).toBe(400)
    })

    it("rejects unauthenticated requests", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))

      const response = await postBrand("Coca-Cola")

      expect(response.status).toBe(401)
    })

    it("rejects requests without permission", async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValue(
        buildPermissionResult(false),
      )

      const response = await postBrand("Coca-Cola")

      expect(response.status).toBe(403)
    })
  })
})
