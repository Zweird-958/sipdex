import baseConfig from "@fantadex/eslint/base"
import reactConfig from "@fantadex/eslint/react"

/** @type {import('@fantadex/eslint').Config} */
export default [
  {
    ignores: [".expo", "expo-env.d.ts", "nativewind-env.d.ts"],
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
    },
  },
]
