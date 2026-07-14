import baseSlugify from "slugify"

export const slugify = (name: string) =>
  baseSlugify(name, { lower: true, strict: true })
