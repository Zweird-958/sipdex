import { useTranslation } from "react-i18next"
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

type CountryFlagProps = {
  country: Country
  className?: string
}

export const CountryFlag = ({
  country,
  className = "text-lg",
}: CountryFlagProps) => {
  const { i18n } = useTranslation()

  return (
    <Tooltip>
      <TooltipTrigger>
        <Text className={className}>{countryCodeToFlag(country.code)}</Text>
      </TooltipTrigger>
      <TooltipContent>
        <Text>{getCountryName(country.code, i18n.language)}</Text>
      </TooltipContent>
    </Tooltip>
  )
}
