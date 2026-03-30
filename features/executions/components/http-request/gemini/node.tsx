"use client";

import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../../hooks/use-node-status";

import { fetchGeminiRealtimeToken } from "./actions";
import { AI_AVAILABLE_MODELS, GeminiDialog, GeminiFormValues } from "./dialog";

type GeminiNodeData = {
  variableName?: string;
  model?: typeof AI_AVAILABLE_MODELS[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const handleOpenSetting = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: GeminiFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AI_AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(
        0,
        50,
      )}...`
    : "No model";

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
