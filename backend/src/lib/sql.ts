import type { MaybePgError } from "../types/db"

export const getSqlErrorCode = (error: unknown): string | null => {
  const err = error as MaybePgError

  return err.code ?? err.cause?.code ?? null
}
