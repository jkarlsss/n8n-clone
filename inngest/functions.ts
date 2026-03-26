import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "../lib/prisma";
import { topologicalSort } from "./utils";
import { getExecutor } from "../features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", retries: 0 // TODO REMOVE IN PRODUCTION
     },
  { event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
    ],
   },
  async ({ event, step, publish }) => {

    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Missing workflow Id");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        }
      })

      return topologicalSort(workflow.nodes, workflow.connections);
    })

    // initialize the context with any initial data
    let context = event.data.context || {};

    // execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish
      })
    }

    return { 
      workflowId,
      result: context
     };
  },
);
