"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { geminiChannel } from "@/inngest/channels/gemini";

export type geminiToken = Realtime.Token<
  typeof geminiChannel, 
  ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<geminiToken> {

  const token = await getSubscriptionToken(inngest, {
    channel: geminiChannel(),
    topics: ["status"],
  });

  return token;
}