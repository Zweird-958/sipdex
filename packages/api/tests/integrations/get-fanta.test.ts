import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { getFanta } from "../../src/lib/fanta/get-fanta"
import { getImageUrl } from "../../src/storage"
import { useTestDb } from "../helpers/db"
import {
  insertCountry,
  insertFanta,
  insertTasting,
  insertUser,
} from "../helpers/factories"

describe("getFanta", () => {
  useTestDb()

  it("returns the formatted fanta with sorted countries", async () => {
    const zw = await insertCountry({ name: "Zimbabwe", code: "ZW" })
    const al = await insertCountry({ name: "Albania", code: "AL" })
    const fanta = await insertFanta({ countryIds: [zw.id, al.id] })

    const result = await getFanta(fanta.id)

    expect(result).toEqual({
      id: fanta.id,
      flavour: fanta.flavour,
      imageUrl: getImageUrl(fanta.imageKey),
      countries: [
        { name: "Albania", code: "AL" },
        { name: "Zimbabwe", code: "ZW" },
      ],
      tasted: null,
      createdAt: fanta.createdAt,
    })
  })

  it("marks the fanta as tasted for a user who tasted it", async () => {
    const fanta = await insertFanta()
    const user = await insertUser()
    await insertTasting(user.id, fanta.id)

    expect((await getFanta(fanta.id, user.id))?.tasted).toBe(true)
  })

  it("is not tasted for a user who has not tasted it", async () => {
    const fanta = await insertFanta()
    const user = await insertUser()

    expect((await getFanta(fanta.id, user.id))?.tasted).toBe(false)
  })

  it("returns null for an unknown id", async () => {
    expect(await getFanta(faker.string.uuid())).toBeNull()
  })
})
