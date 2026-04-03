import { NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "../../../../inngest/utils";

// export async function POST(request: NextRequest) {
//   try {
//     const url = new URL(request.url);
//     const workflowId = url.searchParams.get("workflowId");

//     if (!workflowId) {
//       return NextResponse.json(
//         {
//           error: "Missing workflow Id",
//           success: false,
//         },
//         { status: 400 },
//       );
//     }

//     const body = await request.json();

//     const formData = {
//       formId: body.formId,
//       formTitle: body.formTitle,
//       responseId: body.responseId,
//       timestamp: body.timestamp,
//       respondentEmail: body.respondentEmail,
//       responses: body.responses,
//       raw: body,
//     };

//     // Trigger inngest job

//     await sendWorkflowExecution({
//       workflowId,
//       initialData: {
//         googleForm: formData,
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Google form trigger error:", error);
//     return NextResponse.json(
//       {
//         error: "Google form trigger error",
//         success: false,
//       },
//       { status: 500 },
//     );
//   }
// }

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Get workflowId from URL
  const searchParams = request.nextUrl.searchParams;
  const workflowId = searchParams.get("workflowId");

  if (!workflowId) {
    return NextResponse.json(
      { error: "Missing workflow Id", success: false },
      { status: 400 },
    );
  }

  const data = {
    recipient: body.entry[0].messaging[0].recipient,
    sender: body.entry[0].messaging[0].sender,
    timestamp: body.entry[0].messaging[0].timestamp,
    message: body.entry[0].messaging[0].message,
    raw: body,
  };

  await sendWorkflowExecution({
    workflowId,
    initialData: {
      recipient: data.recipient,
      sender: data.sender,
      timestamp: data.timestamp,
      message: data.message,
      messengerData: data,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(request: NextRequest) {
  const VERIFY_TOKEN = "123_token$@";

  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    console.log("Webhook verified");

    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}
