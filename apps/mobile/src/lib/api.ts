import type { AppType } from "@fantadex/api"
import { hc } from "hono/client"

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

export const client = hc<AppType>(baseUrl)
