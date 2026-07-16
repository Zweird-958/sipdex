import { Stack, useLocalSearchParams } from "expo-router"
import { FantaDetail } from "@/components/fanta/fanta-detail"
import { HeaderBackButton } from "@/components/header-back-button"

const FantaDetailScreen = () => {
  const { id, flavour } = useLocalSearchParams<{
    id: string
    flavour: string
  }>()

  return (
    <>
      <Stack.Screen
        options={{ title: flavour, headerLeft: () => <HeaderBackButton /> }}
      />
      <FantaDetail id={id} />
    </>
  )
}

export default FantaDetailScreen
