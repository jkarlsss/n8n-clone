import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  step,
  nodeId
}) => {
  // TODO publish loading state for http request

  if (!data?.endpoint) {
    throw new NonRetriableError("Endpoint not configured.");
  }

  if (!data?.variableName) {
    throw new NonRetriableError("Variable name not configured.");
  }

  const variableName = data.variableName;

  const result = await step.run("http-request", async () => {
    const endPoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = {
      method,
    };

    if(["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
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
      [variableName]: responsePayload
    };
  });

  // TODO publish result

  return result;
};
