import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { isAuthorized } from "../handlers/is-authorized"
import { getBrand } from "../lib/brands/get-brand"
import { filterCountriesByIds } from "../lib/countries/filter-countries-by-ids"
import { createDrink } from "../lib/drinks/create-drink"
import { getDrink } from "../lib/drinks/get-drink"
import { isDrinkExisting } from "../lib/drinks/is-drink-existing"
import { listDrinks } from "../lib/drinks/list-drinks"
import { HTTP_CREATED_STATUS } from "../lib/http/constants"
import { slugify } from "../lib/slugify/slugify"
import { optionalAuth } from "../middleware/auth"
import { idParamSchema } from "../schemas/common"
import { createDrinkSchema } from "../schemas/drinks"
import { uploadImage } from "../storage"
import type { AppEnv } from "../types/http"

export const drinksRoutes = new Hono<AppEnv>()
  .get("/", optionalAuth, async ({ var: { send, user } }) =>
    send(await listDrinks(user?.id)),
  )
  .get(
    "/:id",
    optionalAuth,
    zValidator("param", idParamSchema),
    async ({ req, var: { send, fail, user } }) => {
      const { id } = req.valid("param")

      const result = await getDrink(id, user?.id)

      if (!result) {
        return fail("notFound", "Drink not found")
      }

      return send(result)
    },
  )
  .post(
    "/",
    ...isAuthorized({ drinks: ["create"] }),
    zValidator("form", createDrinkSchema),
    async ({ req, var: { send, fail } }) => {
      const { flavour, brandId, countryCodes, image } = req.valid("form")

      const brand = await getBrand(brandId)

      if (!brand) {
        return fail("badRequest", "Brand not found")
      }

      const slug = slugify(flavour)

      if (await isDrinkExisting(brandId, slug)) {
        return fail("conflict", "Flavour already exists for this brand")
      }

      const existingCountriesIds = await filterCountriesByIds(countryCodes)

      if (existingCountriesIds.length === 0) {
        return fail("badRequest", "No valid country IDs provided")
      }

      const imageKey = await uploadImage({
        image,
        folder: brand.slug,
        name: slug,
      })

      const { id } = await createDrink({
        flavour,
        slug,
        imageKey,
        brandId,
        countryIds: existingCountriesIds.map((c) => c.id),
      })

      const created = await getDrink(id)

      return send(created, {}, HTTP_CREATED_STATUS)
    },
  )
