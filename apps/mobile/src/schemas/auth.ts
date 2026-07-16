import { z } from "zod"

const PASSWORD_MIN_LENGTH = 8

// Requires at least one lowercase, uppercase, number and special character.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/u

export const signUpSchema = z
  .object({
    email: z.email("auth.errors.emailInvalid").trim(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "auth.errors.passwordMin")
      .regex(PASSWORD_PATTERN, "auth.errors.passwordWeak"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "auth.errors.passwordMismatch",
    path: ["confirmPassword"],
  })
