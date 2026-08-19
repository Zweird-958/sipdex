import baseConfig from "@sipdex/eslint/base"
import reactConfig from "@sipdex/eslint/react"

/** @type {import('@sipdex/eslint').Config} */
export default [
  {
    ignores: ["dist", ".expo", "expo-env.d.ts", "nativewind-env.d.ts"],
  },
  ...baseConfig,
  ...reactConfig,
  {
    rules: {
      "new-cap": "off",
    },
  },
  {
    // Vendored react-native-reusables components follow shadcn conventions
    // that intentionally diverge from our base rules.
    files: ["src/components/ui/**"],
    rules: {
      "no-undefined": "off",
      "max-lines": "off",
      complexity: "off",
    },
  },
]
