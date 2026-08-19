import type { z } from "zod"
import type { createDrinkSchema } from "@/schemas/drinks"

export type CreateDrinkValues = z.infer<typeof createDrinkSchema>
