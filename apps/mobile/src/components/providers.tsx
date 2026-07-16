import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { SettingsProvider } from "@/components/settings/settings-provider"

const queryClient = new QueryClient()

export const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>{children}</SettingsProvider>
  </QueryClientProvider>
)
