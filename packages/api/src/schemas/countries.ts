import z from "zod"
import { trimmedStringSchema } from "./common"

export const createCountrySchema = z.object({
  name: trimmedStringSchema,
})
