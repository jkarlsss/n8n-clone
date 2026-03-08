import { inngest } from '../../inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/prisma';
export const appRouter = createTRPCRouter({
    getWorkflows: protectedProcedure.query(({ ctx }) => {

      return prisma.workflow.findMany();

    }),
    createWorkflow: protectedProcedure.mutation( async ({ ctx }) => {

      await inngest.send({
        name: 'test/hello.world',
        data: {
          email: "n8n@n8n",
        },
      })
      
      return { success: true, message: "Workflow creation triggered" };
    })
});
// export type definition of API
export type AppRouter = typeof appRouter;