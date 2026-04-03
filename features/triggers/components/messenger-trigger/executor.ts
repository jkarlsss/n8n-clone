import { NodeExecutor } from "@/features/executions/types";
import { messengerTriggerChannel } from "../../../../inngest/channels/messenger-trigger";

type MessengerTriggerData = Record<string, unknown>;

export const messengerTriggerExecutor: NodeExecutor<MessengerTriggerData> = async ({
  // data,
  context,
  step,
  nodeId,
  publish,
}) => {
  await publish(
    messengerTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("Messenger-trigger", async () => context);

  await publish(
    messengerTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};
