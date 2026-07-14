import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { isAuthorized } from "../handlers/is-authorized"
import { HTTP_CREATED_STATUS } from "../lib/constants"
import { idParamSchema } from "../schemas/common"
import { listTastedFanta } from "../services/fanta"
import { addTasting, fantaExists, removeTasting } from "../services/tastings"
import type { AppEnv } from "../types/http"

export const tastingsRoutes = new Hono<AppEnv>()

tastingsRoutes.get(
  "/tastings",
  ...isAuthorized({ tastings: ["list"] }),
  async ({ var: { send, user } }) => send(await listTastedFanta(user.id)),
)

tastingsRoutes.post(
  "/fanta/:id/taste",
  ...isAuthorized({ tastings: ["create"] }),
  zValidator("param", idParamSchema),
  async ({ req, var: { send, fail, user } }) => {
    const { id: fantaId } = req.valid("param")

    if (!(await fantaExists(fantaId))) {
      return fail("notFound", "Fanta not found")
    }

    await addTasting(user.id, fantaId)

    return send({ fantaId, tasted: true }, {}, HTTP_CREATED_STATUS)
  },
)

tastingsRoutes.delete(
  "/fanta/:id/taste",
  ...isAuthorized({ tastings: ["delete"] }),
  zValidator("param", idParamSchema),
  async ({ req, var: { send, user } }) => {
    const { id: fantaId } = req.valid("param")

    await removeTasting(user.id, fantaId)

    return send({ fantaId, tasted: false })
  },
)
