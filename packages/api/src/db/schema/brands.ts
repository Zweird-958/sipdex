import { relations } from "drizzle-orm"
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core"
import { commonColumns } from "../utils"
import { drinks } from "./drinks"

export const brands = pgTable(
  "brands",
  {
    ...commonColumns,
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoKey: text("logo_key").notNull(),
  },
  (t) => [
    uniqueIndex("brands_name_unique").on(t.name),
    uniqueIndex("brands_slug_unique").on(t.slug),
  ],
)

export const brandsRelations = relations(brands, ({ many }) => ({
  drinks: many(drinks),
}))
