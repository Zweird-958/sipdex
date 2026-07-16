import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, ScrollView } from "react-native"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Text } from "@/components/ui/text"

type AuthMode = "sign-in" | "sign-up"

export const AuthScreen = () => {
  const { t } = useTranslation()
  const [mode, setMode] = useState<AuthMode>("sign-in")

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="grow justify-center gap-6 p-4"
      keyboardShouldPersistTaps="handled"
    >
      {mode === "sign-in" ? (
        <SignInForm />
      ) : (
        <SignUpForm onSuccess={() => setMode("sign-in")} />
      )}

      <Pressable
        onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
      >
        <Text variant="muted" className="text-center">
          {mode === "sign-in"
            ? t("auth.toggleToSignUp")
            : t("auth.toggleToSignIn")}
        </Text>
      </Pressable>
    </ScrollView>
  )
}
