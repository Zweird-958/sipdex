import { Tabs } from "expo-router"
import { House, User } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { SettingsHeaderButton } from "@/components/settings/settings-header-button"
import { useHeaderOptions } from "@/hooks/use-header-options"
import { useThemeColors } from "@/hooks/use-theme-colors"

const HOME_TITLE = "Fantadex"

const TabsLayout = () => {
  const { t } = useTranslation()
  const headerOptions = useHeaderOptions()
  const { background, foreground, mutedForeground } = useThemeColors()

  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
        tabBarStyle: { backgroundColor: background },
        tabBarActiveTintColor: foreground,
        tabBarInactiveTintColor: mutedForeground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: HOME_TITLE,
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
          headerRight: () => <SettingsHeaderButton />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}

export default TabsLayout
