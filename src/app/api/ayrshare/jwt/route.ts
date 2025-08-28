import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

function normalizePem(pem: string): string {
  return (pem || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();
}

function isRsaPem(pem: string): boolean {
  const s = (pem || "").toString();
  return (
    s.includes("-----BEGIN RSA PRIVATE KEY-----") &&
    s.includes("-----END RSA PRIVATE KEY-----")
  );
}

interface JwtPayload {
  domain: string;
  profileKey: string;
  iat: number;
  exp: number;
  allowedSocial?: string[];
  redirect?: string;
  logout?: boolean;
  email?: string;
  verify?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ayrshare config
    const ayrshareApiKey = process.env.AYRSHARE_API_KEY;
    const defaultPrivateKey = process.env.AYRSHARE_PRIVATE_KEY;
    const privateKeyFromBase64 = process.env.AYRSHARE_PRIVATE_KEY_B64;
    let domain = "id-8ig3h";
    let privateKey = defaultPrivateKey;
    let privateKeySource = "env"; // track where the key came from

    console.log("Environment variables check:");
    console.log("- AYRSHARE_API_KEY exists:", !!ayrshareApiKey);
    console.log("- AYRSHARE_PRIVATE_KEY exists:", !!defaultPrivateKey);
    console.log("- AYRSHARE_PRIVATE_KEY_B64 exists:", !!privateKeyFromBase64);
    if (defaultPrivateKey) {
      console.log("- Private key length:", defaultPrivateKey.length);
      console.log(
        "- Private key starts with:",
        defaultPrivateKey.substring(0, 50)
      );
      console.log(
        "- Private key ends with:",
        defaultPrivateKey.substring(defaultPrivateKey.length - 50)
      );
    }

    // Normalize and validate env-provided key (if not already)
    if (privateKey) {
      console.log(
        "Before normalization - Private key length:",
        privateKey.length
      );
      privateKey = normalizePem(privateKey);
      console.log(
        "After normalization - Private key length:",
        privateKey.length
      );
      console.log("Is valid RSA PEM:", isRsaPem(privateKey));
    }

    // If a base64 private key is provided as env var, prefer decoding it when no direct key is set
    if ((!privateKey || privateKey.length === 0) && privateKeyFromBase64) {
      try {
        privateKey = Buffer.from(privateKeyFromBase64, "base64").toString(
          "utf8"
        );
        privateKey = normalizePem(privateKey);
        privateKeySource = "env_base64";
      } catch {
        // fall back to undefined; will be caught by missing config below
      }
    }

    // If still no private key, attempt to read from repo file
    if (!privateKey || privateKey.length === 0) {
      const keyPath = path.resolve(
        process.cwd(),
        "id-8ig3h-private-key (1).key"
      );
      if (fs.existsSync(keyPath)) {
        try {
          const fileKey = fs.readFileSync(keyPath, "utf8");
          const loaded = normalizePem(fileKey);
          if (isRsaPem(loaded)) {
            privateKey = loaded;
            privateKeySource = "repo_file";
            // debug
            console.debug(`Loaded RSA private key from repo: ${keyPath}`);
          } else {
            console.warn(
              `PEM loaded from repo is not a valid RSA PEM: ${keyPath}`
            );
          }
        } catch {
          // ignore and continue to error below
        }
      }
    }

    if (!ayrshareApiKey) {
      return NextResponse.json(
        { error: "Ayrshare API key not configured" },
        { status: 500 }
      );
    }

    if (!privateKey || !isRsaPem(privateKey)) {
      return NextResponse.json(
        {
          error: "Ayrshare private key not configured or invalid PEM",
          privateKeySource,
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("JWT API request body:", body);
    console.log("JWT API request body type check:");
    console.log("- expiresIn value:", body.expiresIn);
    console.log("- expiresIn type:", typeof body.expiresIn);
    console.log("- expiresIn parsed as number:", Number(body.expiresIn));
    const { profileKey } = body;

    if (!profileKey) {
      return NextResponse.json(
        { error: "Profile key is required" },
        { status: 400 }
      );
    }

    // Optional overrides from request body
    if (body.domain) {
      domain = String(body.domain);
    }
    if (body.privateKey) {
      if (body.base64 === true || body.base64 === "true") {
        try {
          privateKey = Buffer.from(String(body.privateKey), "base64").toString(
            "utf8"
          );
        } catch {
          return NextResponse.json(
            { error: "Invalid base64 privateKey", privateKeySource },
            { status: 400 }
          );
        }
      } else {
        privateKey = String(body.privateKey);
      }
      privateKey = normalizePem(privateKey);
      if (!isRsaPem(privateKey)) {
        return NextResponse.json(
          { error: "Invalid RSA private key PEM in body", privateKeySource },
          { status: 400 }
        );
      }
    }

    // Calculate expiry from expiresIn (default 5 minutes)
    const expiresInMinutes = Math.max(
      1,
      Math.min(2880, Number(body.expiresIn ?? 5))
    );
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInMinutes * 60;

    console.log("JWT timing details:");
    console.log("- Requested expiresIn:", body.expiresIn, "minutes");
    console.log("- Calculated expiresIn:", expiresInMinutes, "minutes");
    console.log("- Issued at (iat):", new Date(iat * 1000).toISOString());
    console.log("- Expires at (exp):", new Date(exp * 1000).toISOString());
    console.log("- Current time:", new Date().toISOString());
    console.log("- Token will be valid for:", expiresInMinutes, "minutes");

    // Create JWT payload
    const payload: JwtPayload = {
      domain,
      profileKey,
      iat,
      exp,
    };

    // Optional fields
    if (body.allowedSocial) payload.allowedSocial = body.allowedSocial;
    if (body.redirect) payload.redirect = body.redirect;
    if (typeof body.logout !== "undefined") payload.logout = body.logout;
    if (body.email) payload.email = body.email;
    if (typeof body.verify !== "undefined") payload.verify = body.verify;

    // Generate token
    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

    // Generate SSO URL
    const ssoUrl = `https://profile.ayrshare.com/social-accounts?domain=${domain}&jwt=${token}`;

    // Optional verification status
    let verificationStatus: string | null = null;
    if (body.verify) {
      try {
        jwt.verify(token, privateKey, { algorithms: ["RS256"] });
        verificationStatus = "verified";
      } catch {
        verificationStatus = "verification_failed";
      }
    }

    const response = {
      token,
      ssoUrl,
      expiresIn: expiresInMinutes * 60,
      domain,
      verificationStatus,
    };

    console.log("JWT API returning response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("JWT generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate JWT" },
      { status: 500 }
    );
  }
}
