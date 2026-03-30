import { NonRetriableError } from "inngest";
import { getExecutor } from "../features/executions/lib/executor-registry";
import prisma from "../lib/prisma";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";
import { googleFormTriggerChannel } from "./channels/google-form-trigger copy";
import { geminiChannel } from "./channels/gemini";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { openaiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
  },
  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      anthropicChannel(),
      openaiChannel(),
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
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // initialize the context with any initial data
    let context = event.data.initialData || {};

    // execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    return {
      workflowId,
      result: context,
    };
  },
);
