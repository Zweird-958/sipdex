import { View } from "react-native"
import { DrinkList } from "@/components/drinks/drink-list"

const HomeScreen = () => (
  <View className="bg-background flex-1">
    <DrinkList />
  </View>
)

export default HomeScreen
