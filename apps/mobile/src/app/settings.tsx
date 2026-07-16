import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { SettingSelect } from "@/components/settings/setting-select"
import {
  type LanguageChoice,
  type ThemeChoice,
  useSettings,
} from "@/components/settings/settings-provider"
import { Text } from "@/components/ui/text"

const THEMES: ThemeChoice[] = ["system", "light", "dark"]
const LANGUAGES: LanguageChoice[] = ["en", "fr"]

const SettingsScreen = () => {
  const { t } = useTranslation()
  const { theme, language, setTheme, setLanguage } = useSettings()

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 p-4"
    >
      <View className="gap-2">
        <Text variant="large">{t("settings.theme.label")}</Text>
        <SettingSelect
          value={theme}
          onChange={(value) => setTheme(value as ThemeChoice)}
          options={THEMES.map((value) => ({
            value,
            label: t(`settings.theme.${value}`),
          }))}
        />
      </View>

      <View className="gap-2">
        <Text variant="large">{t("settings.language.label")}</Text>
        <SettingSelect
          value={language}
          onChange={(value) => setLanguage(value as LanguageChoice)}
          options={LANGUAGES.map((value) => ({
            value,
            label: t(`settings.language.${value}`),
          }))}
        />
      </View>
    </ScrollView>
  )
}

export default SettingsScreen
