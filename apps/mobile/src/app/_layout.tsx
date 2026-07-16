import { PortalHost } from "@rn-primitives/portal"
import { Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from "sonner-native"
import { HeaderBackButton } from "@/components/header-back-button"
import { Providers } from "@/components/providers"
import { useHeaderOptions } from "@/hooks/use-header-options"
import "@/i18n"
import "../../global.css"

const RootLayout = () => {
  const { t } = useTranslation()
  const headerOptions = useHeaderOptions()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Providers>
          <Stack screenOptions={headerOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                title: t("settings.title"),
                headerLeft: () => <HeaderBackButton />,
              }}
            />
          </Stack>
        </Providers>
        <PortalHost />
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
