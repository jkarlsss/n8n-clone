"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export const MessengerTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();

  const workflowId = params.workflowId as string;

  // constract the webhook url
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/messenger?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Messenger Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Messenger integration to
            trigger this workflow when an event occurs
          </DialogDescription>{" "}
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                id="webhook-url"
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size={"icon"}
                onClick={copyToClipboard}
                variant={"outline"}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open the Messenger integration</li>
              <li>Go to the Webhook tab</li>
              <li>Paste the webhook URL and subscribe to the desired events</li>
            </ol>
              
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
