import { db } from "../../db"
import { countries } from "../../db/schema"

export const getCountries = () =>
  db.select().from(countries).orderBy(countries.name)
