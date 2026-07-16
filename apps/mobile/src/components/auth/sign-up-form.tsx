import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "expo-router"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { toast } from "sonner-native"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { authClient } from "@/lib/auth-client"
import { signUpSchema } from "@/schemas/auth"
import type { SignUpValues } from "@/types/auth"

export const SignUpForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await authClient.signUp.email({
      name: "",
      email,
      password,
    })

    if (error) {
      toast.error(error.message ?? t("errors.default"))

      return
    }

    reset()
    toast.success(t("auth.signUp.success"))
    router.navigate("/")
  })

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 p-4"
    >
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
      <FormField
        control={control}
        name="confirmPassword"
        label={t("auth.confirmPassword")}
        secureTextEntry
      />
      <Button onPress={onSubmit} isLoading={isSubmitting}>
        <Text>{t("auth.signUp.submit")}</Text>
      </Button>
    </ScrollView>
  )
}
