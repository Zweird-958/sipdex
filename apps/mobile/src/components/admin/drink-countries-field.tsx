import { type Control, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Label } from "@/components/ui/label"
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select"
import { Text } from "@/components/ui/text"
import type { CreateDrinkValues } from "@/types/drinks"

type DrinkCountriesFieldProps = {
  control: Control<CreateDrinkValues>
  options: MultiSelectOption[]
}

export const DrinkCountriesField = ({
  control,
  options,
}: DrinkCountriesFieldProps) => {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name="countryCodes"
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Label>{t("admin.drink.countries")}</Label>
          <MultiSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={t("admin.drink.countries")}
            searchPlaceholder={t("admin.drink.searchPlaceholder")}
            emptyText={t("admin.drink.empty")}
          />
          {error && (
            <Text className="text-destructive text-sm">
              {t(error.message ?? "errors.default")}
            </Text>
          )}
        </View>
      )}
    />
  )
}
