import { relations } from "drizzle-orm"
import {
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { commonColumns } from "../utils"
import { brands } from "./brands"
import { countries } from "./countries"
import { tastings } from "./tastings"

export const drinks = pgTable(
  "drinks",
  {
    ...commonColumns,
    flavour: text("flavour").notNull(),
    slug: text("slug").notNull(),
    imageKey: text("image_key").notNull(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "restrict" }),
  },
  (t) => [uniqueIndex("drinks_brand_slug_unique").on(t.brandId, t.slug)],
)

export const drinkCountries = pgTable(
  "drink_countries",
  {
    drinkId: uuid("drink_id")
      .notNull()
      .references(() => drinks.id, { onDelete: "cascade" }),
    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.drinkId, t.countryId] })],
)

export const drinksRelations = relations(drinks, ({ one, many }) => ({
  brand: one(brands, {
    fields: [drinks.brandId],
    references: [brands.id],
  }),
  drinkCountries: many(drinkCountries),
  tastings: many(tastings),
}))

export const drinkCountriesRelations = relations(drinkCountries, ({ one }) => ({
  drink: one(drinks, {
    fields: [drinkCountries.drinkId],
    references: [drinks.id],
  }),
  country: one(countries, {
    fields: [drinkCountries.countryId],
    references: [countries.id],
  }),
}))
