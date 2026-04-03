import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchMessengerTriggerRealtimeToken } from "./actions";
import { MESSENGER_TRIGGER_CHANNEL_NAME } from "../../../../inngest/channels/messenger-trigger";
import { MessengerTriggerDialog } from "./dialog";

export const MessengerTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: MESSENGER_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchMessengerTriggerRealtimeToken,
  });

  const handleOpenSetting = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <MessengerTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        // id={props.id}
        icon="/logos/messenger.svg"
        name="Messenger"
        description="When a message is received"
        status={nodeStatus}
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      />
    </>
  );
});

MessengerTriggerNode.displayName = "MessengerTriggerNode";
