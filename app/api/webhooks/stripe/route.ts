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

    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object
    };

    // Trigger inngest job
    
    await sendWorkflowExecution({ workflowId,
      initialData: {
        stripe: stripeData
      }
     });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );

  } catch (error) {
    console.error("Stripe trigger error:", error);
    return NextResponse.json(
      {
        error: "Stripe trigger error",
        success: false,
      },
      { status: 500 },
    );
  }
}
