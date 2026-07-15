import { createApp, env, logger } from "@fantadex/api/server"
import { serve } from "@hono/node-server"

const app = createApp()

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`🚀 fantadex-backend listening on http://localhost:${info.port}`)
})
