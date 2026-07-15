import type {
  ClientRequestOptions,
  ClientResponse,
  InferResponseType,
} from "hono/client"

export type ApiError = {
  error: string
  key: string
}

export type HonoClientFunction =
  | ((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: any,
      options?: ClientRequestOptions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<ClientResponse<any, number, "json">>)
  | ((
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      args?: {},
      options?: ClientRequestOptions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<ClientResponse<any, number, "json">>)

export type ResponseFiltered<T extends HonoClientFunction> = Exclude<
  InferResponseType<T>,
  { error: unknown }
>
