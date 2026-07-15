import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner-native"
import type { ApiClientError } from "@/api/errors"

// Resolves an API error to a user-facing toast. Tries a feature-scoped message
// first (`errors.<key>.<CODE>`), then a global one (`errors.<CODE>`), then a
// generic fallback (`errors.default`).
export const useError = (key: string) => {
  const { t } = useTranslation()

  const onError = useCallback(
    ({ key: code }: ApiClientError) => {
      toast.error(
        t([`errors.${key}.${code}`, `errors.${code}`, "errors.default"]),
      )
    },
    [t, key],
  )

  return { onError }
}
