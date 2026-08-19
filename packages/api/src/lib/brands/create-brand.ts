import { db } from "../../db"
import { brands } from "../../db/schema"
import { getImageUrl } from "../../storage"

export const createBrand = async (values: {
  name: string
  slug: string
  logoKey: string
}) => {
  const [created] = await db.insert(brands).values(values).returning({
    id: brands.id,
    name: brands.name,
    logoKey: brands.logoKey,
  })

  return {
    id: created.id,
    name: created.name,
    logoUrl: getImageUrl(created.logoKey),
  }
}
