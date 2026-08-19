import { db } from "../../db"

export const isDrinkExisting = async (brandId: string, slug: string) => {
  const existing = await db.query.drinks.findFirst({
    where: (d, { and, eq }) => and(eq(d.brandId, brandId), eq(d.slug, slug)),
  })

  return Boolean(existing)
}
