import type { AppType } from "@fantadex/api"
import { hc } from "hono/client"
import { authClient } from "@/lib/auth-client"
import { env } from "@/lib/env"

type FetchParams = Parameters<typeof fetch>

export const client = hc<AppType>(env.EXPO_PUBLIC_API_URL, {
  async headers() {
    const cookies = await authClient.getCookie()

    return { Cookie: cookies }
  },
  fetch: async (
    input: FetchParams[0],
    init: FetchParams[1],
  ): Promise<Response> => {
    const response = await fetch(input, { credentials: "omit", ...init })

    return response
  },
})
