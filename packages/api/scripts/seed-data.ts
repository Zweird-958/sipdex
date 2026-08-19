import type { Role } from "../src/types/user"

export const COUNTRY_INPUTS = [
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Japan",
  "United States",
  "Brazil",
]

export const BRAND_SEED = [
  { name: "Fanta" },
  { name: "Coca-Cola" },
  { name: "Red Bull" },
  { name: "Monster" },
]

export const DRINK_SEED = [
  { flavour: "Orange", brand: "Fanta", countryCodes: ["FR", "DE"] },
  { flavour: "Lemon", brand: "Fanta", countryCodes: ["IT"] },
  { flavour: "Grape", brand: "Coca-Cola", countryCodes: ["ES", "US"] },
  { flavour: "Strawberry", brand: "Monster", countryCodes: ["JP"] },
  { flavour: "Exotic", brand: "Red Bull", countryCodes: ["BR", "FR"] },
]

export const USER_SEED: {
  name: string
  email: string
  password: string
  role: Role
}[] = [
  {
    name: "Admin",
    email: "admin@sipdex.io",
    password: "Password123!",
    role: "admin",
  },
  {
    name: "User",
    email: "user@sipdex.io",
    password: "Password123!",
    role: "user",
  },
]
