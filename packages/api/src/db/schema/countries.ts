import { relations } from "drizzle-orm"
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core"
import { commonColumns } from "../utils"
import { fantaCountries } from "./fanta"

export const countries = pgTable(
  "countries",
  {
    ...commonColumns,
    name: text("name").notNull(),
    code: text("code").notNull(),
  },
  (t) => [uniqueIndex("countries_name_unique").on(t.name)],
)

export const countriesRelations = relations(countries, ({ many }) => ({
  fantaCountries: many(fantaCountries),
}))
