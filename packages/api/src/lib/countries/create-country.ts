import { db } from "../../db"
import { countries } from "../../db/schema"

export const createCountry = async (values: { name: string; code: string }) => {
  const [created] = await db.insert(countries).values(values).returning()

  return created
}
