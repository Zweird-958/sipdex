declare module "@eslint/js" {
  import type { Linter } from "eslint"

  export const configs: {
    readonly recommended: { readonly rules: Readonly<Linter.RulesRecord> }
    readonly all: { readonly rules: Readonly<Linter.RulesRecord> }
  }
}

declare module "eslint-plugin-turbo" {
  import type { Linter, Rule } from "eslint"

  export const configs: {
    recommended: { rules: Linter.RulesRecord }
  }
  export const rules: Record<string, Rule.RuleModule>
}
