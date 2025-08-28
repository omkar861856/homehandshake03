import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch the user data using clerkClient
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.id,
      emailAddresses: user.emailAddresses,
      firstName: user.firstName,
      lastName: user.lastName,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSignInAt: user.lastSignInAt,
    };

    return NextResponse.json({
      success: true,
      user: userData,
      metadataKeys: {
        public: Object.keys(user.publicMetadata || {}),
        private: Object.keys(user.privateMetadata || {}),
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
