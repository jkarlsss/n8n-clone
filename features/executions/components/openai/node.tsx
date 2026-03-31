"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";

import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { fetchOpenaiRealtimeToken } from "./actions";
import { AI_AVAILABLE_MODELS, OpenAiDialog, OpenAiFormValues } from "./dialog";

type OpenAiNodeData = {
  variableName?: string;
  model?: typeof AI_AVAILABLE_MODELS[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenaiRealtimeToken,
  });

  const handleOpenSetting = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: OpenAiFormValues) => {
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
      )}${nodeData.userPrompt.length > 50 ? "..." : ""}`
    : "No prompt configured";
  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";
