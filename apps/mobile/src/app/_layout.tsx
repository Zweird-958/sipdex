import { PortalHost } from "@rn-primitives/portal"
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from "sonner-native"
import { Providers } from "@/components/providers"
import "@/i18n"
import "../../global.css"

const TITLE = "Fantadex"

const RootLayout = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <Providers>
        <Stack>
          <Stack.Screen name="index" options={{ title: TITLE }} />
        </Stack>
      </Providers>
      <PortalHost />
      <Toaster />
    </SafeAreaProvider>
  </GestureHandlerRootView>
)

export default RootLayout
