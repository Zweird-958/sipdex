import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { toast } from "sonner-native"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useError } from "@/hooks/use-error"
import { useMutation } from "@/hooks/use-mutation"
import { client } from "@/lib/api"
import { createCountrySchema } from "@/schemas/countries"
import type { CreateCountryValues } from "@/types/countries"

export const CreateCountryForm = () => {
  const { t } = useTranslation()
  const { onError } = useError("countries")
  const { control, handleSubmit, reset } = useForm<CreateCountryValues>({
    resolver: zodResolver(createCountrySchema),
    defaultValues: { name: "" },
  })

  const create = useMutation(client.api.countries.$post, {
    onError,
    onSuccess: (data) => {
      reset()

      if (!("result" in data)) {
        return
      }

      toast.success(t("admin.countries.success", { name: data.result.name }))
    },
  })

  const onSubmit = handleSubmit(({ name }) => create.mutate({ json: { name } }))

  return (
    <View className="gap-4">
      <FormField
        control={control}
        name="name"
        label={t("admin.countries.label")}
        placeholder={t("admin.countries.placeholder")}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button onPress={onSubmit} isLoading={create.isPending}>
        <Text>{t("admin.countries.submit")}</Text>
      </Button>
    </View>
  )
}
