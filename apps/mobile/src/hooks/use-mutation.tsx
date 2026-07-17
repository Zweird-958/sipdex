import {
  type UseMutationOptions,
  useMutation as useGenericMutation,
} from "@tanstack/react-query"
import type { InferRequestType } from "hono/client"
import { ApiClientError } from "@/api/errors"
import type {
  ApiError,
  HonoClientFunction,
  ResponseFiltered,
} from "@/types/api"

type MutationOptions<T extends HonoClientFunction> = Omit<
  UseMutationOptions<ResponseFiltered<T>, ApiClientError, InferRequestType<T>>,
  "mutationFn"
>

export const useMutation = <T extends HonoClientFunction>(
  request: T,
  options: MutationOptions<T> = {},
) =>
  useGenericMutation<ResponseFiltered<T>, ApiClientError, InferRequestType<T>>({
    mutationFn: async (variables) => {
      const response = await request(variables)

      if (response.ok) {
        return response.json() as Promise<ResponseFiltered<T>>
      }

      const error = (await response.json()) as ApiError

      throw new ApiClientError(error.error, response.status, error.key)
    },
    ...options,
  })
