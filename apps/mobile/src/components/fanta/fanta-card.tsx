import { useTranslation } from "react-i18next"
import { Image, View } from "react-native"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { countryCodeToFlag } from "@/lib/country-flag"
import { getCountryName } from "@/lib/country-name"

type Country = {
  name: string
  code: string
}

type FantaCardProps = {
  flavour: string
  imageUrl: string
  countries: Country[]
}

const MAX_COUNTRIES_DISPLAYED = 2

export const FantaCard = ({ flavour, imageUrl, countries }: FantaCardProps) => {
  const { i18n } = useTranslation()
  const firstCountries = countries.slice(0, MAX_COUNTRIES_DISPLAYED)

  return (
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
              <Tooltip key={country.code}>
                <TooltipTrigger>
                  <Text className="text-lg">
                    {countryCodeToFlag(country.code)}
                  </Text>
                </TooltipTrigger>
                <TooltipContent>
                  <Text>{getCountryName(country.code, i18n.language)}</Text>
                </TooltipContent>
              </Tooltip>
            ))}
          </View>
        )}
      </View>
    </Card>
  )
}
