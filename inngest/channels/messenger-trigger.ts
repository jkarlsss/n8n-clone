import { channel, topic } from "@inngest/realtime";

export const MESSENGER_TRIGGER_CHANNEL_NAME = "messenger-trigger-execution";

export const messengerTriggerChannel = channel(MESSENGER_TRIGGER_CHANNEL_NAME)
.addTopic(
  topic('status')
  .type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
)