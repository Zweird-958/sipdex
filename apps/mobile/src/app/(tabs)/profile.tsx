import { View } from "react-native"
import { AuthScreen } from "@/components/auth/auth-screen"
import { ProfileView } from "@/components/auth/profile-view"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

const ProfileScreen = () => {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Spinner />
      </View>
    )
  }

  return session ? <ProfileView /> : <AuthScreen />
}

export default ProfileScreen
