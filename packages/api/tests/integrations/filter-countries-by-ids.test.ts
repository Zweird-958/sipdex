import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { filterCountriesByIds } from "../../src/lib/countries/filter-countries-by-ids"
import { useTestDb } from "../helpers/db"
import { insertCountry } from "../helpers/factories"

describe("filterCountriesByIds", () => {
  useTestDb()

  it("returns the ids of countries matching the given codes", async () => {
    const fr = await insertCountry({ code: "FR" })
    const de = await insertCountry({ code: "DE" })
    await insertCountry({ code: "IT" })

    const result = await filterCountriesByIds(["FR", "DE"])

    expect(result.map((c) => c.id).sort()).toEqual([fr.id, de.id].sort())
  })

  it("only selects the id column", async () => {
    await insertCountry({ code: "ES" })

    const [row] = await filterCountriesByIds(["ES"])

    expect(Object.keys(row)).toEqual(["id"])
  })

  it("returns an empty array when no code matches", async () => {
    await insertCountry({ code: "JP" })

    const result = await filterCountriesByIds([
      faker.location.countryCode("alpha-3"),
    ])

    expect(result).toEqual([])
  })
})
