import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { slackChannel } from "../../../../inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  content?: string;
  webhookUrl?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  context,
  step,
  nodeId,
  publish,
}) => {
  // TODO publish loading state for

  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    if (!data.variableName) {
      throw new NonRetriableError("Variable name is required.");
    }

    if (!data.content) {
      throw new NonRetriableError("Message content is required.");
    }

    if (!data.webhookUrl) {
      throw new NonRetriableError("Webhook URL is required.");
    }

    const rawContent = Handlebars.compile(data.content)(context);

    const content = decode(rawContent);

    const result = await step.run("slack-webhook", async () => {
      if (!data.variableName) {
        throw new NonRetriableError("Variable name is required.");
      }
      await ky.post(data.webhookUrl!, {
        json: {
          content: content.slice(0, 2000), // Slack has a max message length of 2000 characters
        },
      });

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;

  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
