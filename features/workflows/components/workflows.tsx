"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <div className="flex-1 flex justify-center items-center">
      <p>
        {workflows.data.length === 0
          ? "No workflows found"
          : JSON.stringify(workflows.data, null, 2)}
      </p>
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const { modal, handleError } = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        // TODO handle error
        handleError(error);
      },
    });
  }
  
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage workflows"
        newButtonnLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
        onNew={handleCreate}
      />
    </>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
