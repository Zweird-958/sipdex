import type { AppType } from "@fantadex/api"
import { hc } from "hono/client"
import { env } from "@/lib/env"

export const client = hc<AppType>(env.EXPO_PUBLIC_API_URL)
