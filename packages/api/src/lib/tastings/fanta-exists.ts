import { db } from "../../db"

export const fantaExists = async (id: string) => {
  const fantaResult = await db.query.fanta.findFirst({
    where: (f, operators) => operators.eq(f.id, id),
  })

  return Boolean(fantaResult)
}
