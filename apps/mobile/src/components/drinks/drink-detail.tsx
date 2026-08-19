import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Image, ScrollView, View } from "react-native"
import { CountryFlag } from "@/components/drinks/country-flag"
import { TasteButton } from "@/components/drinks/taste-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Text } from "@/components/ui/text"
import { useError } from "@/hooks/use-error"
import { useQuery } from "@/hooks/use-query"
import { client } from "@/lib/api"

type DrinkDetailProps = {
  id: string
}

export const DrinkDetail = ({ id }: DrinkDetailProps) => {
  const { t } = useTranslation()
  const { onError } = useError("drink")
  const { data, isPending, isError, error } = useQuery(
    () => client.api.drinks[":id"].$get({ param: { id } }),
    { queryKey: ["drinks", id] },
  )

  useEffect(() => {
    if (error) {
      onError(error)
    }
  }, [error, onError])

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center gap-6 p-4">
        <Skeleton className="h-56 w-56 rounded-xl" />
        <Skeleton className="h-8 w-40 rounded-md" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-4">
        <Text variant="muted">{t("errors.default")}</Text>
      </View>
    )
  }

  const { imageUrl, brand, countries, tasted } = data.result

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="items-center gap-6 p-4"
    >
      <Image
        source={{ uri: imageUrl }}
        resizeMode="contain"
        className="h-56 w-56 rounded-xl"
      />
      <View className="flex-row items-center gap-2">
        <Image
          source={{ uri: brand.logoUrl }}
          resizeMode="contain"
          className="h-8 w-8 rounded-full"
        />
        <Text variant="large">{brand.name}</Text>
      </View>
      <TasteButton id={id} tasted={tasted} />
      <View className="flex-row flex-wrap justify-center gap-3">
        {countries.map((country) => (
          <CountryFlag
            key={country.code}
            country={country}
            className="text-3xl"
          />
        ))}
      </View>
    </ScrollView>
  )
}
