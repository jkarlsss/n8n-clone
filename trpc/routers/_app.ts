import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "../init";
import { authClient } from "@/lib/auth-client";

export const appRouter = createTRPCRouter({
  testAi: premiumProcedure.mutation(async ({ ctx }) => {
    
    await inngest.send({
      name: "execute/ai",
    })

    return { success: true, message: "Job triggered" };
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async ({ ctx }) => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "n8n@n8n",
      },
    });

    return { success: true, message: "Workflow creation triggered" };
  }),
  getCustomerState: protectedProcedure.query(async ({ ctx }) => {
    const { data: customerState } = await authClient.customer.state();

    return { customerState, message: "Customer state retrieved successfully" };
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;
