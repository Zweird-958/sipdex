import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { type TextInputProps, View } from "react-native"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
} & TextInputProps

export const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: FormFieldProps<T>) => {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className="gap-1.5">
          <Label>{label}</Label>
          <Input
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...inputProps}
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
