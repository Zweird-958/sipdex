import { pinoLogger } from "hono-pino"
import { cors } from "hono/cors"
import { auth } from "./auth"
import { env } from "./env"
import { contextVariables, fail, send } from "./lib/http/context"
import { factory } from "./lib/http/factory"
import { logger } from "./lib/logger/logger"
import { countriesRoutes } from "./routes/countries"
import { fantaRoutes } from "./routes/fanta"
import { tastingsRoutes } from "./routes/tastings"

export const createApp = () => {
  const app = factory.createApp().basePath("/api")

  app.use(
    "*",
    pinoLogger({ pino: logger }),
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

  app.onError((err, { var: { fail: cFail, logger: cLogger } }) => {
    cLogger.error({ err }, "Unhandled error")

    return cFail("internalError")
  })

  app.notFound(({ var: { fail: cFail } }) => cFail("notFound"))

  return app
}

export type AppType = ReturnType<typeof createApp>
