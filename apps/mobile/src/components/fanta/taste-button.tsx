import { useQueryClient } from "@tanstack/react-query"
import { CupSoda } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useError } from "@/hooks/use-error"
import { useMutation } from "@/hooks/use-mutation"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { client } from "@/lib/api"
import type { ResponseFiltered } from "@/types/api"

type TasteButtonProps = {
  id: string
  tasted: boolean | null
}

type FantaListResponse = ResponseFiltered<typeof client.api.fanta.$get>

export const TasteButton = ({ id, tasted }: TasteButtonProps) => {
  const { t } = useTranslation()
  const { onError } = useError("fanta")
  const { foreground } = useThemeColors()
  const queryClient = useQueryClient()

  const setTasted = (value: boolean) => {
    queryClient.setQueriesData<FantaListResponse>(
      { queryKey: ["fanta"] },
      (old) =>
        old
          ? {
              ...old,
              result: old.result.map((fanta) =>
                fanta.id === id ? { ...fanta, tasted: value } : fanta,
              ),
            }
          : old,
    )
  }

  const taste = useMutation(client.api.fanta[":id"].taste.$post, {
    onError,
    onSuccess: () => setTasted(true),
  })
  const untaste = useMutation(client.api.fanta[":id"].taste.$delete, {
    onError,
    onSuccess: () => setTasted(false),
  })

  if (tasted === null) {
    return null
  }

  const mutation = tasted ? untaste : taste

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={mutation.isPending}
      onPress={() => mutation.mutate({ param: { id } })}
      accessibilityLabel={t(tasted ? "fanta.markUntasted" : "fanta.markTasted")}
    >
      <Icon as={CupSoda} size={20} fill={tasted ? foreground : "transparent"} />
    </Button>
  )
}
