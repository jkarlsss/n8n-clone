import { NonRetriableError } from "inngest";
import { getExecutor } from "../features/executions/lib/executor-registry";
import { ExecutionStatus } from "../lib/generated/prisma/enums";
import prisma from "../lib/prisma";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { geminiChannel } from "./channels/gemini";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openaiChannel } from "./channels/openai";
import { slackChannel } from "./channels/slack";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";
import { messengerTriggerChannel } from "./channels/messenger-trigger";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event, step }) => {
      return await step.run("update-execution-failed", async () => {
        await prisma.execution.update({
          where: {
            inngestEventId: event.data.event.id,
          },
          data: {
            status: ExecutionStatus.FAILED,
            error: event.data.error.message,
            errorStack: event.data.error.stack,
          },
        });
      });
    },
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
      slackChannel(),
      discordChannel(),
      messengerTriggerChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;
    const inngestEventId = event.id;

    if (!inngestEventId) {
      throw new NonRetriableError("Missing workflow event Id");
    }

    if (!workflowId) {
      throw new NonRetriableError("Missing workflow Id");
    }

    await step.run("create-execution", async () => {
      await prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

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

    const userId = await step.run("get-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
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
        userId,
        step,
        publish,
      });
    }

    await step.run("update-execution", async () => {
      await prisma.execution.update({
        where: {
          inngestEventId,
          workflowId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return {
      workflowId,
      result: context,
    };
  },
);
