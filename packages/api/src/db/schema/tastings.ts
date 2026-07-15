import { relations } from "drizzle-orm"
import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"
import { users } from "./auth"
import { fanta } from "./fanta"

export const tastings = pgTable(
  "tastings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fantaId: uuid("fanta_id")
      .notNull()
      .references(() => fanta.id, { onDelete: "cascade" }),
    tastedAt: timestamp("tasted_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.fantaId] })],
)

export const tastingsRelations = relations(tastings, ({ one }) => ({
  fanta: one(fanta, {
    fields: [tastings.fantaId],
    references: [fanta.id],
  }),
  user: one(users, {
    fields: [tastings.userId],
    references: [users.id],
  }),
}))
