import { z } from "zod"

const configSchema = z.object({
  scheme: z.string(),
  storagePrefix: z.string(),
})

export const config = configSchema.parse({
  scheme: "mobile",
  storagePrefix: "fantadex",
})
