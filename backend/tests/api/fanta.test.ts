import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { filterCountriesByIds } from "../../src/lib/countries/filter-countries-by-ids"
import { createFanta } from "../../src/lib/fanta/create-fanta"
import { getFanta } from "../../src/lib/fanta/get-fanta"
import { isFlavourExisting } from "../../src/lib/fanta/is-flavour-existing"
import { listFanta } from "../../src/lib/fanta/list-fanta"
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

vi.mock("../../src/lib/countries/filter-countries-by-ids")
vi.mock("../../src/lib/fanta/create-fanta")
vi.mock("../../src/lib/fanta/get-fanta")
vi.mock("../../src/lib/fanta/is-flavour-existing")
vi.mock("../../src/lib/fanta/list-fanta")
vi.mock("../../src/storage")

const app = createApp()

const buildFanta = () => ({
  id: faker.string.uuid(),
  flavour: faker.commerce.productName(),
  imageUrl: faker.internet.url(),
  countries: [],
  tasted: false,
  createdAt: new Date(),
})

const postFanta = (body: { flavour?: string; countryCodes?: string }) => {
  const form = new FormData()

  form.append("flavour", body.flavour ?? "Grape")
  form.append("countryCodes", body.countryCodes ?? "FR,US")
  form.append(
    "image",
    new File([Buffer.from("fake-image")], "grape.png", {
      type: "image/png",
    }),
  )

  return app.request("/api/fanta", { method: "POST", body: form })
}

describe("fanta routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(
      buildSession(buildAuthUser()),
    )
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(true),
    )
  })

  describe("GET /api/fanta", () => {
    it("returns the fanta list", async () => {
      const fanta = buildFanta()

      vi.mocked(listFanta).mockResolvedValue([fanta])

      const response = await app.request("/api/fanta")

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: [{ ...fanta, createdAt: fanta.createdAt.toISOString() }],
        meta: {},
      })
    })

    it("works without a session", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))
      vi.mocked(listFanta).mockResolvedValue([])

      const response = await app.request("/api/fanta")

      expect(response.status).toBe(200)
    })
  })

  describe("GET /api/fanta/:id", () => {
    it("returns the fanta", async () => {
      const fanta = buildFanta()

      vi.mocked(getFanta).mockResolvedValue(fanta)

      const response = await app.request(`/api/fanta/${fanta.id}`)

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        result: { ...fanta, createdAt: fanta.createdAt.toISOString() },
        meta: {},
      })
    })

    it("returns 404 for an unknown fanta", async () => {
      vi.mocked(getFanta).mockResolvedValue(null)

      const response = await app.request(`/api/fanta/${faker.string.uuid()}`)

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: "Fanta not found",
        key: "NOT_FOUND",
      })
    })
  })

  describe("POST /api/fanta", () => {
    it("creates the fanta", async () => {
      const fanta = buildFanta()
      const countryId = faker.string.uuid()

      vi.mocked(isFlavourExisting).mockResolvedValue(false)
      vi.mocked(filterCountriesByIds).mockResolvedValue([{ id: countryId }])
      vi.mocked(uploadImage).mockResolvedValue("fanta/grape.png")
      vi.mocked(createFanta).mockResolvedValue({ id: fanta.id })
      vi.mocked(getFanta).mockResolvedValue(fanta)

      const response = await postFanta({ flavour: "Grape" })

      expect(response.status).toBe(201)
      expect(createFanta).toHaveBeenCalledWith({
        flavour: "Grape",
        imageKey: "fanta/grape.png",
        countryIds: [countryId],
      })
    })

    it("rejects an already existing flavour", async () => {
      vi.mocked(isFlavourExisting).mockResolvedValue(true)

      const response = await postFanta({})

      expect(response.status).toBe(409)
    })

    it("rejects when no country matches", async () => {
      vi.mocked(isFlavourExisting).mockResolvedValue(false)
      vi.mocked(filterCountriesByIds).mockResolvedValue([])

      const response = await postFanta({})

      expect(response.status).toBe(400)
    })

    it("rejects an invalid payload", async () => {
      const response = await postFanta({ flavour: "" })

      expect(response.status).toBe(400)
    })

    it("rejects unauthenticated requests", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))

      const response = await postFanta({})

      expect(response.status).toBe(401)
    })

    it("rejects requests without permission", async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValue(
        buildPermissionResult(false),
      )

      const response = await postFanta({})

      expect(response.status).toBe(403)
    })
  })
})
