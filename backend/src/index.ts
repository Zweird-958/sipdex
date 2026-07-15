import { serve } from "@hono/node-server"
import { createApp } from "./app"
import { env } from "./env"
import { logger } from "./lib/logger/logger"

const app = createApp()

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`🚀 fantadex-backend listening on http://localhost:${info.port}`)
})

export default app
