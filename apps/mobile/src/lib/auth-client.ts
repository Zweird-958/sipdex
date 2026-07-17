import { expoClient } from "@better-auth/expo/client"
import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { config } from "@/lib/config"
import { env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: config.scheme,
      storagePrefix: config.storagePrefix,
      storage: SecureStore,
    }),
    adminClient(),
  ],
})
