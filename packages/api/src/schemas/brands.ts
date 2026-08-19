import { z } from "zod"
import { trimmedStringSchema } from "./common"
import { image } from "./images"

export const createBrandSchema = z.object({
  name: trimmedStringSchema,
  image,
})
