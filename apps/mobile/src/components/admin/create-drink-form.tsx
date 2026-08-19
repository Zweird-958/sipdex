import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { File } from "expo-file-system"
import { fetch as expoFetch } from "expo/fetch"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { toast } from "sonner-native"
import { ApiClientError } from "@/api/errors"
import { BrandSelectField } from "@/components/admin/brand-select-field"
import { DrinkCountriesField } from "@/components/admin/drink-countries-field"
import { ImageField } from "@/components/admin/image-field"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useError } from "@/hooks/use-error"
import { useQuery } from "@/hooks/use-query"
import { client } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { createDrinkSchema } from "@/schemas/drinks"
import type { CreateDrinkValues } from "@/types/drinks"

type DrinkUploadResponse = {
  result?: { flavour: string }
  error?: string
  key?: string
}

export const CreateDrinkForm = () => {
  const { t } = useTranslation()
  const { onError } = useError("drink")
  const queryClient = useQueryClient()

  const { data: countriesData } = useQuery(client.api.countries.$get, {
    queryKey: ["countries"],
  })
  const countryOptions = (countriesData?.result ?? []).map((country) => ({
    label: country.name,
    value: country.code,
  }))

  const { data: brandsData } = useQuery(client.api.brands.$get, {
    queryKey: ["brands"],
  })
  const brandOptions = (brandsData?.result ?? []).map((brand) => ({
    label: brand.name,
    value: brand.id,
  }))

  const { control, handleSubmit, reset } = useForm<CreateDrinkValues>({
    resolver: zodResolver(createDrinkSchema),
    defaultValues: { flavour: "", brandId: "", countryCodes: [] },
  })

  const create = useMutation<
    DrinkUploadResponse,
    ApiClientError,
    CreateDrinkValues
  >({
    mutationFn: async ({ flavour, brandId, countryCodes, image }) => {
      if (!image) {
        throw new ApiClientError("Image is required", 400, "BAD_REQUEST")
      }

      // Append an expo-file-system `File` so the multipart part carries a real
      // filename + content type (ImagePicker's fileName/mimeType are often
      // undefined). expo/fetch streams it; the session cookie is attached
      // manually since this bypasses the hono client's fetch.
      const cookie = await authClient.getCookie()
      const formData = new FormData()
      formData.append("flavour", flavour)
      formData.append("brandId", brandId)
      formData.append("countryCodes", countryCodes.join(","))
      formData.append("image", new File(image.uri))

      const response = await expoFetch(client.api.drinks.$url().toString(), {
        method: "POST",
        body: formData,
        headers: cookie ? { Cookie: cookie } : {},
      })

      const body = (await response.json()) as DrinkUploadResponse

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
      void queryClient.invalidateQueries({ queryKey: ["drinks"] })

      if (body.result) {
        toast.success(
          t("admin.drink.success", { flavour: body.result.flavour }),
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
        label={t("admin.drink.flavour")}
        autoCapitalize="words"
      />
      <BrandSelectField control={control} options={brandOptions} />
      <DrinkCountriesField control={control} options={countryOptions} />
      <ImageField
        control={control}
        name="image"
        label={t("admin.drink.image")}
      />
      <Button onPress={onSubmit} isLoading={create.isPending}>
        <Text>{t("admin.drink.submit")}</Text>
      </Button>
    </View>
  )
}
