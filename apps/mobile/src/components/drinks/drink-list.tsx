import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FlatList, RefreshControl, View } from "react-native"
import { DrinkCard } from "@/components/drinks/drink-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"
import { useError } from "@/hooks/use-error"
import { useQuery } from "@/hooks/use-query"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { client } from "@/lib/api"
import { authClient } from "@/lib/auth-client"

export const DrinkList = () => {
  const { t } = useTranslation()
  const { onError } = useError("drink")
  const { foreground } = useThemeColors()
  const { data: session } = authClient.useSession()
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery(
    client.api.drinks.$get,
    { queryKey: ["drinks", session?.user.id] },
  )

  useEffect(() => {
    if (error) {
      onError(error)
    }
  }, [error, onError])

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text variant="muted">{t("errors.default")}</Text>
        <Button variant="outline" onPress={() => refetch()}>
          <Text>{t("retry")}</Text>
        </Button>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      data={data.result}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <DrinkCard {...item} />}
      contentContainerClassName="gap-3 p-4"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={foreground}
          colors={[foreground]}
        />
      }
    />
  )
}
