import { db } from "../../db"

export const filterCountriesByIds = (codes: string[]) =>
  db.query.countries.findMany({
    columns: { id: true },
    where: (c, { inArray }) => inArray(c.code, codes),
  })
