import { relations } from "drizzle-orm"
import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core"
import { commonColumns } from "../utils"
import { countries } from "./countries"
import { tastings } from "./tastings"

export const fanta = pgTable("fanta", {
  ...commonColumns,
  flavour: text("flavour").notNull().unique(),
  imageKey: text("image_key").notNull(),
})

export const fantaCountries = pgTable(
  "fanta_countries",
  {
    fantaId: uuid("fanta_id")
      .notNull()
      .references(() => fanta.id, { onDelete: "cascade" }),
    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.fantaId, t.countryId] })],
)

export const fantaRelations = relations(fanta, ({ many }) => ({
  fantaCountries: many(fantaCountries),
  tastings: many(tastings),
}))

export const fantaCountriesRelations = relations(fantaCountries, ({ one }) => ({
  fanta: one(fanta, {
    fields: [fantaCountries.fantaId],
    references: [fanta.id],
  }),
  country: one(countries, {
    fields: [fantaCountries.countryId],
    references: [countries.id],
  }),
}))
