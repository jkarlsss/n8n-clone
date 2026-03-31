import { NodeExecutor } from "@/features/executions/types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { openaiChannel } from "../../../../inngest/channels/openai";
import prisma from "../../../../lib/prisma";
import { AI_AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAiData = {
  variableName?: string;
  credentialId?: string;
  model?: typeof AI_AVAILABLE_MODELS[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  context,
  step,
  nodeId,
  userId,
  publish,
}) => {
  // TODO publish loading state for

  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    if (!data.variableName) {
      throw new NonRetriableError("Variable name is required.");
    }

    if (!data.userPrompt) {
      throw new NonRetriableError("User prompt is required.");
    }

    if (!data.credentialId) {
      throw new NonRetriableError("Credential is required.");
    }

    if (!data.model) {
      throw new NonRetriableError("Model is required.");
    }

    const systemPrompt = data.systemPrompt
      ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistant that tries to help the user with their request. Always try to be as helpful as possible.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
          userId,
        },
      });
    });

    if (!credential) {
      throw new NonRetriableError("API key not configured.");
    }

    const credentialValue = credential?.value;

    if (!credentialValue) {
      throw new NonRetriableError("API key not configured.");
    }

    const openai = createOpenAI({
      // custom settings
      apiKey: credentialValue,
    });

    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || AI_AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const firstContent = steps?.[0]?.content?.[0];
    const text = firstContent?.type === "text" ? firstContent.text : "";
    await publish(
      openaiChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
