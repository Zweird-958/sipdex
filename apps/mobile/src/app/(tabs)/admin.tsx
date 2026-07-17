import { Redirect } from "expo-router"
import { View } from "react-native"
import { CreateCountryForm } from "@/components/admin/create-country-form"
import { useIsAdmin } from "@/hooks/use-is-admin"

const AdminScreen = () => {
  const isAdmin = useIsAdmin()

  if (!isAdmin) {
    return <Redirect href="/" />
  }

  return (
    <View className="flex-1 gap-6 p-4">
      <CreateCountryForm />
    </View>
  )
}

export default AdminScreen
