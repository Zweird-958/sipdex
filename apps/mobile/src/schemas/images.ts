import { z } from "zod"

export const imageAssetSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().nullish(),
  mimeType: z.string().nullish(),
})
