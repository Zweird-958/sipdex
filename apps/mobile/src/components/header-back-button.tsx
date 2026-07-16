import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Pressable } from "react-native"
import { useThemeColors } from "@/hooks/use-theme-colors"

export const HeaderBackButton = () => {
  const router = useRouter()
  const { foreground } = useThemeColors()

  return (
    <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
      <ChevronLeft size={26} color={foreground} />
    </Pressable>
  )
}
