import { faker } from "@faker-js/faker"

export const buildDrink = () => ({
  id: faker.string.uuid(),
  flavour: faker.commerce.productName(),
  imageUrl: faker.internet.url(),
  brand: {
    id: faker.string.uuid(),
    name: faker.company.name(),
    logoUrl: faker.internet.url(),
  },
  countries: [],
  tasted: false,
  createdAt: new Date(),
})
