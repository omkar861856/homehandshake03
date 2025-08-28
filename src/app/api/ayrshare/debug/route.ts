import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      ayrshareApiKey: {
        exists: !!process.env.AYRSHARE_API_KEY,
        length: process.env.AYRSHARE_API_KEY?.length || 0,
      },
      privateKey: {
        exists: !!process.env.AYRSHARE_PRIVATE_KEY,
        length: process.env.AYRSHARE_PRIVATE_KEY?.length || 0,
        isValidPem: process.env.AYRSHARE_PRIVATE_KEY
          ? isRsaPem(normalizePem(process.env.AYRSHARE_PRIVATE_KEY))
          : false,
      },
      privateKeyBase64: {
        exists: !!process.env.AYRSHARE_PRIVATE_KEY_B64,
        length: process.env.AYRSHARE_PRIVATE_KEY_B64?.length || 0,
        isValidPem: false,
        decodedLength: 0,
      },
      repoFile: {
        exists: false,
        path: "",
        length: 0,
        isValidPem: false,
        content: "",
      },
      summary: {
        hasApiKey: false,
        hasValidPrivateKey: false,
        privateKeySource: "none",
      },
    };

    // Check base64 private key
    if (process.env.AYRSHARE_PRIVATE_KEY_B64) {
      try {
        const decoded = Buffer.from(
          process.env.AYRSHARE_PRIVATE_KEY_B64,
          "base64"
        ).toString("utf8");
        const normalized = normalizePem(decoded);
        diagnostics.privateKeyBase64.isValidPem = isRsaPem(normalized);
        diagnostics.privateKeyBase64.decodedLength = normalized.length;
      } catch (error) {
        console.error("Failed to decode base64 private key:", error);
      }
    }

    // Check repo file
    const keyPath = path.resolve(process.cwd(), "id-8ig3h-private-key (1).key");
    if (fs.existsSync(keyPath)) {
      try {
        const fileContent = fs.readFileSync(keyPath, "utf8");
        const normalized = normalizePem(fileContent);
        diagnostics.repoFile.exists = true;
        diagnostics.repoFile.path = keyPath;
        diagnostics.repoFile.length = fileContent.length;
        diagnostics.repoFile.isValidPem = isRsaPem(normalized);
        diagnostics.repoFile.content = fileContent.substring(0, 100) + "...";
      } catch (error) {
        console.error("Failed to read repo private key file:", error);
      }
    }

    // Determine summary
    diagnostics.summary.hasApiKey = diagnostics.ayrshareApiKey.exists;

    if (diagnostics.privateKey.isValidPem) {
      diagnostics.summary.hasValidPrivateKey = true;
      diagnostics.summary.privateKeySource = "env";
    } else if (diagnostics.privateKeyBase64.isValidPem) {
      diagnostics.summary.hasValidPrivateKey = true;
      diagnostics.summary.privateKeySource = "env_base64";
    } else if (diagnostics.repoFile.isValidPem) {
      diagnostics.summary.hasValidPrivateKey = true;
      diagnostics.summary.privateKeySource = "repo_file";
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to generate diagnostics" },
      { status: 500 }
    );
  }
}
