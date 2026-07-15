import type { StatusCode } from "hono/utils/http-status"

export const ERROR_RESPONSES = {
  badRequest: { message: "Bad request", code: 400, key: "BAD_REQUEST" },
  notFound: { message: "Not found", code: 404, key: "NOT_FOUND" },
  conflict: { message: "Conflict", code: 409, key: "CONFLICT" },
  unauthorized: { message: "Unauthorized", code: 401, key: "UNAUTHORIZED" },
  forbidden: { message: "Forbidden", code: 403, key: "FORBIDDEN" },
  internalError: {
    message: "Internal server error",
    code: 500,
    key: "INTERNAL_ERROR",
  },
} satisfies Record<string, { message: string; code: StatusCode; key: string }>

export const HTTP_CREATED_STATUS = 201
