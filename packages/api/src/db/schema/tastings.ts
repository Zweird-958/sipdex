import { relations } from "drizzle-orm"
import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"
import { users } from "./auth"
import { drinks } from "./drinks"

export const tastings = pgTable(
  "tastings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    drinkId: uuid("drink_id")
      .notNull()
      .references(() => drinks.id, { onDelete: "cascade" }),
    tastedAt: timestamp("tasted_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.drinkId] })],
)

export const tastingsRelations = relations(tastings, ({ one }) => ({
  drink: one(drinks, {
    fields: [tastings.drinkId],
    references: [drinks.id],
  }),
  user: one(users, {
    fields: [tastings.userId],
    references: [users.id],
  }),
}))
