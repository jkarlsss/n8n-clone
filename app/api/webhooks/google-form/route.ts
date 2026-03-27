import { NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          error: "Missing workflow Id",
          success: false,
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body
    };

    // Trigger inngest job
    
    await sendWorkflowExecution({ workflowId,
      initialData: {
        googleForm: formData
      }
     });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );

  } catch (error) {
    console.error("Google form trigger error:", error);
    return NextResponse.json(
      {
        error: "Google form trigger error",
        success: false,
      },
      { status: 500 },
    );
  }
}
