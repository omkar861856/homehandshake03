import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check environment variables
    const config = {
      timestamp: new Date().toISOString(),
      userId,
      environment: process.env.NODE_ENV,
      ayrshareApiKey: {
        exists: !!process.env.AYRSHARE_API_KEY,
        length: process.env.AYRSHARE_API_KEY?.length || 0,
        preview: process.env.AYRSHARE_API_KEY
          ? `${process.env.AYRSHARE_API_KEY.substring(
              0,
              8
            )}...${process.env.AYRSHARE_API_KEY.substring(
              process.env.AYRSHARE_API_KEY.length - 4
            )}`
          : "Not set",
      },
      clerk: {
        publishableKey: {
          exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          length: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length || 0,
        },
        secretKey: {
          exists: !!process.env.CLERK_SECRET_KEY,
          length: process.env.CLERK_SECRET_KEY?.length || 0,
        },
      },
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error in debug config route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
