import { type Control, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Text } from "@/components/ui/text"
import type { CreateDrinkValues } from "@/types/drinks"

type BrandOption = { value: string; label: string }

type BrandSelectFieldProps = {
  control: Control<CreateDrinkValues>
  options: BrandOption[]
}

export const BrandSelectField = ({
  control,
  options,
}: BrandSelectFieldProps) => {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name="brandId"
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const selected = options.find((option) => option.value === value)

        return (
          <View className="gap-1.5">
            <Label>{t("admin.drink.brand")}</Label>
            <Select
              value={selected}
              onValueChange={(option) => onChange(option?.value ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.drink.brandPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                  />
                ))}
              </SelectContent>
            </Select>
            {error && (
              <Text className="text-destructive text-sm">
                {t(error.message ?? "errors.default")}
              </Text>
            )}
          </View>
        )
      }}
    />
  )
}
