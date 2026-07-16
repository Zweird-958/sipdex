import { PortalHost } from "@rn-primitives/portal"
import { Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from "sonner-native"
import { HeaderBackButton } from "@/components/header-back-button"
import { Providers } from "@/components/providers"
import { SettingsHeaderButton } from "@/components/settings/settings-header-button"
import { useThemeColors } from "@/hooks/use-theme-colors"
import "@/i18n"
import "../../global.css"

const TITLE = "Fantadex"

const RootLayout = () => {
  const { t } = useTranslation()
  const { background, foreground } = useThemeColors()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Providers>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: background },
              headerTintColor: foreground,
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: TITLE,
                headerRight: () => <SettingsHeaderButton />,
              }}
            />
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
