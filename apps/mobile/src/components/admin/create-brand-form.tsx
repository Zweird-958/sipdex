import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { File } from "expo-file-system"
import { fetch as expoFetch } from "expo/fetch"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { toast } from "sonner-native"
import { ApiClientError } from "@/api/errors"
import { ImageField } from "@/components/admin/image-field"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useError } from "@/hooks/use-error"
import { client } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { createBrandSchema } from "@/schemas/brands"
import type { CreateBrandValues } from "@/types/brands"

type BrandUploadResponse = {
  result?: { name: string }
  error?: string
  key?: string
}

export const CreateBrandForm = () => {
  const { t } = useTranslation()
  const { onError } = useError("brands")
  const queryClient = useQueryClient()

  const { control, handleSubmit, reset } = useForm<CreateBrandValues>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: { name: "" },
  })

  const create = useMutation<
    BrandUploadResponse,
    ApiClientError,
    CreateBrandValues
  >({
    mutationFn: async ({ name, image }) => {
      if (!image) {
        throw new ApiClientError("Image is required", 400, "BAD_REQUEST")
      }

      const cookie = await authClient.getCookie()
      const formData = new FormData()
      formData.append("name", name)
      formData.append("image", new File(image.uri))

      const response = await expoFetch(client.api.brands.$url().toString(), {
        method: "POST",
        body: formData,
        headers: cookie ? { Cookie: cookie } : {},
      })

      const body = (await response.json()) as BrandUploadResponse

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
      void queryClient.invalidateQueries({ queryKey: ["brands"] })

      if (body.result) {
        toast.success(t("admin.brands.success", { name: body.result.name }))
      }
    },
  })

  const onSubmit = handleSubmit((values) => create.mutate(values))

  return (
    <View className="gap-4">
      <FormField
        control={control}
        name="name"
        label={t("admin.brands.label")}
        placeholder={t("admin.brands.placeholder")}
        autoCapitalize="words"
      />
      <ImageField
        control={control}
        name="image"
        label={t("admin.brands.image")}
      />
      <Button onPress={onSubmit} isLoading={create.isPending}>
        <Text>{t("admin.brands.submit")}</Text>
      </Button>
    </View>
  )
}
