import { useRouter } from "expo-router"
import { Settings } from "lucide-react-native"
import { Pressable } from "react-native"
import { useThemeColors } from "@/hooks/use-theme-colors"

export const SettingsHeaderButton = () => {
  const router = useRouter()
  const { foreground } = useThemeColors()

  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={8}
      className="pr-1"
    >
      <Settings size={22} color={foreground} />
    </Pressable>
  )
}
