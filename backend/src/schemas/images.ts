import z from "zod"
import { MAXIMUM_FILE_SIZE } from "../lib/constants"

export const image = z
  .file("file-invalid-type")
  .max(MAXIMUM_FILE_SIZE, "file-too-large")
  .mime(["image/png", "image/jpeg"], "file-invalid-type")
