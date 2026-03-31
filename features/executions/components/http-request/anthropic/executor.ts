import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { AI_AVAILABLE_MODELS } from "./dialog";
import { generateText } from 'ai';
import { anthropicChannel } from "../../../../../inngest/channels/anthropic";
import { createAnthropic } from '@ai-sdk/anthropic';
import prisma from "../../../../../lib/prisma";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2)

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  model?: typeof AI_AVAILABLE_MODELS[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  context,
  step,
  nodeId,
  publish
}) => {
    
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading"
    })
  )

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
    
    const systemPrompt = data.systemPrompt  ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistant that tries to help the user with their request. Always try to be as helpful as possible.";
    
    const userPrompt = Handlebars.compile(data.userPrompt)(context);
  
    const credential = await step.run("get-credential", () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
        },
      });
    })

    if (!credential) {
      throw new NonRetriableError("API key not configured.");
    }

    const credentialValue = credential?.value; 
    
    if (!credentialValue) {
      throw new NonRetriableError("API key not configured.");
    }

    const anthropic = createAnthropic({
      // custom settings
      apiKey: credentialValue,
    });

    
    const { steps } = await step.ai.wrap("anthropic-generate-text", generateText, {
      model: anthropic(data.model || AI_AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    })

    const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success"
      })
    )

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    }

  } catch(error) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw error;
  }

};
