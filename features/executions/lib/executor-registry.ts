import { NodeType } from "@/lib/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "../../triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/http-request/executor";
import { googleFormTriggerExecutor } from "../../triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "../../triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/http-request/gemini/executor";
import { openaiExecutor } from "../components/http-request/openai/executor";
import { anthropicExecutor } from "../components/http-request/anthropic/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openaiExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No executor found for type ${type}`);
  }

  return executor;
};