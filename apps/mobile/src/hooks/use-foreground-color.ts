import { useColorScheme } from "nativewind"

// --foreground from global.css (light: hsl(0 0% 3.9%), dark: hsl(0 0% 98%)).
const FOREGROUND = { light: "#0a0a0a", dark: "#fafafa" }

export const useForegroundColor = () => {
  const { colorScheme } = useColorScheme()

  return colorScheme === "dark" ? FOREGROUND.dark : FOREGROUND.light
}
