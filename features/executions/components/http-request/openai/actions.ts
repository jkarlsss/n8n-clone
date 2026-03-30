"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openaiChannel } from "@/inngest/channels/openai";

export type openaiToken = Realtime.Token<
  typeof openaiChannel, 
  ["status"]
>;

export async function fetchOpenaiRealtimeToken(): Promise<openaiToken> {

  const token = await getSubscriptionToken(inngest, {
    channel: openaiChannel(),
    topics: ["status"],
  });

  return token;
}