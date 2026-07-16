import { useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { authClient } from "@/lib/auth-client"

export const ProfileView = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const onLogout = async () => {
    setIsLoading(true)
    await authClient.signOut()
  }

  return (
    <View className="bg-background flex-1 items-center justify-center gap-4 p-4">
      <Text variant="h2">{t("profile.title")}</Text>
      <Button variant="outline" isLoading={isLoading} onPress={onLogout}>
        <Text>{t("profile.logout")}</Text>
      </Button>
    </View>
  )
}
