import z from "zod"

export const idParamSchema = z.object({
  id: z.string(),
})

export const trimmedStringSchema = z.string().trim().min(1)
