import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polarClient } from "./polar";
import prisma from "./prisma";

// If your Prisma file is located elsewhere, you can change the path
// 08ad10a0-e516-41bb-bbc8-b90062ecea29

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "08ad10a0-e516-41bb-bbc8-b90062ecea29",
              slug: "n8n-clone-Pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/n8n-clone-Pro
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
