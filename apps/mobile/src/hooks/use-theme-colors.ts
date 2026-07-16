import { useColorScheme } from "nativewind"

// Colors from global.css:
//   --background: light hsl(0 0% 100%) / dark hsl(0 0% 3.9%)
//   --foreground: light hsl(0 0% 3.9%) / dark hsl(0 0% 98%)
//   --muted-foreground: light hsl(0 0% 45.1%) / dark hsl(0 0% 63.9%)
const COLORS = {
  light: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    mutedForeground: "#737373",
  },
  dark: {
    background: "#0a0a0a",
    foreground: "#fafafa",
    mutedForeground: "#a3a3a3",
  },
}

export const useThemeColors = () => {
  const { colorScheme } = useColorScheme()

  return colorScheme === "dark" ? COLORS.dark : COLORS.light
}
