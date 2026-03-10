import { generateText } from "ai";
import prisma from "../lib/prisma";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

const google = createGoogleGenerativeAI({
  // custom settings
});
const openai = createOpenAI({
  // custom settings, e.g.
  headers: {
    'header-name': 'header-value',
  },
});
const anthropic = createAnthropic({
  // custom settings
});


export const execute = inngest.createFunction(
  { id: "execute-id", retries: 2 },
  { event: "execute/ai" },
  async ({ event, step }) => {
    
    const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-text", 
      generateText, {
      model: google("gemini-3-flash-preview"),
      system: "You are a helpful assistant.",
      prompt: "what is 3 + 3?",
    });
    
    const { steps: openaiSteps } = await step.ai.wrap("openai-generate-text", 
      generateText, {
      model: openai("gpt-3.5-turbo"),
      system: "You are a helpful assistant.",
      prompt: "what is 3 + 3?",
    });

    const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text", 
      generateText, {
      model: anthropic("claude-3-5-sonnet"),
      system: "You are a helpful assistant.",
      prompt: "what is 3 + 3?",
    });

    return { gemini: geminiSteps, openai: openaiSteps, anthropic: anthropicSteps };
   
  },
);