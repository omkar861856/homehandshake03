import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Get environment variables
    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Get profile key from request headers or body
    const profileKey = request.headers.get("Profile-Key") || body.profileKey;
    if (!profileKey) {
      return NextResponse.json(
        { error: "Profile-Key is required" },
        { status: 400 }
      );
    }

    // Prepare headers for Ayrshare API
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Profile-Key": profileKey,
    };

    // Make request to Ayrshare post endpoint
    const response = await fetch("https://api.ayrshare.com/api/post", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return the response from Ayrshare
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
