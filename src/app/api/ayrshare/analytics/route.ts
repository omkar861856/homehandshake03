import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get environment variables
    const ayrshareApiKey = process.env.AYRSHARE_API_KEY;
    if (!ayrshareApiKey) {
      return NextResponse.json(
        { error: "Missing Ayrshare API Key" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { platforms, profileKey, daily = false, quarters = 4 } = body;

    if (!profileKey) {
      return NextResponse.json(
        { error: "Profile key is required" },
        { status: 400 }
      );
    }

    // Default platforms if none specified
    const defaultPlatforms = [
      "bluesky",
      "facebook",
      "gmb",
      "instagram",
      "linkedin",
      "pinterest",
      "reddit",
      "snapchat",
      "threads",
      "tiktok",
      "twitter",
      "youtube",
    ];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ayrshareApiKey}`,
    };

    // Add profile key if provided
    if (profileKey) {
      headers["Profile-Key"] = profileKey;
    }

    const analyticsResponse = await fetch(
      "https://api.ayrshare.com/api/analytics/social",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          platforms: platforms || defaultPlatforms,
          daily,
          quarters,
        }),
      }
    );

    if (!analyticsResponse.ok) {
      const errorData = await analyticsResponse.json();
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch analytics: ${analyticsResponse.status} ${analyticsResponse.statusText}`,
        },
        { status: analyticsResponse.status }
      );
    }

    const analyticsData = await analyticsResponse.json();

    return NextResponse.json(analyticsData);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
