import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { geminiChannel } from "../../../../../inngest/channels/gemini";
import { AI_AVAILABLE_MODELS } from "./dialog";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2)

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GeminiData = {
  variableName?: string;
  model?: typeof AI_AVAILABLE_MODELS[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  context,
  step,
  nodeId,
  publish
}) => {
  // TODO publish loading state for 
    
  await publish(
    geminiChannel().status({
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
    
    const systemPrompt = data.systemPrompt  ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistant that tries to help the user with their request. Always try to be as helpful as possible.";
    
    const userPrompt = Handlebars.compile(data.userPrompt)(context);
  
    // TODO: fetch user credentials
    const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY; 

    if (!credentialValue) {
      throw new NonRetriableError("API key not configured.");
    }

    const google = createGoogleGenerativeAI({
      // custom settings
      apiKey: credentialValue,
    });

    
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || AI_AVAILABLE_MODELS[0]),
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
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw error;
  }

};
