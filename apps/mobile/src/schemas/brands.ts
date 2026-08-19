import { z } from "zod"
import { imageAssetSchema } from "@/schemas/images"

export const createBrandSchema = z.object({
  name: z.string().trim().min(1, "admin.brands.errors.nameRequired"),
  image: imageAssetSchema
    .optional()
    .refine((value) => Boolean(value), "admin.brands.errors.imageRequired"),
})
