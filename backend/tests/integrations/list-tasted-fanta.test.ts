import { describe, expect, it } from "vitest"
import { listTastedFanta } from "../../src/lib/fanta/list-tasted-fanta"
import { useTestDb } from "../helpers/db"
import { insertFanta, insertTasting, insertUser } from "../helpers/factories"

describe("listTastedFanta", () => {
  useTestDb()

  it("returns only the fanta the user has tasted, all flagged tasted", async () => {
    const user = await insertUser()
    const first = await insertFanta()
    const second = await insertFanta()

    await insertFanta()
    await insertTasting(user.id, first.id)
    await insertTasting(user.id, second.id)

    const result = await listTastedFanta(user.id)

    expect(result.map((f) => f.id).sort()).toEqual([first.id, second.id].sort())
    expect(result.every((f) => f.tasted === true)).toBe(true)
  })

  it("does not return fanta tasted by other users", async () => {
    const user = await insertUser()
    const other = await insertUser()
    const fanta = await insertFanta()
    await insertTasting(other.id, fanta.id)

    expect(await listTastedFanta(user.id)).toEqual([])
  })

  it("returns an empty array when the user has tasted nothing", async () => {
    const user = await insertUser()

    expect(await listTastedFanta(user.id)).toEqual([])
  })
})
