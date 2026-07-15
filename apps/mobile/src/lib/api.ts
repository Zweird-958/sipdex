import type { AppType } from "@fantadex/api"
import { hc } from "hono/client"

const envBaseUrl: unknown = process.env.EXPO_PUBLIC_API_URL
const baseUrl =
  typeof envBaseUrl === "string" ? envBaseUrl : "http://localhost:3000"

export const client = hc<AppType>(baseUrl)
