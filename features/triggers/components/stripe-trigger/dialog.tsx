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

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();

  const workflowId = params.workflowId as string;

  // constract the webhook url
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

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
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this workflow to be triggered when a Stripe event occurs
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
              <li>Open your stripe dashboard</li>
              <li>Go to developers - Dashboard</li>
              <li>Click {'"'}Add Endpoint{'"'}</li>
              <li>Paste the webhook URL</li>
              <li>
                Select the events you want to trigger this workflow on
              </li>
              <li>Save and copy signing secret</li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0 5 rounded">
                  {`{{stripe.amount}}`} - Payment amount
                </code>
              </li>
              <li>
                <code className="bg-background px-1 py-0 5 rounded">
                  {`{{stripe.currency}}`} - Currency code
                </code>
              </li>
              <li>
                <code className="bg-background px-1 py-0 5 rounded">
                  {`{{stripe.customerId}}`} - Customer ID
                </code>
              </li>
              <li>
                <code className="bg-background px-1 py-0 5 rounded">
                  {`{{json stripe}}`} - Full Event data as JSON
                </code>
              </li>
              <li>
                <code className="bg-background px-1 py-0 5 rounded">
                  {`{{stripe.eventType}}`} - Event type (e.g. payment_intent.succeeded)
                </code>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
