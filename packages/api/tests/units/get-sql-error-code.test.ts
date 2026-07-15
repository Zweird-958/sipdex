import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { getSqlErrorCode } from "../../src/lib/sql/get-sql-error-code"

describe("getSqlErrorCode", () => {
  it("returns a top-level error code", () => {
    const code = faker.string.numeric(5)

    expect(getSqlErrorCode({ code })).toBe(code)
  })

  it("falls back to the cause's code", () => {
    const code = faker.string.numeric(5)

    expect(getSqlErrorCode({ cause: { code } })).toBe(code)
  })

  it("prefers the top-level code over the cause's code", () => {
    expect(getSqlErrorCode({ code: "top", cause: { code: "nested" } })).toBe(
      "top",
    )
  })

  it("returns null when no code is present", () => {
    expect(getSqlErrorCode({})).toBeNull()
    expect(getSqlErrorCode({ cause: {} })).toBeNull()
    expect(getSqlErrorCode(new Error("boom"))).toBeNull()
  })
})
