"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { messengerTriggerChannel } from "../../../../inngest/channels/messenger-trigger";

export type MessengerTriggerToken = Realtime.Token<
  typeof messengerTriggerChannel,
  ["status"]
>;

export async function fetchMessengerTriggerRealtimeToken(): Promise<
  MessengerTriggerToken
> {
  const token = await getSubscriptionToken(inngest, {
    channel: messengerTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
