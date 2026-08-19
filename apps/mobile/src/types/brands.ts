import type { z } from "zod"
import type { createBrandSchema } from "@/schemas/brands"

export type CreateBrandValues = z.infer<typeof createBrandSchema>
