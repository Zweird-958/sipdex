import { Redirect } from "expo-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { CreateCountryForm } from "@/components/admin/create-country-form"
import { CreateFantaForm } from "@/components/admin/create-fanta-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text } from "@/components/ui/text"
import { useIsAdmin } from "@/hooks/use-is-admin"

const AdminScreen = () => {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const [tab, setTab] = useState("country")

  if (!isAdmin) {
    return <Redirect href="/" />
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-6 p-4"
      keyboardShouldPersistTaps="handled"
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="country" className="basis-1/2">
            <Text>{t("admin.tabs.country")}</Text>
          </TabsTrigger>
          <TabsTrigger value="fanta" className="basis-1/2">
            <Text>{t("admin.tabs.fanta")}</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="country">
          <CreateCountryForm />
        </TabsContent>
        <TabsContent value="fanta">
          <CreateFantaForm />
        </TabsContent>
      </Tabs>
    </ScrollView>
  )
}

export default AdminScreen
