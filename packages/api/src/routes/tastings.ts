import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { isAuthorized } from "../handlers/is-authorized"
import { listTastedDrinks } from "../lib/drinks/list-tasted-drink"
import { HTTP_CREATED_STATUS } from "../lib/http/constants"
import { addTasting } from "../lib/tastings/add-tasting"
import { drinkExists } from "../lib/tastings/drink-exists"
import { removeTasting } from "../lib/tastings/remove-tasting"
import { idParamSchema } from "../schemas/common"
import type { AppEnv } from "../types/http"

export const tastingsRoutes = new Hono<AppEnv>()
  .get(
    "/tastings",
    ...isAuthorized({ tastings: ["list"] }),
    async ({ var: { send, user } }) => send(await listTastedDrinks(user.id)),
  )
  .post(
    "/drinks/:id/taste",
    ...isAuthorized({ tastings: ["create"] }),
    zValidator("param", idParamSchema),
    async ({ req, var: { send, fail, user } }) => {
      const { id: drinkId } = req.valid("param")

      if (!(await drinkExists(drinkId))) {
        return fail("notFound", "Drink not found")
      }

      await addTasting(user.id, drinkId)

      return send({ drinkId, tasted: true }, {}, HTTP_CREATED_STATUS)
    },
  )
  .delete(
    "/drinks/:id/taste",
    ...isAuthorized({ tastings: ["delete"] }),
    zValidator("param", idParamSchema),
    async ({ req, var: { send, user } }) => {
      const { id: drinkId } = req.valid("param")

      await removeTasting(user.id, drinkId)

      return send({ drinkId, tasted: false })
    },
  )
