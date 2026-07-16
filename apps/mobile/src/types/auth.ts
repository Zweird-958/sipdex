import type { z } from "zod"
import type { signUpSchema } from "@/schemas/auth"

export type SignUpValues = z.infer<typeof signUpSchema>
