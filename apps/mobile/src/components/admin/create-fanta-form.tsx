import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { File } from "expo-file-system"
import { fetch as expoFetch } from "expo/fetch"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { toast } from "sonner-native"
import { ApiClientError } from "@/api/errors"
import { FantaCountriesField } from "@/components/admin/fanta-countries-field"
import { FantaImageField } from "@/components/admin/fanta-image-field"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useError } from "@/hooks/use-error"
import { useQuery } from "@/hooks/use-query"
import { client } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { createFantaSchema } from "@/schemas/fanta"
import type { CreateFantaValues } from "@/types/fanta"

type FantaUploadResponse = {
  result?: { flavour: string }
  error?: string
  key?: string
}

export const CreateFantaForm = () => {
  const { t } = useTranslation()
  const { onError } = useError("fanta")
  const queryClient = useQueryClient()

  const { data } = useQuery(client.api.countries.$get, {
    queryKey: ["countries"],
  })
  const countryOptions = (data?.result ?? []).map((country) => ({
    label: country.name,
    value: country.code,
  }))

  const { control, handleSubmit, reset } = useForm<CreateFantaValues>({
    resolver: zodResolver(createFantaSchema),
    defaultValues: { flavour: "", countryCodes: [] },
  })

  const create = useMutation<
    FantaUploadResponse,
    ApiClientError,
    CreateFantaValues
  >({
    mutationFn: async ({ flavour, countryCodes, image }) => {
      if (!image) {
        throw new ApiClientError("Image is required", 400, "BAD_REQUEST")
      }

      // Append an expo-file-system `File` so the multipart part carries a real
      // filename + content type (ImagePicker's fileName/mimeType are often
      // undefined). expo/fetch streams it; the session cookie is attached
      // manually since this bypasses the hono client's fetch.
      const cookie = authClient.getCookie()
      const formData = new FormData()
      formData.append("flavour", flavour)
      formData.append("countryCodes", countryCodes.join(","))
      formData.append("image", new File(image.uri))

      const response = await expoFetch(client.api.fanta.$url().toString(), {
        method: "POST",
        body: formData,
        headers: cookie ? { Cookie: cookie } : {},
      })

      const body = (await response.json()) as FantaUploadResponse

      if (!response.ok) {
        throw new ApiClientError(
          body.error ?? "",
          response.status,
          body.key ?? "INTERNAL_ERROR",
        )
      }

      return body
    },
    onError,
    onSuccess: (body) => {
      reset()
      void queryClient.invalidateQueries({ queryKey: ["fanta"] })

      if (body.result) {
        toast.success(
          t("admin.fanta.success", { flavour: body.result.flavour }),
        )
      }
    },
  })

  const onSubmit = handleSubmit((values) => create.mutate(values))

  return (
    <View className="gap-4">
      <FormField
        control={control}
        name="flavour"
        label={t("admin.fanta.flavour")}
        autoCapitalize="words"
      />
      <FantaCountriesField control={control} options={countryOptions} />
      <FantaImageField control={control} />
      <Button onPress={onSubmit} isLoading={create.isPending}>
        <Text>{t("admin.fanta.submit")}</Text>
      </Button>
    </View>
  )
}
