import { useColorScheme } from "nativewind"

// Colors from global.css:
//   --background: light hsl(0 0% 100%) / dark hsl(0 0% 3.9%)
//   --foreground: light hsl(0 0% 3.9%) / dark hsl(0 0% 98%)
const COLORS = {
  light: { background: "#ffffff", foreground: "#0a0a0a" },
  dark: { background: "#0a0a0a", foreground: "#fafafa" },
}

export const useThemeColors = () => {
  const { colorScheme } = useColorScheme()

  return colorScheme === "dark" ? COLORS.dark : COLORS.light
}
