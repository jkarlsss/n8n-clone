import { GetStepTools, Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams<Tdata = Record<string, unknown>> {
  data: Tdata;
  context: WorkflowContext;
  step: StepTools;
  nodeId: string;
  // publish
}

export type NodeExecutor<Tdata = Record<string, unknown>> = (
  params: NodeExecutorParams<Tdata>,
) => Promise<{ data?: unknown } | void | Response>;
