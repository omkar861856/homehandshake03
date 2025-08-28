import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Ayrshare API key from environment variables
    const apiKey = process.env.AYRSHARE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Ayrshare API key not configured" },
        { status: 500 }
      );
    }

    // Get profile key from query params (optional)
    const { searchParams } = new URL(request.url);
    const profileKey = searchParams.get("profileKey");
    const instagramDetails = searchParams.get("instagramDetails") === "true";

    // Prepare headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (profileKey) {
      headers["Profile-Key"] = profileKey;
    }

    // Build URL with query params
    const url = `https://api.ayrshare.com/api/user${
      instagramDetails ? "?instagramDetails=true" : ""
    }`;

    // Make request to Ayrshare API
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Failed to fetch user data from Ayrshare: ${response.status} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
