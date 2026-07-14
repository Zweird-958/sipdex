import { createFactory } from "hono/factory"
import type { AppEnv } from "../types/http"

export const factory = createFactory<AppEnv>()
