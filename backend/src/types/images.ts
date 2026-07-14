import type z from "zod"
import type { image } from "../schemas/images"

export type Image = z.infer<typeof image>
