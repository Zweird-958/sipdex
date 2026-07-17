import { describe, expect, it } from "vitest"
import { listFanta } from "../../src/lib/fanta/list-fanta"
import { useTestDb } from "../helpers/db"
import { insertFanta, insertTasting, insertUser } from "../helpers/factories"

describe("listFanta", () => {
  useTestDb()

  it("returns an empty array when there is no fanta", async () => {
    expect(await listFanta()).toEqual([])
  })

  it("returns every fanta ordered by id", async () => {
    const a = await insertFanta()
    const b = await insertFanta()
    const c = await insertFanta()

    const result = await listFanta()

    const expectedIds = [a.id, b.id, c.id].sort()
    expect(result.map((f) => f.id)).toEqual(expectedIds)
    expect(result.every((f) => f.tasted === null)).toBe(true)
  })

  it("flags only the fanta the given user has tasted", async () => {
    const tasted = await insertFanta()
    const untasted = await insertFanta()
    const user = await insertUser()
    await insertTasting(user.id, tasted.id)

    const result = await listFanta(user.id)
    const byId = new Map(result.map((f) => [f.id, f.tasted]))

    expect(byId.get(tasted.id)).toBe(true)
    expect(byId.get(untasted.id)).toBe(false)
  })
})
