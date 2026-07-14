import type { Context as HonoContext } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { db } from "../../db"
import { ERROR_RESPONSES } from "./constants"

export const contextVariables = {
  db,
}

type Meta = Record<string, unknown>

export const send =
  (ctx: HonoContext) =>
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  <TData, TMeta extends Meta = {}>(
    data: TData,
    meta: TMeta = {} as TMeta,
    status?: ContentfulStatusCode,
  ) =>
    ctx.json(
      {
        result: data,
        meta,
      },
      status,
    )

export const fail =
  (ctx: HonoContext) =>
  (errorName: keyof typeof ERROR_RESPONSES, message?: string) =>
    ctx.json(
      {
        error: message ?? ERROR_RESPONSES[errorName].message,
        key: ERROR_RESPONSES[errorName].key,
      },
      ERROR_RESPONSES[errorName].code,
    )

export type Context = typeof contextVariables & {
  send: ReturnType<typeof send>
  fail: ReturnType<typeof fail>
}
