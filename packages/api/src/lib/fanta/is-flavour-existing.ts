import { db } from "../../db"

export const isFlavourExisting = async (flavour: string) => {
  const existing = await db.query.fanta.findFirst({
    where: (f, { eq }) => eq(f.flavour, flavour),
  })

  return Boolean(existing)
}
