import { faker } from "@faker-js/faker"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "../../src/app"
import { auth } from "../../src/auth"
import { getBrand } from "../../src/lib/brands/get-brand"
import { filterCountriesByIds } from "../../src/lib/countries/filter-countries-by-ids"
import { createDrink } from "../../src/lib/drinks/create-drink"
import { getDrink } from "../../src/lib/drinks/get-drink"
import { isDrinkExisting } from "../../src/lib/drinks/is-drink-existing"
import { uploadImage } from "../../src/storage"
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

vi.mock("../../src/lib/brands/get-brand")
vi.mock("../../src/lib/countries/filter-countries-by-ids")
vi.mock("../../src/lib/drinks/create-drink")
vi.mock("../../src/lib/drinks/get-drink")
vi.mock("../../src/lib/drinks/is-drink-existing")
vi.mock("../../src/storage")

const app = createApp()

const postDrink = (body: {
  flavour?: string
  brandId?: string
  countryCodes?: string
}) => {
  const form = new FormData()

  form.append("flavour", body.flavour ?? "Grape")
  form.append("brandId", body.brandId ?? faker.string.uuid())
  form.append("countryCodes", body.countryCodes ?? "FR,US")
  form.append(
    "image",
    new File([Buffer.from("fake-image")], "grape.png", {
      type: "image/png",
    }),
  )

  return app.request("/api/drinks", { method: "POST", body: form })
}

describe("POST /api/drinks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(
      buildSession(buildAuthUser()),
    )
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(true),
    )
  })

  it("creates the drink", async () => {
    const drink = buildDrink()
    const brandId = faker.string.uuid()
    const countryId = faker.string.uuid()

    vi.mocked(getBrand).mockResolvedValue({ id: brandId, slug: "coca-cola" })
    vi.mocked(isDrinkExisting).mockResolvedValue(false)
    vi.mocked(filterCountriesByIds).mockResolvedValue([{ id: countryId }])
    vi.mocked(uploadImage).mockResolvedValue("coca-cola/grape.png")
    vi.mocked(createDrink).mockResolvedValue({ id: drink.id })
    vi.mocked(getDrink).mockResolvedValue(drink)

    const response = await postDrink({ flavour: "Grape", brandId })

    expect(response.status).toBe(201)
    expect(uploadImage).toHaveBeenCalledWith(
      expect.objectContaining({ folder: "coca-cola", name: "grape" }),
    )
    expect(createDrink).toHaveBeenCalledWith({
      flavour: "Grape",
      slug: "grape",
      imageKey: "coca-cola/grape.png",
      brandId,
      countryIds: [countryId],
    })
  })

  it("rejects a flavour already existing for the brand", async () => {
    vi.mocked(getBrand).mockResolvedValue({
      id: faker.string.uuid(),
      slug: "coca-cola",
    })
    vi.mocked(isDrinkExisting).mockResolvedValue(true)

    const response = await postDrink({})

    expect(response.status).toBe(409)
    expect(createDrink).not.toHaveBeenCalled()
  })

  it("rejects an unknown brand", async () => {
    vi.mocked(getBrand).mockResolvedValue(null)

    const response = await postDrink({})

    expect(response.status).toBe(400)
    expect(createDrink).not.toHaveBeenCalled()
  })

  it("rejects when no country matches", async () => {
    vi.mocked(getBrand).mockResolvedValue({
      id: faker.string.uuid(),
      slug: "coca-cola",
    })
    vi.mocked(isDrinkExisting).mockResolvedValue(false)
    vi.mocked(filterCountriesByIds).mockResolvedValue([])

    const response = await postDrink({})

    expect(response.status).toBe(400)
  })

  it("rejects an invalid payload", async () => {
    const response = await postDrink({ flavour: "" })

    expect(response.status).toBe(400)
  })

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(buildSession(null))

    const response = await postDrink({})

    expect(response.status).toBe(401)
  })

  it("rejects requests without permission", async () => {
    vi.mocked(auth.api.userHasPermission).mockResolvedValue(
      buildPermissionResult(false),
    )

    const response = await postDrink({})

    expect(response.status).toBe(403)
  })
})
