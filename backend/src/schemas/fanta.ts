import { z } from "zod"
import { trimmedStringSchema } from "./common"
import { image } from "./images"

export const createFantaSchema = z.object({
  flavour: trimmedStringSchema,
  countryCodes: z
    .string()
    .transform((value) =>
      value.split(",").map((code) => code.trim().toUpperCase()),
    )
    .pipe(z.array(z.string()).min(1, "at least one country is required")),
  image,
})
