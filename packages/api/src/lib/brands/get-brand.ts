import { db } from "../../db"

export const getBrand = async (id: string) => {
  const brand = await db.query.brands.findFirst({
    columns: { id: true, slug: true },
    where: (b, { eq }) => eq(b.id, id),
  })

  return brand ?? null
}
