import { useThemeColors } from "@/hooks/use-theme-colors"

// Header styling shared by the root Stack and the Tabs navigator: the header
// blends with the screen background and drops the divider shadow.
export const useHeaderOptions = () => {
  const { background, foreground } = useThemeColors()

  return {
    headerStyle: { backgroundColor: background },
    headerTintColor: foreground,
    headerShadowVisible: false,
  }
}
