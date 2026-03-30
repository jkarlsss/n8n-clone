"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";
import { NodeType } from "../lib/generated/prisma/enums";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger manually",
    description: "Runs the workflow manually.",
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form Trigger",
    description: "Runs the workflow when a Google Form is submitted.",
    icon: "/logos/form.svg",
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Trigger",
    description: "Runs the workflow when a Stripe event is triggered.",
    icon: "/logos/stripe.svg",
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes a HTTP request.",
    icon: GlobeIcon,
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Interacts with the Gemini API.",
    icon: "/logos/gemini.svg",
  },
  {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Interacts with the OpenAI API.",
    icon: "/logos/openai.svg",
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic",
    description: "Interacts with the Anthropic API.",
    icon: "/logos/anthropic.svg",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      // Check if there is already a trigger node
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER,
        );
        if (hasManualTrigger) {
          toast.error("You can only have one trigger node.");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 100,
        });

        const newNode = {
          id: createId(),
          type: selection.type,
          position: flowPosition,
          data: {},
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [getNodes, onOpenChange, screenToFlowPosition, setNodes],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        showCloseButton={false}
      >
        <SheetHeader>
          <SheetTitle>What triggers this workflow</SheetTitle>
          <SheetDescription>
            A trigger is a node that starts the workflow.
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((nodeType) => {
            const Icon = nodeType.icon;

            return (
              <div key={nodeType.type}>
                <div
                  className="w-full justify-start h-auto py-5 px-4
                rounded-none cursor-pointer border-l-2
                hover:border-l-primary border-transparent"
                  onClick={() => handleNodeSelect(nodeType)}
                >
                  <div className="flex items-center gap-6 w-full overflow-hidden">
                    {typeof Icon === "string" ? (
                      <Image
                        src={Icon}
                        alt={nodeType.label}
                        width={0}
                        height={0}
                        className="size-5 object-contain rounded-sm"
                      />
                    ) : (
                      <Icon className="size-5" />
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm">
                        {nodeType.label}
                      </span>
                      <span className="text-sm">{nodeType.description}</span>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            );
          })}
          {executionNodes.map((nodeType) => {
            const Icon = nodeType.icon;

            return (
              <div key={nodeType.type}>
                <div
                  className="w-full justify-start h-auto py-5 px-4
                rounded-none cursor-pointer border-l-2
                hover:border-l-primary border-transparent"
                  onClick={() => handleNodeSelect(nodeType)}
                >
                  <div className="flex items-center gap-6 w-full overflow-hidden">
                    {typeof Icon === "string" ? (
                      <Image
                        src={Icon}
                        alt={nodeType.label}
                        width={0}
                        height={0}
                        className="size-5 object-contain rounded-sm"
                      />
                    ) : (
                      <Icon className="size-5" />
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm">
                        {nodeType.label}
                      </span>
                      <span className="text-sm">{nodeType.description}</span>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            );
          })}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
