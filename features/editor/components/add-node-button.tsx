"use client";

import { memo } from "react";
import { Button } from "../../../components/ui/button";
import { PlusIcon } from "lucide-react";

export const AddNodeButton = memo(() => {
  return (
    <Button
      onClick={() => {}}
      size={"icon"}
      variant={"outline"}
      className="bg-background"
      aria-label="Add node"
    >
      <PlusIcon className="size-4" />
    </Button>
  )
})

AddNodeButton.displayName = "AddNodeButton"