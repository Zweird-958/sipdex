import type { z } from "zod"
import type { createCountrySchema } from "@/schemas/countries"

export type CreateCountryValues = z.infer<typeof createCountrySchema>
