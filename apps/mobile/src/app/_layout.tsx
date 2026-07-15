import { PortalHost } from "@rn-primitives/portal"
import { Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import "@/i18n"
import "../../global.css"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </SafeAreaProvider>
  )
}
