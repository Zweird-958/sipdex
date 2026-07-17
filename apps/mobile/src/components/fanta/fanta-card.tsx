import { useRouter } from "expo-router"
import { Image, Pressable, View } from "react-native"
import { CountryFlag } from "@/components/fanta/country-flag"
import { TasteButton } from "@/components/fanta/taste-button"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"

type Country = {
  name: string
  code: string
}

type FantaCardProps = {
  id: string
  flavour: string
  imageUrl: string
  countries: Country[]
  tasted: boolean | null
}

const MAX_COUNTRIES_DISPLAYED = 2

export const FantaCard = ({
  id,
  flavour,
  imageUrl,
  countries,
  tasted,
}: FantaCardProps) => {
  const router = useRouter()
  const firstCountries = countries.slice(0, MAX_COUNTRIES_DISPLAYED)

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/fanta/[id]", params: { id, flavour } })
      }
    >
      <Card className="flex-row items-center gap-4 p-3">
        <Image
          source={{ uri: imageUrl }}
          resizeMode="contain"
          className="h-16 w-16 rounded-md"
        />
        <View className="flex-1 gap-1">
          <Text variant="large">{flavour}</Text>
          {firstCountries.length > 0 && (
            <View className="flex-row gap-2">
              {firstCountries.map((country) => (
                <CountryFlag key={country.code} country={country} />
              ))}
            </View>
          )}
        </View>
        <TasteButton id={id} tasted={tasted} />
      </Card>
    </Pressable>
  )
}
