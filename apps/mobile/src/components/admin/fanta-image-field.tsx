import * as ImagePicker from "expo-image-picker"
import { Camera, ImagePlus } from "lucide-react-native"
import { type Control, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Image, View } from "react-native"
import { toast } from "sonner-native"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import type { CreateFantaValues, ImageAsset } from "@/types/fanta"

const IMAGE_QUALITY = 0.8

const toImageAsset = (asset: ImagePicker.ImagePickerAsset): ImageAsset => ({
  uri: asset.uri,
  fileName: asset.fileName,
  mimeType: asset.mimeType,
})

type FantaImageFieldProps = {
  control: Control<CreateFantaValues>
}

export const FantaImageField = ({ control }: FantaImageFieldProps) => {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name="image"
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const pickImage = async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: IMAGE_QUALITY,
          })

          if (!result.canceled) {
            onChange(toImageAsset(result.assets[0]))
          }
        }

        const takePhoto = async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync()

          if (!permission.granted) {
            toast.error(t("admin.fanta.errors.cameraDenied"))

            return
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: IMAGE_QUALITY,
          })

          if (!result.canceled) {
            onChange(toImageAsset(result.assets[0]))
          }
        }

        return (
          <View className="gap-1.5">
            <Label>{t("admin.fanta.image")}</Label>
            {value && (
              <Image
                source={{ uri: value.uri }}
                resizeMode="cover"
                className="h-40 w-40 self-center rounded-md"
              />
            )}
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => void pickImage()}
              >
                <Icon as={ImagePlus} className="size-4" />
                <Text>{t("admin.fanta.pickImage")}</Text>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => void takePhoto()}
              >
                <Icon as={Camera} className="size-4" />
                <Text>{t("admin.fanta.takePhoto")}</Text>
              </Button>
            </View>
            {error && (
              <Text className="text-destructive text-sm">
                {t(error.message ?? "errors.default")}
              </Text>
            )}
          </View>
        )
      }}
    />
  )
}
