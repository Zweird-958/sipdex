import type { z } from "zod"
import type { createFantaSchema, imageAssetSchema } from "@/schemas/fanta"

export type ImageAsset = z.infer<typeof imageAssetSchema>
export type CreateFantaValues = z.infer<typeof createFantaSchema>
