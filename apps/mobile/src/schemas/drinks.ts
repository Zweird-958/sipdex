import { z } from "zod"
import { imageAssetSchema } from "@/schemas/images"

export const createDrinkSchema = z.object({
  flavour: z.string().trim().min(1, "admin.drink.errors.flavourRequired"),
  brandId: z.string().min(1, "admin.drink.errors.brandRequired"),
  countryCodes: z
    .array(z.string())
    .min(1, "admin.drink.errors.countriesRequired"),
  image: imageAssetSchema
    .optional()
    .refine((value) => Boolean(value), "admin.drink.errors.imageRequired"),
})
