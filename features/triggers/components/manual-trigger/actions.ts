"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

export type manualTriggerToken = Realtime.Token<
  typeof manualTriggerChannel, 
  ["status"]
>;

export async function fetchManualTriggerRealtimeToken(): Promise<manualTriggerToken> {

  const token = await getSubscriptionToken(inngest, {
    channel: manualTriggerChannel(),
    topics: ["status"],
  });

  return token;
}