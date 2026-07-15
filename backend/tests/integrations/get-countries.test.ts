import { describe, expect, it } from "vitest"
import { getCountries } from "../../src/lib/countries/get-countries"
import { useTestDb } from "../helpers/db"
import { insertCountry } from "../helpers/factories"

describe("getCountries", () => {
  useTestDb()

  it("returns an empty array when there are no countries", async () => {
    expect(await getCountries()).toEqual([])
  })

  it("returns all countries ordered by name", async () => {
    await insertCountry({ name: "Portugal", code: "PT" })
    await insertCountry({ name: "Argentina", code: "AR" })
    await insertCountry({ name: "Morocco", code: "MA" })

    const result = await getCountries()

    expect(result.map((c) => c.name)).toEqual([
      "Argentina",
      "Morocco",
      "Portugal",
    ])
  })
})
