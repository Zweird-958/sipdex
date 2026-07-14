import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { auth } from "./auth"
import { env } from "./env"
import { contextVariables, fail, send } from "./lib/context"
import { factory } from "./lib/factory"
import { countriesRoutes } from "./routes/countries"
import { fantaRoutes } from "./routes/fanta"
import { tastingsRoutes } from "./routes/tastings"

const app = factory.createApp().basePath("/api")

app.use(
  "*",
  logger(),
  cors({
    origin: env.TRUSTED_ORIGINS,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
  (ctx, next) => {
    Object.entries(contextVariables).forEach(([name, value]) => {
      ctx.set(name as never, value as never)
    })
    ctx.set("send", send(ctx))
    ctx.set("fail", fail(ctx))

    return next()
  },
)

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))

app.route("/fanta", fantaRoutes)
app.route("/countries", countriesRoutes)
app.route("/", tastingsRoutes)

app.onError((_, { var: { fail: cFail } }) => cFail("internalError"))

app.notFound(({ var: { fail: cFail } }) => cFail("notFound"))

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  // eslint-disable-next-line no-console
  console.log(`🚀 fantadex-backend listening on http://localhost:${info.port}`)
})

export default app
