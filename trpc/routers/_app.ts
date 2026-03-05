import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '../../lib/prisma';
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
    getUser: baseProcedure.query(() => {
      return prisma.user.findMany();
    })
});
// export type definition of API
export type AppRouter = typeof appRouter;