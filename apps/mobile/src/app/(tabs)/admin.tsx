import { Redirect } from "expo-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { CreateBrandForm } from "@/components/admin/create-brand-form"
import { CreateCountryForm } from "@/components/admin/create-country-form"
import { CreateDrinkForm } from "@/components/admin/create-drink-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text } from "@/components/ui/text"
import { useIsAdmin } from "@/hooks/use-is-admin"

const AdminScreen = () => {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const [tab, setTab] = useState("brand")

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
          <TabsTrigger value="brand" className="basis-1/3">
            <Text>{t("admin.tabs.brand")}</Text>
          </TabsTrigger>
          <TabsTrigger value="country" className="basis-1/3">
            <Text>{t("admin.tabs.country")}</Text>
          </TabsTrigger>
          <TabsTrigger value="drink" className="basis-1/3">
            <Text>{t("admin.tabs.drink")}</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="brand">
          <CreateBrandForm />
        </TabsContent>
        <TabsContent value="country">
          <CreateCountryForm />
        </TabsContent>
        <TabsContent value="drink">
          <CreateDrinkForm />
        </TabsContent>
      </Tabs>
    </ScrollView>
  )
}

export default AdminScreen
