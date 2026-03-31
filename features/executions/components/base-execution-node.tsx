"use client";

import { Position, useReactFlow } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { BaseHandle } from "@/components/react-flow/base-handle";
import {
  BaseNode,
  BaseNodeContent,
} from "@/components/react-flow/base-node";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps {
  id: string;
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status: NodeStatus;
  onSettings?: () => void;
  onDoubleClick: () => void;
}

export const BaseExecutionNode = ({
  id,
  icon: Icon,
  status = "loading",
  name,
  description,
  children,
  onSettings,
  onDoubleClick,
}: BaseExecutionNodeProps) => {
  // TODO add delete
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {

    setNodes((currentNodes) => {
      const updatedNodes = currentNodes.filter((node) => node.id !== id);
      
      return updatedNodes;
    });
    
    setEdges((currentEdges) => {
      const updatedEdges = currentEdges.filter((edge) => edge.source !== id && edge.target !== id);
      
      return updatedEdges;
    });

  };

  return (
    <WorkflowNode
      name={name}
      description={description}
      onDelete={handleDelete}
      onSettings={onSettings}
    >
      <NodeStatusIndicator
        status={status}
        variant="border"
      >
        <BaseNode status={status} onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} width={16} height={16} alt={name} />
            ) : (
              <Icon className="size-4" />
            )}
            {children}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};

BaseExecutionNode.displayName = "BaseExecutionNode";
