import { serve } from "@hono/node-server"
import { createApp, env, logger } from "@sipdex/api/server"

const app = createApp()

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`🚀 sipdex-backend listening on http://localhost:${info.port}`)
})
