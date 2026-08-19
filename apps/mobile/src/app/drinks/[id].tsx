import { Stack, useLocalSearchParams } from "expo-router"
import { DrinkDetail } from "@/components/drinks/drink-detail"
import { HeaderBackButton } from "@/components/header-back-button"

const DrinkDetailScreen = () => {
  const { id, flavour } = useLocalSearchParams<{
    id: string
    flavour: string
  }>()

  return (
    <>
      <Stack.Screen
        options={{ title: flavour, headerLeft: () => <HeaderBackButton /> }}
      />
      <DrinkDetail id={id} />
    </>
  )
}

export default DrinkDetailScreen
