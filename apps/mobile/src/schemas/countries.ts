import { z } from "zod"

export const createCountrySchema = z.object({
  name: z.string().trim().min(1, "admin.countries.errors.nameRequired"),
})
