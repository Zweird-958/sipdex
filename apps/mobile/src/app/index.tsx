import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Text } from "@/components/ui/text"

export default function HomeScreen() {
  const { t } = useTranslation()

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Text variant="h1">{t("welcome")}</Text>
    </View>
  )
}
