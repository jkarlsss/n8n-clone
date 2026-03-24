import { NodeTypes } from "@xyflow/react";
import { InitialNode } from "../components/initial-node";
import { HttpRequestNode } from "../features/executions/components/http-request/http-request/node";
import { ManualTriggerNode } from "../features/triggers/components/manual-trigger/node";
import { NodeType } from "../lib/generated/prisma/enums";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents;