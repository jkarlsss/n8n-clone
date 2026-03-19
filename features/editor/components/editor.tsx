"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
  return <LoadingView message="Loading Editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Failed to load Editor" />;
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return <div>{JSON.stringify(workflow, null, 2)}</div>;
};
