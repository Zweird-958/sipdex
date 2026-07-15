import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { resolveCountry } from "../../src/lib/countries/resolve-country"

describe("resolveCountry", () => {
  it("resolves a full English country name", () => {
    expect(resolveCountry("France")).toEqual({ name: "France", code: "FR" })
  })

  it("resolves an alpha-2 code regardless of case", () => {
    expect(resolveCountry("fr")).toEqual({ name: "France", code: "FR" })
    expect(resolveCountry("FR")).toEqual({ name: "France", code: "FR" })
  })

  it("resolves a name regardless of surrounding whitespace", () => {
    expect(resolveCountry("  Germany  ")).toEqual({
      name: "Germany",
      code: "DE",
    })
  })

  it("round-trips any valid alpha-2 code back to itself", () => {
    Array.from({ length: 25 }).forEach(() => {
      const code = faker.location.countryCode("alpha-2")
      const resolved = resolveCountry(code)

      expect(resolved).not.toBeNull()
      expect(resolved?.code).toBe(code)
      expect(resolved?.name.length).toBeGreaterThan(0)
    })
  })

  it("returns null for an unrecognised country", () => {
    expect(resolveCountry("Wakanda")).toBeNull()
    expect(resolveCountry(faker.string.alpha(12))).toBeNull()
  })

  it("returns null for empty or whitespace-only input", () => {
    expect(resolveCountry("")).toBeNull()
    expect(resolveCountry("   ")).toBeNull()
  })
})
