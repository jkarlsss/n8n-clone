import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { httpRequestChannel } from "../../../../../inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2)

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  step,
  nodeId,
  publish
}) => {
  // TODO publish loading state for http request

  try {
    
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading"
    })
  )

  if (!data?.endpoint) {
    throw new NonRetriableError("Endpoint not configured.");
  }

  if (!data?.variableName) {
    throw new NonRetriableError("Variable name not configured.");
  }

  if (!data?.method) {
    throw new NonRetriableError("Method not configured.");
  }
  const result = await step.run("http-request", async () => {
    const endPoint = Handlebars.compile(data.endpoint)(context);
    const method = data.method;

    const options: KyOptions = {
      method,
    };

    if(["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body || "{}")(context);
      JSON.parse(resolved);
      options.body = resolved;
      options.headers = { "Content-Type": "application/json" };
    }

    const response = await ky(endPoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json") ? await response.json() : await response.text();
  
    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      }
    }


    return {
      ...context,
      [data.variableName]: responsePayload
    };
  });

  // TODO publish result
  await publish(httpRequestChannel().status({
    nodeId,
    status: "success"
  }))

  return result;
  
  } catch (error) {
    await publish(httpRequestChannel().status({
      nodeId,
      status: "error"
    }))

    throw error;
  }
};
