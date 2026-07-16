import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { toast } from "sonner-native"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { authClient } from "@/lib/auth-client"
import { signInSchema } from "@/schemas/auth"
import type { SignInValues } from "@/types/auth"

export const SignInForm = () => {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await authClient.signIn.email({ email, password })

    if (error) {
      toast.error(error.message ?? t("errors.default"))

      return
    }

    toast.success(t("auth.signIn.success"))
  })

  return (
    <View className="gap-4">
      <FormField
        control={control}
        name="email"
        label={t("auth.email")}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormField
        control={control}
        name="password"
        label={t("auth.password")}
        secureTextEntry
      />
      <Button onPress={onSubmit} isLoading={isSubmitting}>
        <Text>{t("auth.signIn.submit")}</Text>
      </Button>
    </View>
  )
}
