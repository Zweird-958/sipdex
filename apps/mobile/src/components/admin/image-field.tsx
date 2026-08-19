import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import { Camera, ImagePlus } from "lucide-react-native"
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Image, View } from "react-native"
import { toast } from "sonner-native"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import type { ImageAsset } from "@/types/images"

const IMAGE_QUALITY = 0.8

const isHeic = (asset: ImagePicker.ImagePickerAsset): boolean => {
  const mimeType = asset.mimeType?.toLowerCase() ?? ""
  const fileName = asset.fileName?.toLowerCase() ?? ""
  const uri = asset.uri.toLowerCase()

  return (
    mimeType.includes("heic") ||
    mimeType.includes("heif") ||
    /\.hei[cf]$/u.test(fileName) ||
    /\.hei[cf]$/u.test(uri)
  )
}

const toImageAsset = async (
  asset: ImagePicker.ImagePickerAsset,
): Promise<ImageAsset> => {
  if (!isHeic(asset)) {
    return {
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    }
  }

  // HEIC isn't universally supported by our upload/display path. Convert to
  // JPEG when possible; if conversion fails, fall back to the original asset.
  try {
    const context = ImageManipulator.manipulate(asset.uri)
    const rendered = await context.renderAsync()
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: IMAGE_QUALITY,
    })
    const baseName = asset.fileName?.replace(/\.[^.]+$/u, "") ?? "image"

    return {
      uri: result.uri,
      fileName: `${baseName}.jpg`,
      mimeType: "image/jpeg",
    }
  } catch {
    return {
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    }
  }
}

type ImageFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
}

export const ImageField = <T extends FieldValues>({
  control,
  name,
  label,
}: ImageFieldProps<T>) => {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const asset = value as ImageAsset | undefined

        const pickImage = async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: IMAGE_QUALITY,
          })

          if (!result.canceled) {
            onChange(await toImageAsset(result.assets[0]))
          }
        }

        const takePhoto = async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync()

          if (!permission.granted) {
            toast.error(t("admin.image.errors.cameraDenied"))

            return
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: IMAGE_QUALITY,
          })

          if (!result.canceled) {
            onChange(await toImageAsset(result.assets[0]))
          }
        }

        return (
          <View className="gap-1.5">
            <Label>{label}</Label>
            {asset && (
              <Image
                source={{ uri: asset.uri }}
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
                <Text>{t("admin.image.pickImage")}</Text>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => void takePhoto()}
              >
                <Icon as={Camera} className="size-4" />
                <Text>{t("admin.image.takePhoto")}</Text>
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
