import type { z } from "zod"
import type { imageAssetSchema } from "@/schemas/images"

export type ImageAsset = z.infer<typeof imageAssetSchema>
