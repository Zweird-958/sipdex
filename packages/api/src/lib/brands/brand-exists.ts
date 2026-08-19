import { db } from "../../db"

export const brandExists = async (slug: string) => {
  const existing = await db.query.brands.findFirst({
    where: (b, { eq }) => eq(b.slug, slug),
  })

  return Boolean(existing)
}
