import { type Control, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Label } from "@/components/ui/label"
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select"
import { Text } from "@/components/ui/text"
import type { CreateFantaValues } from "@/types/fanta"

type FantaCountriesFieldProps = {
  control: Control<CreateFantaValues>
  options: MultiSelectOption[]
}

export const FantaCountriesField = ({
  control,
  options,
}: FantaCountriesFieldProps) => {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name="countryCodes"
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Label>{t("admin.fanta.countries")}</Label>
          <MultiSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={t("admin.fanta.countries")}
            searchPlaceholder={t("admin.fanta.searchPlaceholder")}
            emptyText={t("admin.fanta.empty")}
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
