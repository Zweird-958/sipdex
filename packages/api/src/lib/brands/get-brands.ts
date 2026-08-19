import { db } from "../../db"
import { brands } from "../../db/schema"
import { getImageUrl } from "../../storage"

export const getBrands = async () => {
  const rows = await db
    .select({
      id: brands.id,
      name: brands.name,
      logoKey: brands.logoKey,
    })
    .from(brands)
    .orderBy(brands.name)

  return rows.map((brand) => ({
    id: brand.id,
    name: brand.name,
    logoUrl: getImageUrl(brand.logoKey),
  }))
}
