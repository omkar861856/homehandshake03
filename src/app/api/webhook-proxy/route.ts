import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const webhookUrl =
      "https://n8n.srv834400.hstgr.cloud/webhook-test/4d8f013f-2026-45d0-be1d-b915e16de3fa";

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook URL is not configured" },
        { status: 500 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Forward the request to the external webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    // Get the response from the webhook
    const responseData = await response.text();

    // Return the response from the webhook
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("Webhook proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward request to webhook" },
      { status: 500 }
    );
  }
}
