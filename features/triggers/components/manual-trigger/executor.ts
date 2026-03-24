import { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  // data,
  context,
  step,
  nodeId
}) => {
  // TODO publish loading state for manual trigger

  const result = await step.run("manual-trigger", async () => context);

  // TODO publish result

  return result;
};