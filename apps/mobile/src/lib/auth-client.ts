import { createAuthClient } from "better-auth/react"
import { env } from "@/lib/env"

// The client targets the default `/api/auth` path, which matches the backend
// mount point, so the base URL only needs the server origin.
export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_API_URL,
})
