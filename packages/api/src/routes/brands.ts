import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { isAuthorized } from "../handlers/is-authorized"
import { brandExists } from "../lib/brands/brand-exists"
import { createBrand } from "../lib/brands/create-brand"
import { getBrands } from "../lib/brands/get-brands"
import { HTTP_CREATED_STATUS } from "../lib/http/constants"
import { slugify } from "../lib/slugify/slugify"
import { SQL_ERROR_CODES } from "../lib/sql/constants"
import { getSqlErrorCode } from "../lib/sql/get-sql-error-code"
import { createBrandSchema } from "../schemas/brands"
import { uploadImage } from "../storage"
import type { AppEnv } from "../types/http"

const IMAGE_BRAND_FOLDER = "brands"

export const brandsRoutes = new Hono<AppEnv>()
  .get("/", async ({ var: { send } }) => send(await getBrands()))
  .post(
    "/",
    ...isAuthorized({ brands: ["create"] }),
    zValidator("form", createBrandSchema),
    async ({ req, var: { send, fail } }) => {
      const { name, image } = req.valid("form")

      const slug = slugify(name)

      if (await brandExists(slug)) {
        return fail("conflict", `Brand "${name}" already exists`)
      }

      const logoKey = await uploadImage({
        image,
        folder: IMAGE_BRAND_FOLDER,
        name: slug,
      })

      try {
        const created = await createBrand({ name, slug, logoKey })

        return send(created, {}, HTTP_CREATED_STATUS)
      } catch (err) {
        if (getSqlErrorCode(err) === SQL_ERROR_CODES.UNIQUE_VIOLATION) {
          return fail("conflict", `Brand "${name}" already exists`)
        }

        throw err
      }
    },
  )
