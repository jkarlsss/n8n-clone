"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { anthropicChannel } from "../../../../inngest/channels/anthropic";

export type anthropicToken = Realtime.Token<
  typeof anthropicChannel,
  ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<anthropicToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: anthropicChannel(),
    topics: ["status"],
  });

  return token;
}
