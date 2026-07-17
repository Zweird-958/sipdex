import { z } from "zod"

export const imageAssetSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().nullish(),
  mimeType: z.string().nullish(),
})

export const createFantaSchema = z.object({
  flavour: z.string().trim().min(1, "admin.fanta.errors.flavourRequired"),
  countryCodes: z
    .array(z.string())
    .min(1, "admin.fanta.errors.countriesRequired"),
  image: imageAssetSchema
    .optional()
    .refine((value) => Boolean(value), "admin.fanta.errors.imageRequired"),
})
