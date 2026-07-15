import { PutObjectCommand } from "@aws-sdk/client-s3"
import { env } from "./env"
import { s3 } from "./lib/storage/s3"
import type { Image } from "./types/images"

export const uploadImage = async ({
  image,
  folder,
  name,
}: {
  image: Image
  folder: string
  name: string
}) => {
  const key = `${folder}/${name}`

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: image.type,
    Body: Buffer.from(await image.arrayBuffer()),
  })

  await s3.send(command)

  return key
}

export const getImageUrl = (key: string) => `${env.S3_PUBLIC_URL}${key}`
