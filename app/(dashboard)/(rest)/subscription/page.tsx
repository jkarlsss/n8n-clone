"use client";

import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

const Page = () => {

  const trpc = useTRPC();
  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("AI job triggered successfully");
    },
    onError: ({ message }) => {
      toast.error(`Failed to trigger AI job: ${message}`);
    }
  }));

  return (
    <div>
      <Button
        onClick={() => testAi.mutate()}
      >
        Trigger AI Job
      </Button>
    </div>
  )
}

export default Page