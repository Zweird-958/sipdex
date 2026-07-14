import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { isAuthorized } from "../handlers/is-authorized"
import { HTTP_CREATED_STATUS } from "../lib/constants"
import { slugify } from "../lib/slugify"
import { optionalAuth } from "../middleware/auth"
import { idParamSchema } from "../schemas/common"
import { createFantaSchema } from "../schemas/fanta"
import { filterCountriesByIds } from "../services/countries"
import {
  createFanta,
  getFanta,
  isFlavourExisting,
  listFanta,
} from "../services/fanta"
import { uploadImage } from "../storage"
import type { AppEnv } from "../types/http"

const IMAGE_FANTA_FOLDER = "fanta"

export const fantaRoutes = new Hono<AppEnv>()

fantaRoutes.get("/", optionalAuth, async ({ var: { send, user } }) =>
  send(await listFanta(user?.id)),
)

fantaRoutes.get(
  "/:id",
  optionalAuth,
  zValidator("param", idParamSchema),
  async ({ req, var: { send, fail, user } }) => {
    const { id } = req.valid("param")

    const result = await getFanta(id, user?.id)

    if (!result) {
      return fail("notFound", "Fanta not found")
    }

    return send(result)
  },
)

fantaRoutes.post(
  "/",
  ...isAuthorized({ fanta: ["create"] }),
  zValidator("form", createFantaSchema),
  async ({ req, var: { send, fail } }) => {
    const { flavour, countryCodes, image } = req.valid("form")

    if (await isFlavourExisting(flavour)) {
      return fail("conflict", "Flavour already exists")
    }

    const existingCountriesIds = await filterCountriesByIds(countryCodes)

    if (existingCountriesIds.length === 0) {
      return fail("badRequest", "No valid country IDs provided")
    }

    const imageKey = await uploadImage({
      image,
      folder: IMAGE_FANTA_FOLDER,
      name: slugify(flavour),
    })

    const { id } = await createFanta({
      flavour,
      imageKey,
      countryIds: existingCountriesIds.map((c) => c.id),
    })

    const created = await getFanta(id)

    return send(created, {}, HTTP_CREATED_STATUS)
  },
)
