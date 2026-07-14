import { db } from "../db"
import { countries } from "../db/schema"

export const getCountries = () =>
  db.select().from(countries).orderBy(countries.name)

export const createCountry = async (values: { name: string; code: string }) => {
  const [created] = await db.insert(countries).values(values).returning()

  return created
}

export const filterCountriesByIds = (codes: string[]) =>
  db.query.countries.findMany({
    columns: { id: true },
    where: (c, { inArray }) => inArray(c.code, codes),
  })
