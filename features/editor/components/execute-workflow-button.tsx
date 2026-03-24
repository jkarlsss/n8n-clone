import { FlaskConicalIcon } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useExecuteWorkflow } from "../../workflows/hooks/use-workflows";

export const ExecuteWorkflowButton = ({ workflowId }: { workflowId: string }) => {
  
  const executeWorkflow = useExecuteWorkflow();

  const handleExecuteWorkflow = () => {
    executeWorkflow.mutate({ id: workflowId });
  }
  
  return (
    <Button
      size={"lg"}
      onClick={handleExecuteWorkflow}
      disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon size={4}/>
      Execute workflow
    </Button>
  )
}