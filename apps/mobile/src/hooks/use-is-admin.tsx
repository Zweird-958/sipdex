import { authClient } from "@/lib/auth-client"

const ADMIN_ROLE = "admin"

export const useIsAdmin = () => {
  const { data } = authClient.useSession()

  return data?.user.role === ADMIN_ROLE
}
