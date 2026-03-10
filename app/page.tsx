
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requireAuth } from "../lib/auth-utils"
import { useTRPC } from "../trpc/client";
import { caller } from "../trpc/server";
import Logout from "./logout";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const Page = () => {

  // await requireAuth();
  
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      toast.success('Workflow created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create workflow: ' + error.message);
    }
  }));

  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => toast.success("job triggered"),
    onError: (error) => toast.error("Failed to trigger job: " + error.message)
  }))

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      Protected page
      {JSON.stringify(data)}
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
        Test AI
      </Button>
      <Logout />
    </div>
  )
}

export default Page